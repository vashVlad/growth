"use client";

import { useState } from "react";

export function Guidance({reflectionId, autoOpen = false,}: { reflectionId: string; autoOpen?: boolean;}) {
  const [open, setOpen] = useState(autoOpen);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchNote() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/mirror", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflection_id: reflectionId }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to generate guidance");
      setContent(json.content);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);

    if (next && !content && !loading) fetchNote();
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className="inline-flex items-center rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {open ? "Close" : "Guidance"}
      </button>

      {/* Animated Mirror Card */}
      <div
        className={`mt-3 overflow-hidden rounded-2xl border bg-muted/40 shadow-sm transition-all duration-300 ease-out
        ${
          open
            ? "max-h-96 opacity-100 translate-y-0 border-border/40 p-4"
            : "max-h-0 opacity-0 -translate-y-1 border-transparent p-0"
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold text-foreground">
            Mirror — Behavioral Note
          </div>
          {loading && (
            <div className="text-xs text-muted-foreground">Writing…</div>
          )}
        </div>

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : content ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
            {content}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Open Guidance to generate a calm margin note.
          </p>
        )}
      </div>
    </div>
  );
}
