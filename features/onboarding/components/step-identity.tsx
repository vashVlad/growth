"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { OnboardingData } from "../types"

interface StepIdentityProps {
  data: OnboardingData
  onChange: (data: OnboardingData) => void
  onNext: () => void
  onBack: () => void
}

export default function StepIdentity({
  data,
  onChange,
  onNext,
  onBack,
}: StepIdentityProps) {
  const { becoming, consistently } = data.identity

  const canProceed = becoming.trim().length > 0 && consistently.trim().length > 0

  function update(field: "becoming" | "consistently", value: string) {
    onChange({
      ...data,
      identity: { ...data.identity, [field]: value },
    })
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          Define your identity
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Clarity begins with knowing who you are becoming.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="becoming" className="text-foreground">
            Who are you becoming in the next 90 days?
          </Label>
          <Textarea
            id="becoming"
            value={becoming}
            onChange={(e) => update("becoming", e.target.value)}
            maxLength={120}
            placeholder="e.g. A disciplined founder who ships weekly"
            className="min-h-20 resize-none"
          />
          <span className="text-xs text-muted-foreground text-right tabular-nums">
            {becoming.length}/120
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor="consistently" className="text-foreground">
            What does this version of you consistently do?
          </Label>
          <Textarea
            id="consistently"
            value={consistently}
            onChange={(e) => update("consistently", e.target.value)}
            maxLength={200}
            placeholder="e.g. Writes every morning, reviews metrics weekly, says no to distractions"
            className="min-h-24 resize-none"
          />
          <span className="text-xs text-muted-foreground text-right tabular-nums">
            {consistently.length}/200
          </span>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between px-1 ">
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
