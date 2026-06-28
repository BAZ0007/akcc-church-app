import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";
import PDFDocument from "pdfkit";
import { resend, FROM_ADDRESS } from "@/lib/email";

export type GivingStatementPayload = {
  userId: string;
  year: number;
  memberEmail: string;
  memberName: string;
};

type GivingRow = {
  amount_cents: number;
  fund: string;
  paid_at: string | null;
  created_at: string;
};

const FUND_LABELS: Record<string, string> = {
  general: "General Fund",
  building: "Building Fund",
  missions: "Missions Fund",
};

function formatAUD(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Australia/Melbourne",
  });
}

async function buildPdf(
  memberName: string,
  memberEmail: string,
  year: number,
  givings: GivingRow[]
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const PRIMARY = "#2479C2";
    const INK = "#173A5E";
    const MUTED = "#8194A6";
    const BORDER = "#DCE7F0";

    // ── Header ───────────────────────────────────────────────────────────────
    doc
      .fontSize(20)
      .fillColor(PRIMARY)
      .font("Helvetica-Bold")
      .text("Australian Kachin Christian Church", { align: "center" });

    doc
      .moveDown(0.3)
      .fontSize(13)
      .fillColor(INK)
      .font("Helvetica-Bold")
      .text(`Year-End Giving Statement — ${year}`, { align: "center" });

    doc
      .moveDown(0.2)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor(BORDER)
      .stroke();

    // ── Member info ──────────────────────────────────────────────────────────
    doc
      .moveDown(0.8)
      .fontSize(10)
      .fillColor(MUTED)
      .font("Helvetica")
      .text("Prepared for:");

    doc
      .fontSize(12)
      .fillColor(INK)
      .font("Helvetica-Bold")
      .text(memberName);

    doc
      .fontSize(10)
      .fillColor(MUTED)
      .font("Helvetica")
      .text(memberEmail);

    doc.moveDown(1);

    // ── Donations table ──────────────────────────────────────────────────────
    if (givings.length === 0) {
      doc
        .fontSize(11)
        .fillColor(MUTED)
        .font("Helvetica")
        .text(`No completed donations recorded for ${year}.`);
    } else {
      // Table header
      const colDate = 50;
      const colFund = 180;
      const colAmount = 445;
      const rowH = 22;
      const tableTop = doc.y;

      doc
        .rect(50, tableTop, 495, rowH)
        .fillColor("#EBF4FF")
        .fill();

      doc
        .fontSize(10)
        .fillColor(INK)
        .font("Helvetica-Bold")
        .text("Date", colDate, tableTop + 6, { width: 120 })
        .text("Fund", colFund, tableTop + 6, { width: 200 })
        .text("Amount", colAmount, tableTop + 6, { width: 100, align: "right" });

      doc.moveDown(0);
      let y = tableTop + rowH;
      let total = 0;

      givings.forEach((g, i) => {
        const dateStr = formatDate(g.paid_at ?? g.created_at);
        const fundStr = FUND_LABELS[g.fund] ?? g.fund;
        const amtStr = formatAUD(g.amount_cents);
        total += g.amount_cents;

        if (i % 2 === 1) {
          doc.rect(50, y, 495, rowH).fillColor("#F7FBFF").fill();
        }

        doc
          .fontSize(10)
          .fillColor(INK)
          .font("Helvetica")
          .text(dateStr, colDate, y + 6, { width: 120 })
          .text(fundStr, colFund, y + 6, { width: 200 })
          .text(amtStr, colAmount, y + 6, { width: 100, align: "right" });

        y += rowH;
      });

      // Total row
      doc
        .moveTo(50, y)
        .lineTo(545, y)
        .strokeColor(BORDER)
        .stroke();

      y += 8;
      doc
        .fontSize(11)
        .fillColor(INK)
        .font("Helvetica-Bold")
        .text("Total", colDate, y)
        .text(formatAUD(total), colAmount, y, { width: 100, align: "right" });
    }

    // ── Footer ───────────────────────────────────────────────────────────────
    doc
      .moveDown(3)
      .fontSize(9)
      .fillColor(MUTED)
      .font("Helvetica")
      .text(
        "This statement is provided for your personal records. " +
          "Please consult a tax professional regarding any tax deductibility claims.",
        { align: "center" }
      );

    doc
      .moveDown(0.5)
      .text(`Generated ${new Date().toLocaleDateString("en-AU")} · AKCC · akcc.org.au`, {
        align: "center",
      });

    doc.end();
  });
}

export const givingStatement = task({
  id: "giving-statement",
  maxDuration: 120,
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 3000,
    maxTimeoutInMs: 20000,
    factor: 2,
  },
  run: async (payload: GivingStatementPayload) => {
    const { userId, year, memberEmail, memberName } = payload;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const yearStart = `${year}-01-01T00:00:00+00:00`;
    const yearEnd = `${year + 1}-01-01T00:00:00+00:00`;

    const { data: givings, error } = await supabase
      .from("givings")
      .select("amount_cents, fund, paid_at, created_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .gte("paid_at", yearStart)
      .lt("paid_at", yearEnd)
      .order("paid_at", { ascending: true });

    if (error) throw error;

    const rows: GivingRow[] = givings ?? [];

    const pdfBuffer = await buildPdf(memberName, memberEmail, year, rows);

    const safeNameHtml = memberName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const { error: sendError } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: memberEmail,
      subject: `Your ${year} Giving Statement — AKCC`,
      html: `
        <p>Hi ${safeNameHtml},</p>
        <p>Please find your <strong>${year} year-end giving statement</strong> from Australian Kachin Christian Church attached to this email.</p>
        <p>Thank you for your generous support this year. God bless you!</p>
        <hr />
        <p style="font-size:12px;color:#8194A6">Australian Kachin Christian Church</p>
      `,
      attachments: [
        {
          filename: `akcc-giving-statement-${year}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (sendError) throw new Error(`Resend error: ${JSON.stringify(sendError)}`);

    console.log(`[giving-statement] Sent ${year} statement to ${memberEmail} (${rows.length} donations).`);
    return { ok: true, donations: rows.length, memberEmail, year };
  },
});
