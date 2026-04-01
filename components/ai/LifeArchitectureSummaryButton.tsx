"use client";

import { useEffect, useState, useTransition } from "react";

const CACHE_KEY = "growth.lifeArchitectureSummary.v1";
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

export function LifeArchitectureSummaryButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const cache = loadCache();
    const item = cache[userId];
    if (!item) return;

    const fresh = Date.now() - item.savedAt < TTL_MS;
    if (fresh && item.content) setContent(item.content);
  }, [userId]);

  async function fetchSummary(force = false) {
    setError(null);
    if (!force && content) return;

    try {
      const res = await fetch("/api/ai/life-architecture-summary", {
        method: "GET",
        cache: "no-store",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to generate insight");

      const text = String(json?.content ?? "").trim();
      setContent(text);

      const cache = loadCache();
      cache[userId] = { content: text, savedAt: Date.now() };
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
    <section className="rounded-2xl border border-border/30 bg-background/40">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 max-w-[60ch]">
            <div className="text-[15px] font-medium tracking-tight text-foreground/90">
              Life Architecture
            </div>
            <div className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              A quiet reflection across your recent patterns.
            </div>
          </div>

          <button
            type="button"
            onClick={toggle}
            disabled={pending}
            className="shrink-0 rounded-lg border border-border/20 bg-transparent px-2 py-1 text-[10px] font-normal text-muted-foreground/70 transition-colors disabled:opacity-50"
          >
            {open ? "Hide" : "Insight"}
          </button>
        </div>

        <div
          className={`mt-4 overflow-hidden transition-all duration-300 ease-out
          ${open ? "max-h-[900px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1"}`}
        >
          <div className="rounded-xl border border-border/15 bg-background/15 p-5">
            {pending && <div className="text-sm leading-relaxed text-muted-foreground">Thinking…</div>}

            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

            {content ? (
              <div className="mt-3 max-w-[72ch] whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/85">
                {content}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Open for a reflection across your recent patterns.
              </p>
            )}
          </div>
        </div>

        <div className="h-1" />
      </div>
    </section>
  );
}