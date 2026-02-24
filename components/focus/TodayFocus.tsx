"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type Pillar = "career" | "personal" | "internal";

const PILLARS: { value: Pillar; label: string }[] = [
  { value: "career", label: "Career" },
  { value: "personal", label: "Personal" },
  { value: "internal", label: "Internal" },
];

export function TodayFocus({
  availablePillars,
  onChange,
}: {
  availablePillars: Pillar[];
  onChange?: (pillar: Pillar) => void;
}) {
  const available = React.useMemo(
    () => Array.from(new Set(availablePillars)),
    [availablePillars]
  );

  const [active, setActive] = React.useState<Pillar | null>(null);

  function handleClick(p: Pillar) {
    setActive(p);
    onChange?.(p);

    // Fade button selection after 2 seconds
    window.setTimeout(() => {
      setActive(null);
    }, 2000);
  }

  return (
    <div className="mt-8 max-w-[65ch]">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        Today’s focus
      </div>

      <div className="mt-3">
        <div className="inline-grid grid-cols-3 rounded-xl border border-border/50 bg-background/60 p-1">
{PILLARS.filter((p) => available.includes(p.value)).map((p) => {
    const isActive = p.value === active;

    return (
        <button
            key={p.value}
            type="button"
            onClick={() => handleClick(p.value)}
            className={[
                "h-9 px-3 text-sm rounded-lg transition-colors duration-200",
                "flex items-center justify-center",
                isActive
              ? "bg-primary/10 text-foreground"
              : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
          ].join(" ")}
        >
          {p.label}
        </button>
      );
    })}
  </div>
</div>


      <div className="mt-3 text-sm text-muted-foreground">
        Choose one pillar to move forward today.
      </div>
    </div>
  );
}
