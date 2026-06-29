"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";

type Labels = {
  submitRequest: string;
  yourRequest: string;
  requestPlaceholder: string;
  nameOptional: string;
  sharePublicly: string;
  sharePrivately: string;
  submit: string;
  thankYou: string;
  error: string;
};

export function PrayerForm({ labels, onSubmitted }: { labels: Labels; onSubmitted?: () => void }) {
  const [request, setRequest] = useState("");
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/prayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request, name: name || null, is_public: isPublic }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? labels.error);
      setStatus("done");
      onSubmitted?.();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : labels.error);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p
        role="status"
        className="rounded-[var(--r-md)] bg-[var(--primary-tint)] border border-[var(--primary)] px-4 py-3 text-sm text-[var(--primary-deep)]"
      >
        {labels.thankYou}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        label={labels.yourRequest}
        placeholder={labels.requestPlaceholder}
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        rows={5}
        required
        minLength={10}
        maxLength={1000}
        disabled={status === "sending"}
      />

      <Input
        label={labels.nameOptional}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        disabled={status === "sending"}
      />

      <fieldset className="border-0 p-0 m-0">
        <legend className="sr-only">Visibility</legend>
        <div className="flex flex-col gap-2">
          {[
            { value: false, label: labels.sharePrivately },
            { value: true, label: labels.sharePublicly },
          ].map(({ value, label }) => (
            <label key={String(value)} className="flex items-center gap-2 text-sm text-[var(--body)] cursor-pointer">
              <input
                type="radio"
                name="is_public"
                checked={isPublic === value}
                onChange={() => setIsPublic(value)}
                disabled={status === "sending"}
                className="accent-[var(--primary)]"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {status === "error" && (
        <p role="alert" className="text-sm text-red-600">{errorMsg}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={request.length < 10 || status === "sending"}
        aria-busy={status === "sending"}
      >
        {status === "sending" ? "Submitting…" : labels.submit}
      </Button>
    </form>
  );
}
