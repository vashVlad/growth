"use client";

import { useState, useEffect, useRef } from "react";

type Props = {
  reflectionId: string;
  autoOpen?: boolean;
};

export function Guidance({ reflectionId, autoOpen = false }: Props) {
  const [open, setOpen] = useState(autoOpen);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // prevents duplicate API calls
  const fetched = useRef(false);

  async function fetchGuidance() {
    if (fetched.current) return;

    fetched.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/mirror", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reflection_id: reflectionId }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Failed to generate guidance");
      }

      setContent(json.content);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);

    if (next) fetchGuidance();
  }

  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
      fetchGuidance();
    }
  }, [autoOpen]);

  return (
    <>
      {/* BUTTON */}
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className="inline-flex items-center rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-50"
      >
        {open ? "Close insight" : "✦ Guidance"}
      </button>

      {/* MIRROR PANEL */}
      {open && (
        <div className="mt-4 w-full rounded-2xl border border-border/30 bg-muted/30 p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground">
              ✦ Mirror — Behavioral Note
            </div>

            {loading && (
              <span className="text-xs text-muted-foreground">
                Writing…
              </span>
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
              Generating reflection insight…
            </p>
          )}
        </div>
      )}
    </>
  );
}