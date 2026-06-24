"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

const t = {
  postSermon: "Post a Sermon",
  sermonYoutubeUrl: "YouTube URL",
  sermonTitle: "Sermon title",
  sermonSpeaker: "Speaker",
  sermonDate: "Date",
  sermonSeries: "Series (optional)",
  description: "Description (optional)",
  publish: "Publish",
  save: "Save as draft",
  cancel: "Cancel",
  savedSuccessfully: "Saved successfully.",
  loading: "Saving…",
  error: "Something went wrong. Please try again.",
  required: "This field is required.",
  invalidUrl: "Please enter a valid YouTube URL.",
};

interface FormErrors {
  youtube_url?: string;
  title?: string;
  speaker?: string;
  sermon_date?: string;
  form?: string;
}

export default function AdminNewSermonPage() {
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [sermonDate, setSermonDate] = useState("");
  const [series, setSeries] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!youtubeUrl.trim()) e.youtube_url = t.required;
    else if (!youtubeUrl.includes("youtu")) e.youtube_url = t.invalidUrl;
    if (!title.trim()) e.title = t.required;
    if (!speaker.trim()) e.speaker = t.required;
    if (!sermonDate) e.sermon_date = t.required;
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
      const res = await fetch("/api/sermons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          youtube_url: youtubeUrl.trim(),
          title: title.trim(),
          speaker: speaker.trim(),
          sermon_date: sermonDate,
          series: series.trim() || undefined,
          description: description.trim() || undefined,
          published,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErrors({ form: json.error ?? t.error });
        return;
      }
      router.push("/admin/sermons");
    } catch {
      setErrors({ form: t.error });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink)]">{t.postSermon}</h1>
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
              label={t.sermonYoutubeUrl}
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              error={errors.youtube_url}
              disabled={loading}
            />
            <Input
              label={t.sermonTitle}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              disabled={loading}
            />
            <Input
              label={t.sermonSpeaker}
              type="text"
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              error={errors.speaker}
              disabled={loading}
            />
            <Input
              label={t.sermonDate}
              type="date"
              value={sermonDate}
              onChange={(e) => setSermonDate(e.target.value)}
              error={errors.sermon_date}
              disabled={loading}
            />
            <Input
              label={t.sermonSeries}
              type="text"
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              disabled={loading}
            />
            <Textarea
              label={t.description}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />

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
                onClick={() => router.push("/admin/sermons")}
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
