"use client";

import * as React from "react";
import { TodayFocus } from "@/components/focus/TodayFocus";

type Pillar = "career" | "personal" | "internal";

export function HomeFocusController({
  availablePillars,
}: {
  availablePillars: Pillar[];
}) {
  const available = React.useMemo(
    () => Array.from(new Set(availablePillars)),
    [availablePillars]
  );

  function handleChange(pillar: Pillar) {
    const el = document.getElementById(`pillar-${pillar}`);
    if (!el) return;

    // Scroll smoothly
    el.scrollIntoView({ behavior: "smooth", block: "start" });

    // Temporary highlight
    el.classList.add("bg-primary/5", "border-primary/20");

    // Remove highlight after 2 seconds
    window.setTimeout(() => {
      el.classList.remove("bg-primary/5", "border-primary/20");
    }, 2000);
  }

  return (
    <TodayFocus
      availablePillars={available}
      onChange={handleChange}
    />
  );
}
