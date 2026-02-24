"use client";

import { useState } from "react";

export function SoftDisclosure({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-border/40 bg-background/40 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <span>{title}</span>
        <span className="text-muted-foreground/70">{open ? "▲" : "▼"}</span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          open ? "max-h-[900px] opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        {open ? <div className="space-y-3">{children}</div> : null}
      </div>
    </div>
  );
}