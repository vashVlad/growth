"use client";

import { useEffect, useState, useTransition } from "react";

const CACHE_KEY = "growth.completionSummary.v1";
const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

type CacheShape = Record<string, { content: string; savedAt: number }>;

function loadCache(): CacheShape {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as CacheShape;
  } catch {
    return {};
  }
}

function saveCache(cache: CacheShape) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

export function CompletionSummaryButton({ goalId }: { goalId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cache = loadCache();
    const item = cache[goalId];
    if (!item) return;

    const fresh = Date.now() - item.savedAt < TTL_MS;
    if (fresh && item.content) setContent(item.content);
  }, [goalId]);

  async function fetchSummary(force = false) {
    setError(null);
    if (!force && content) return;

    try {
      const res = await fetch("/api/ai/completion-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal_id: goalId }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to generate reflection");

      const text = String(json?.content ?? "").trim();
      setContent(text);

      const cache = loadCache();
      cache[goalId] = { content: text, savedAt: Date.now() };
      saveCache(cache);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);

    if (next && !content && !pending) {
      startTransition(() => fetchSummary(false));
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs text-foreground/80 hover:bg-muted/60 transition-colors disabled:opacity-50"
        >
          {open ? "Close" : "Insight"}
        </button>
      </div>

      <div
        className={`mt-3 overflow-hidden transition-all duration-300 ease-out
        ${
          open
            ? "max-h-[900px] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-1"
        }`}
      >
        <div className="rounded-xl border border-border/30 bg-background/30 p-5">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground/80/70">
            AI insight
          </div>

          {pending && <div className="mt-2 text-sm text-muted-foreground">Thinking…</div>}

          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

          {content ? (
            <div className="mt-3 whitespace-pre-wrap text-[14px] leading-7 text-foreground/85">
              {content.split("\n").map((line, i) => {
                const isHeader = line.trim().endsWith(":");
                return (
                  <p
                    key={i}
                    className={`${
                      isHeader
                        ? "mt-4 text-[13px] text-muted-foreground/70 tracking-wide"
                        : "mt-1"
                    }`}
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Open to generate a short reflection on how this goal played out.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}