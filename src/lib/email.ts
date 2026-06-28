import { Resend } from "resend";

if (typeof window !== "undefined") {
  throw new Error("src/lib/email.ts must only be imported server-side.");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL ?? "AKCC <no-reply@akcc.org.au>";
