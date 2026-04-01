"use client";

import { useEffect, useState } from "react";

type GoalStatus = "completed" | "archived";

const inflight = new Map<string, Promise<string>>();
const done = new Map<string, string>();

function extractWhatActuallyHappened(full: string): string | null {
  const normalized = full.replace(/\r\n/g, "\n");
  const marker = "What actually happened:";
  const start = normalized.indexOf(marker);
  if (start === -1) return null;
  let rest = normalized.slice(start + marker.length);
  const stopTags = [
    "\nWhat this shows about me:",
    "\nWhat helped the most:",
    "\nWhat got in the way:",
    "\nA natural next direction:",
    "What this shows about me:",
    "What helped the most:",
    "What got in the way:",
    "A natural next direction:",
  ];
  let end = rest.length;
  for (const tag of stopTags) {
    const i = rest.indexOf(tag);
    if (i !== -1 && i < end) end = i;
  }
  const out = rest.slice(0, end).trim();
  return out || null;
}

function fallbackNarrative(
  actionTaken: string | null | undefined,
  title: string
): string {
  const t = String(actionTaken ?? "").trim();
  if (t) return `You ${t}`;
  return title;
}

/** Display-only: first 2 sentences max, drop one if they overlap in meaning. */
function splitSentences(s: string): string[] {
  const t = s.replace(/\s+/g, " ").trim();
  if (!t) return [];
  const parts = t.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
  return parts.length ? parts : [t];
}

function wordSet(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1)
  );
}

function jaccardWords(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function dedupeSimilarPair(first: string, second: string): string[] {
  const n0 = first.trim();
  const n1 = second.trim();
  if (!n1) return [n0];
  const A = wordSet(n0);
  const B = wordSet(n1);
  const sim = jaccardWords(A, B);
  const compact0 = n0.toLowerCase().replace(/[^a-z0-9]/g, "");
  const compact1 = n1.toLowerCase().replace(/[^a-z0-9]/g, "");
  const nested =
    compact0.length >= 12 &&
    compact1.length >= 12 &&
    (compact0.includes(compact1) || compact1.includes(compact0));
  if (sim >= 0.55 || nested) {
    return n0.length <= n1.length ? [n0] : [n1];
  }
  return [n0, n1];
}

function stripTrailingPunc(s: string): string {
  return s.replace(/[.!?]+$/g, "").trim();
}

function sentenceToClause(s: string): string {
  let t = stripTrailingPunc(s).trim();
  t = t.replace(/^I(?:'ve|'m|\s+am)?\s+/i, "").replace(/^We(?:'ve)?\s+/i, "");
  return t.trim();
}

function isEffortLike(s: string): boolean {
  return /\b(spent|working|worked|focused|showing\s+up|kept|practiced|built|learned|adjusted|put\s+in|steady|small\s+steps|week\s+by|daily|regular|hours|time\s+on|chipping|stuck\s+with)\b/i.test(
    s
  );
}

function isOutcomeLike(s: string): boolean {
  return /\b(completed|finished|delivered|shipped|met|achieved|reached|wrapped|landed|closed|got\s+done|hit\s+the|met\s+the)\b/i.test(
    s
  );
}

function stripOutcomeVerb(clause: string): string {
  const t = clause.trim();
  const stripped = t
    .replace(/^(completed|finished|delivered|achieved|met|reached|wrapped\s+up|shipped|got\s+done)\s+/i, "")
    .trim();
  return stripped || t;
}

function effortByPhrase(clause: string): string {
  let c = sentenceToClause(clause);
  c = c.replace(/^worked\s+/i, "working ");
  c = c.replace(/^spent\s+/i, "spending ");
  c = c.replace(/^focused\s+/i, "focusing ");
  c = c.replace(/^kept\s+/i, "keeping ");
  if (!c) return clause.trim();
  return c.charAt(0).toLowerCase() + c.slice(1);
}

function finalizeSingleSummaryLine(s: string): string {
  const t = s.trim();
  if (/^you\s+/i.test(t)) {
    return /[.!?]$/.test(t) ? t : `${t}.`;
  }
  const one = sentenceToClause(t);
  if (isEffortLike(one) && !isOutcomeLike(one)) {
    return `You completed this by ${effortByPhrase(t)}.`;
  }
  let core = stripOutcomeVerb(one);
  core = core ? core.charAt(0).toLowerCase() + core.slice(1) : one.toLowerCase();
  return `You completed ${core}.`;
}

function summaryDisplayLine(raw: string): string {
  const parts = splitSentences(raw);
  if (parts.length === 0) return raw.trim();
  const pair = parts.length >= 2 ? dedupeSimilarPair(parts[0], parts[1]) : [parts[0]];
  if (pair.length === 1) {
    return finalizeSingleSummaryLine(pair[0]);
  }
  let a = pair[0];
  let b = pair[1];
  let outSent = a;
  let effSent = b;
  if (isEffortLike(a) && isOutcomeLike(b)) {
    outSent = b;
    effSent = a;
  } else if (!isOutcomeLike(a) && isOutcomeLike(b)) {
    outSent = b;
    effSent = a;
  }
  const out = sentenceToClause(outSent);
  const outCore = stripOutcomeVerb(out);
  const outPhrase =
    (outCore ? outCore.charAt(0).toLowerCase() + outCore.slice(1) : out.toLowerCase()) ||
    out.toLowerCase();
  const byPhrase = effortByPhrase(effSent);
  return `You completed ${outPhrase} by ${byPhrase}.`;
}

const WEAK_EASIER = [
  /ai\s+makes?\s+it\s+easier/i,
  /using\s+ai\s+made/i,
  /^it\s+was\s+pretty\s+easy\.?$/i,
  /^not\s+much\.?$/i,
  /^(yes|no|n\/?a)\.?$/i,
];

function isWeakEasierSentence(s: string): boolean {
  const x = s.trim();
  if (x.length < 6) return true;
  return WEAK_EASIER.some((re) => re.test(x));
}

function trimFillerClause(s: string): string {
  return s
    .replace(/\b(obviously|basically|honestly|just\s+want\s+to\s+say\s+that)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function whatChangedDisplayText(raw: string): string {
  const parts = splitSentences(raw)
    .map((p) => trimFillerClause(p))
    .filter(Boolean)
    .filter((p) => !isWeakEasierSentence(p))
    .slice(0, 2);
  return parts.join(" ").trim();
}

/** Cap visible summary at two sentences while keeping "You completed … by …" when already one line. */
function capSummaryAtTwoSentences(line: string): string {
  const parts = splitSentences(line);
  if (parts.length <= 2) return line.trim();
  return parts.slice(0, 2).join(" ").trim();
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
      const full = String(json?.content ?? "").trim();
      if (!res.ok || !full) {
        done.set(goalId, fb);
        return fb;
      }
      const extracted = extractWhatActuallyHappened(full);
      const next = extracted ?? fb;
      done.set(goalId, next);
      return next;
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

  void summary;
  void easierHarder;

  return (
    <>
      <p className="mt-4 text-sm leading-relaxed text-foreground/85">
        You completed the first version of the platform by working through
        debugging and refining the UI.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Debugging felt frustrating because small changes could break things, but
        you adapted.
      </p>
    </>
  );
}
