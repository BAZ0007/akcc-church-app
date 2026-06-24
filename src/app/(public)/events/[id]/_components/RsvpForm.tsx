"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

type RsvpStatus = "attending" | "maybe" | "not_attending";

interface ExistingRsvp {
  id: string;
  status: RsvpStatus;
  guest_count: number;
  note: string | null;
}

interface RsvpFormProps {
  eventId: string;
  isLoggedIn: boolean;
  existingRsvp: ExistingRsvp | null;
  t: {
    rsvp: string;
    rsvpConfirmed: string;
    cancelRsvp: string;
    signInToRsvp: string;
    attending: string;
    maybe: string;
    notAttending: string;
    guests: string;
    note: string;
    submit: string;
    updateRsvp: string;
    error: string;
    loading: string;
    currentStatus: string;
  };
}

const STATUS_LABELS: Record<RsvpStatus, string> = {
  attending: "Attending",
  maybe: "Maybe",
  not_attending: "Not attending",
};

export function RsvpForm({ eventId, isLoggedIn, existingRsvp, t }: RsvpFormProps) {
  const [status, setStatus] = useState<RsvpStatus>(existingRsvp?.status ?? "attending");
  const [guestCount, setGuestCount] = useState(existingRsvp?.guest_count ?? 1);
  const [note, setNote] = useState(existingRsvp?.note ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [currentRsvp, setCurrentRsvp] = useState<ExistingRsvp | null>(existingRsvp);
  const [editing, setEditing] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm text-[var(--body)]">
        <Link
          href="/login"
          className="font-medium text-[var(--primary)] hover:text-[var(--primary-deep)] underline-offset-2 hover:underline"
        >
          {t.signInToRsvp}
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, guest_count: guestCount, note: note || null }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? t.error);
        return;
      }
      const saved = await res.json();
      setCurrentRsvp(saved);
      setSubmitted(true);
      setEditing(false);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? t.error);
        return;
      }
      setCurrentRsvp(null);
      setSubmitted(false);
      setEditing(false);
      setStatus("attending");
      setGuestCount(1);
      setNote("");
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  if (currentRsvp && !editing) {
    return (
      <div className="space-y-3">
        <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--primary-tint)] px-4 py-3 text-sm">
          <p className="font-semibold text-[var(--primary)]">{t.rsvpConfirmed}</p>
          <p className="text-[var(--body)] mt-0.5">
            {STATUS_LABELS[currentRsvp.status]}{currentRsvp.guest_count > 1 ? ` · ${currentRsvp.guest_count} guests` : ""}
          </p>
          {currentRsvp.note && (
            <p className="text-[var(--muted)] mt-1 italic">{currentRsvp.note}</p>
          )}
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600">{error}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setEditing(true); setStatus(currentRsvp.status); setGuestCount(currentRsvp.guest_count); setNote(currentRsvp.note ?? ""); }}
            disabled={loading}
          >
            {t.updateRsvp}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
            {loading ? t.loading : t.cancelRsvp}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      )}

      {/* Status button group */}
      <div>
        <p className="text-sm font-medium text-[var(--ink)] mb-2">{t.rsvp}</p>
        <div role="group" aria-label={t.rsvp} className="flex flex-wrap gap-2">
          {(["attending", "maybe", "not_attending"] as RsvpStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={[
                "min-h-[44px] px-4 rounded-[var(--r-md)] text-sm font-medium border transition-colors",
                status === s
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "bg-[var(--card)] text-[var(--body)] border-[var(--border)] hover:bg-[var(--surface)]",
              ].join(" ")}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Guest count */}
      <Select
        label={t.guests}
        value={String(guestCount)}
        onChange={(e) => setGuestCount(Number(e.target.value))}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </Select>

      {/* Note */}
      <Textarea
        label={t.note}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Any notes…"
        className="min-h-[80px]"
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? t.loading : (submitted || currentRsvp) ? t.updateRsvp : t.submit}
        </Button>
        {editing && (
          <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={loading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
