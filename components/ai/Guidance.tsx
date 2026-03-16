"use client";

import { useState, useEffect } from "react";

type Props = {
  reflectionId: string;
  autoOpen?: boolean;
};

export function Guidance({ reflectionId, autoOpen = false }: Props) {
  const [open, setOpen] = useState(autoOpen);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchNote() {
    setLoading(true);

    const res = await fetch("/api/ai/mirror", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reflection_id: reflectionId }),
    });

    const json = await res.json();
    setContent(json.content);
    setLoading(false);
  }

  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
      fetchNote();
    }
  }, [autoOpen]);

  function toggle() {
    const next = !open;
    setOpen(next);

    if (next && !content) fetchNote();
  }

  return {
    button: (
      <button
        onClick={toggle}
        className="inline-flex items-center rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
      >
        {open ? "Close insight" : "✦ Guidance"}
      </button>
    ),

    panel:
      open && (
        <div className="mt-4 w-full rounded-2xl border border-border/30 bg-muted/30 p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground">
              ✦ Mirror — Behavioral Note
            </div>

            {loading && (
              <span className="text-xs text-muted-foreground">Writing…</span>
            )}
          </div>

          {content ? (
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
              {content}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Generating insight…
            </p>
          )}
        </div>
      ),
  };
}