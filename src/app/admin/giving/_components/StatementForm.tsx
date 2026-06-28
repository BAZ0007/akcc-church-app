"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

type Member = { id: string; full_name: string; email: string };

type Props = {
  members: Member[];
  years: number[];
  labels: {
    selectMember: string;
    statementYear: string;
    sendStatement: string;
    confirmPrompt: string;
    confirm: string;
    cancel: string;
    successMsg: string;
    errorMsg: string;
  };
};

type UIState = "idle" | "confirming" | "sending" | "done" | "error";

export function StatementForm({ members, years, labels }: Props) {
  const [memberId, setMemberId] = useState(members[0]?.id ?? "");
  const [year, setYear] = useState(years[0] ?? new Date().getFullYear() - 1);
  const [uiState, setUiState] = useState<UIState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const selectedMember = members.find((m) => m.id === memberId);

  async function handleConfirm() {
    setUiState("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/giving/statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: memberId, year }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Request failed");
      }
      setUiState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : labels.errorMsg);
      setUiState("error");
    }
  }

  if (uiState === "done") {
    return (
      <p
        role="status"
        className="rounded-[var(--r-md)] bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800"
      >
        {labels.successMsg}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={labels.selectMember}
          value={memberId}
          onChange={(e) => { setMemberId(e.target.value); setUiState("idle"); }}
          disabled={uiState === "sending"}
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name} — {m.email}
            </option>
          ))}
        </Select>

        <Select
          label={labels.statementYear}
          value={String(year)}
          onChange={(e) => { setYear(Number(e.target.value)); setUiState("idle"); }}
          disabled={uiState === "sending"}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>

      {uiState === "confirming" ? (
        <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 space-y-3">
          <p className="text-sm text-[var(--ink)]">
            {labels.confirmPrompt
              .replace("{name}", selectedMember?.full_name ?? "")
              .replace("{year}", String(year))}
          </p>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleConfirm}>
              {labels.confirm}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setUiState("idle")}>
              {labels.cancel}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={() => setUiState("confirming")}
          disabled={!memberId || uiState === "sending"}
          aria-busy={uiState === "sending"}
        >
          {uiState === "sending" ? "Sending…" : labels.sendStatement}
        </Button>
      )}

      {uiState === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {errorMsg || labels.errorMsg}
        </p>
      )}
    </div>
  );
}
