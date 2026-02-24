"use client"

import { cn } from "@/lib/utils"
import { STEP_LABELS, type StepIndex } from "./types"

interface StepProgressProps {
  current: StepIndex
}

export default function StepProgress({ current }: StepProgressProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        {STEP_LABELS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i <= current ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground tabular-nums">
        {current + 1} of {STEP_LABELS.length}
        <span className="ml-2 text-foreground/50">
          {STEP_LABELS[current]}
        </span>
      </p>
    </div>
  )
}
