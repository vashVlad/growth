"use client";

import * as React from "react";

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

    // Fade selection after 2 seconds
    window.setTimeout(() => {
      setActive(null);
    }, 2000);
  }

  return (
    <div className="space-y-2 max-w-[65ch]">
      {/* Label */}
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        Today’s Focus
      </div>

      {/* Pill container */}
      <div className="rounded-2xl border border-border/60 bg-background/60 p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-3 gap-1.5">
          {PILLARS.filter((p) => available.includes(p.value)).map((p) => {
            const isActive = p.value === active;

            return (
              <button
                key={p.value}
                type="button"
                onClick={() => handleClick(p.value)}
                className={[
                  "h-9 rounded-xl text-sm transition-all duration-200",
                  "flex items-center justify-center",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Instruction */}
      <div className="text-sm text-muted-foreground leading-relaxed">
        Choose one pillar to move forward today.
      </div>

      <div className="mt-6" />
    </div>
  );
}