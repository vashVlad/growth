"use client";

import { useState } from "react";

type Reflection = {
  id: string;
  week_start_date: string;
  action_taken: string;
  easier_harder: string;
  alignment: string;
  next_step: string;
};

export default function ExecutionTimeline({
  steps,
  reflections,
}: {
  steps: any[];
  reflections: Reflection[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const firstIncompleteIndex = steps.findIndex((s) => !s.completed);

  return (
    <div className="mt-4 space-y-2">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground/70">
        Execution
      </div>

      {steps.map((step, i) => {
        const isOpen = openIndex === i;

        return (
          <div key={i}>
            {/* Step row */}
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-start gap-2 text-left text-sm text-muted-foreground hover:text-foreground transition"
            >
              <span>
                {step.completed
                  ? "✓"
                  : i === firstIncompleteIndex
                  ? "●"
                  : "○"}
              </span>

              <span className="text-foreground/80">{step.step}</span>
            </button>

            {/* Expanded reflection */}
            
          </div>
        );
      })}
    </div>
  );
}