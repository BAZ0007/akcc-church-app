"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

const t = {
  createEvent: "Create an Event",
  eventTitle: "Event title",
  eventDate: "Start date & time",
  eventEnds: "End date & time (optional)",
  eventLocation: "Location",
  eventCapacity: "Capacity (optional)",
  eventDescription: "Description (optional)",
  publish: "Publish",
  save: "Save as draft",
  cancel: "Cancel",
  loading: "Saving…",
  error: "Something went wrong. Please try again.",
  required: "This field is required.",
};

interface FormErrors {
  title?: string;
  starts_at?: string;
  form?: string;
}

export default function AdminNewEventPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!title.trim()) e.title = t.required;
    if (!startsAt) e.starts_at = t.required;
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
      const body: Record<string, unknown> = {
        title: title.trim(),
        location: location.trim() || undefined,
        starts_at: new Date(startsAt).toISOString(),
        published,
      };
      if (endsAt) body.ends_at = new Date(endsAt).toISOString();
      if (capacity) body.capacity = parseInt(capacity, 10);
      if (description.trim()) body.description = description.trim();

      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErrors({ form: json.error ?? t.error });
        return;
      }
      router.push("/admin/events");
    } catch {
      setErrors({ form: t.error });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink)]">{t.createEvent}</h1>
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
              label={t.eventTitle}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              disabled={loading}
            />
            <Input
              label={t.eventLocation}
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
            <Input
              label={t.eventDate}
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              error={errors.starts_at}
              disabled={loading}
            />
            <Input
              label={t.eventEnds}
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              disabled={loading}
            />
            <Input
              label={t.eventCapacity}
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              disabled={loading}
            />
            <Textarea
              label={t.eventDescription}
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
                onClick={() => router.push("/admin/events")}
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
