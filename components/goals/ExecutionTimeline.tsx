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

        const reflection = reflections[i]; // simple mapping for now

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
            {isOpen && reflection ? (
              <div className="ml-6 mt-2 rounded-xl border border-border/30 bg-background/30 p-3 text-sm text-muted-foreground">
                <div className="text-xs text-muted-foreground">
                  {reflection.week_start_date}
                </div>

                <div className="mt-1 text-foreground/80">
                  {reflection.alignment}
                </div>

                <div className="mt-2 space-y-1">
                  <div>
                    <span className="text-foreground/80">Action:</span>{" "}
                    {reflection.action_taken}
                  </div>
                  <div>
                    <span className="text-foreground/80">
                      Easier/Harder:
                    </span>{" "}
                    {reflection.easier_harder}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}