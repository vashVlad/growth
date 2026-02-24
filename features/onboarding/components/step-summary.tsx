"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { GoalEntry, OnboardingData } from "./types"

interface StepSummaryProps {
  data: OnboardingData
  onBack: () => void
  onComplete: () => void
  submitting?: boolean
  error?: string | null
}

function GoalSummaryCard({
  label,
  goal,
}: {
  label: string
  goal: GoalEntry
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="font-serif text-base font-medium leading-relaxed text-foreground">
          {goal.title}
        </p>
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground/70">Milestone:</span>{" "}
            {goal.milestone}
          </p>
          <p>
            <span className="font-medium text-foreground/70">Next action:</span>{" "}
            {goal.nextAction}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function StepSummary({
  data,
  onBack,
  onComplete,
  submitting,
  error,
}: StepSummaryProps) {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          Your 90-day blueprint
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Review everything before you begin.
        </p>
      </header>

      {/* Identity section */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Identity
        </h3>
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5">
          <p className="font-serif text-base leading-relaxed text-foreground">
            {data.identity.becoming}
          </p>
          <div className="h-px bg-border/60" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {data.identity.consistently}
          </p>
        </div>
      </section>

      {/* Goals */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Goals
        </h3>
        <div className="flex flex-col gap-4">
          <GoalSummaryCard label="Career" goal={data.career} />
          <GoalSummaryCard label="Personal" goal={data.personal} />
          <GoalSummaryCard label="Internal" goal={data.internal} />
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between px-1">
        <Button variant="ghost" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button
          size="lg"
          onClick={onComplete}
          disabled={submitting}
          className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
        >
          {submitting ? "Submitting…" : "Begin 90-Day Cycle"}
        </Button>
      </div>
    </div>
  )
}
