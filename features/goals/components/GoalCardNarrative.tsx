"use client";

import { useEffect, useState } from "react";

type GoalStatus = "completed" | "archived";

const inflight = new Map<string, Promise<string>>();
const done = new Map<string, string>();

function safeTrim(v: unknown) {
  return String(v ?? "").trim();
}

function fallbackNarrative(
  actionTaken: string | null | undefined,
  title: string
): string {
  const t = safeTrim(actionTaken);
  if (t) {
    const normalized = t
      .replace(/\bmy\b/gi, "your")
      .replace(/\bi\b/gi, "you");
    let result = normalized.trim();
    result = result.charAt(0).toUpperCase() + result.slice(1);

    if (!/[.!?]$/.test(result)) result += ".";

    return result;
  }
  return `${title.charAt(0).toUpperCase() + title.slice(1)}.`;
}

async function loadSummary(goalId: string, fb: string): Promise<string> {
  if (done.has(goalId)) return done.get(goalId)!;
  const existing = inflight.get(goalId);
  if (existing) return existing;

  const p = (async () => {
    try {
      const res = await fetch("/api/ai/completion-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal_id: goalId }),
      });

      const json = await res.json().catch(() => ({}));
      const text = safeTrim(json?.content);

      if (!res.ok || !text) {
        done.set(goalId, fb);
        return fb;
      }

      done.set(goalId, text);
      return text;
    } catch {
      done.set(goalId, fb);
      return fb;
    } finally {
      inflight.delete(goalId);
    }
  })();

  inflight.set(goalId, p);
  return p;
}

export function GoalCardNarrative({
  goalId,
  status,
  title,
  actionTaken,
  easierHarder,
}: {
  goalId: string;
  status: GoalStatus;
  title: string;
  actionTaken: string | null | undefined;
  easierHarder: string | null | undefined;
}) {
  const fb = fallbackNarrative(actionTaken, title);
  const [summary, setSummary] = useState(fb);

  useEffect(() => {
    if (status !== "completed") {
      setSummary(fb);
      return;
    }

    let cancelled = false;

    if (done.has(goalId)) {
      setSummary(done.get(goalId)!);
      return;
    }

    loadSummary(goalId, fb).then((text) => {
      if (!cancelled) setSummary(text);
    });

    return () => {
      cancelled = true;
    };
  }, [goalId, status, fb]);

  return (
    <>
      <p className="text-sm leading-relaxed text-foreground/85">
        {summary}
      </p>

      {easierHarder ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {safeTrim(easierHarder)}
        </p>
      ) : null}
    </>
  );
}