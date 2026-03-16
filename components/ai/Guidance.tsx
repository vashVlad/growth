"use client";

import { useState, useEffect } from "react";

type Props = {
  reflectionId: string;
  open: boolean;
};

export function Guidance({ reflectionId, open }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchNote() {
    setLoading(true);

    const res = await fetch("/api/ai/mirror", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reflection_id: reflectionId }),
    });

    const json = await res.json();
    setContent(json.content);
    setLoading(false);
  }

  useEffect(() => {
    if (open && !content) {
      fetchNote();
    }
  }, [open]);

  if (!open) return null;

  return (
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
  );
}