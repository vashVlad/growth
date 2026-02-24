"use client"

import { Button } from "@/components/ui/button"

interface StepIntroProps {
  onNext: () => void
}

export default function StepIntro({ onNext }: StepIntroProps) {
  return (
    <div className="flex flex-col items-center gap-12 text-center">
      <div className="flex flex-col gap-6">
        <p className="font-serif text-xl leading-relaxed text-foreground sm:text-2xl">
          This space is private.
        </p>
        <p className="font-serif text-xl leading-relaxed text-muted-foreground sm:text-2xl">
          {"You\u2019re not here to track tasks."}
        </p>
        <p className="font-serif text-xl leading-relaxed text-foreground sm:text-2xl text-balance">
          {"You\u2019re here to gain clarity and build yourself deliberately."}
        </p>
      </div>
      <Button
        size="lg"
        onClick={onNext}
        className="min-w-36 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Continue
      </Button>
    </div>
  )
}
