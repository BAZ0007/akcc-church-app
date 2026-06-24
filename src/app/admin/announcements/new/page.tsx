"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

const t = {
  sendAnnouncement: "Send an Announcement",
  announcementTitle: "Announcement title",
  announcementBody: "Message",
  expiresAt: "Expires at (optional)",
  pinned: "Pin to top",
  publish: "Publish",
  save: "Save as draft",
  cancel: "Cancel",
  loading: "Saving…",
  error: "Something went wrong. Please try again.",
  required: "This field is required.",
};

interface FormErrors {
  title?: string;
  body?: string;
  form?: string;
}

export default function AdminNewAnnouncementPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [published, setPublished] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!title.trim()) e.title = t.required;
    if (!body.trim()) e.body = t.required;
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setErrors({});
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const payload: Record<string, unknown> = {
        title: title.trim(),
        body: body.trim(),
        pinned,
        published,
      };
      if (expiresAt) payload.expires_at = new Date(expiresAt).toISOString();

      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErrors({ form: json.error ?? t.error });
        return;
      }
      router.push("/admin/announcements");
    } catch {
      setErrors({ form: t.error });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink)]">{t.sendAnnouncement}</h1>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {errors.form && (
              <div role="alert" className="rounded-[var(--r-md)] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {errors.form}
              </div>
            )}

            <Input
              label={t.announcementTitle}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              disabled={loading}
            />
            <Textarea
              label={t.announcementBody}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              error={errors.body}
              disabled={loading}
              className="min-h-[160px]"
            />
            <Input
              label={t.expiresAt}
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={loading}
            />

            {/* Pinned toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  disabled={loading}
                />
                <div className="w-10 h-6 rounded-full bg-[var(--border)] peer-checked:bg-[var(--accent)] transition-colors" />
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm font-medium text-[var(--ink)]">{t.pinned}</span>
            </label>

            {/* Published toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  disabled={loading}
                />
                <div className="w-10 h-6 rounded-full bg-[var(--border)] peer-checked:bg-[var(--primary)] transition-colors" />
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm font-medium text-[var(--ink)]">{t.publish}</span>
            </label>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? t.loading : (published ? t.publish : t.save)}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/announcements")}
                disabled={loading}
              >
                {t.cancel}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
