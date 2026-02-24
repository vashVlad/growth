"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { GoalEntry, OnboardingData } from "../types"

type GoalKey = "career" | "personal" | "internal"

const META: Record<GoalKey, { title: string; subtitle: string }> = {
  career: {
    title: "Career goal",
    subtitle: "What professional outcome are you working toward?",
  },
  personal: {
    title: "Personal goal",
    subtitle: "What matters most in your life outside work?",
  },
  internal: {
    title: "Internal goal",
    subtitle: "What inner shift or habit are you cultivating?",
  },
}

interface StepGoalProps {
  goalKey: GoalKey
  data: OnboardingData
  onChange: (data: OnboardingData) => void
  onNext: () => void
  onBack: () => void
}

export default function StepGoal({
  goalKey,
  data,
  onChange,
  onNext,
  onBack,
}: StepGoalProps) {
  const goal = data[goalKey]
  const { title, subtitle } = META[goalKey]

  const canProceed =
    goal.title.trim().length > 0 &&
    goal.milestone.trim().length > 0 &&
    goal.nextAction.trim().length > 0

  function update(field: keyof GoalEntry, value: string) {
    onChange({
      ...data,
      [goalKey]: { ...goal, [field]: value },
    })
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <Label htmlFor={`${goalKey}-title`} className="text-foreground">
            Goal statement
          </Label>
          <Input
            id={`${goalKey}-title`}
            value={goal.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="What are you aiming for?"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor={`${goalKey}-milestone`} className="text-foreground">
            90-day milestone
          </Label>
          <Input
            id={`${goalKey}-milestone`}
            value={goal.milestone}
            onChange={(e) => update("milestone", e.target.value)}
            placeholder="What does progress look like in 90 days?"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor={`${goalKey}-action`} className="text-foreground">
            Next action
          </Label>
          <Input
            id={`${goalKey}-action`}
            value={goal.nextAction}
            onChange={(e) => update("nextAction", e.target.value)}
            placeholder="What is the very first step?"
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between px-1">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
