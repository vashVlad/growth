"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { EMPTY_ONBOARDING, type OnboardingData, type StepIndex } from "./types"
import StepProgress from "./step-progress"
import StepIntro from "./step-intro"    
import StepIdentity from "./step-identity"
import StepGoal from "./step-goal"
import StepSummary from "./step-summary"

export default function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState<StepIndex>(0)
  const [data, setData] = useState<OnboardingData>(EMPTY_ONBOARDING)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const next = useCallback(
    () => setStep((s) => Math.min(s + 1, 5) as StepIndex),
    []
  )
  const back = useCallback(
    () => setStep((s) => Math.max(s - 1, 0) as StepIndex),
    []
  )

  async function handleComplete() {
    if (submitting) return
    setError(null)
    setSubmitting(true)

    try {
        const payload = {
        identity_statement: data.identity.becoming.trim(),
        identity_behaviors: data.identity.consistently.trim(),
        goals: {
            career: {
            title: data.career.title.trim(),
            milestone: data.career.milestone.trim(),
            next_action: data.career.nextAction.trim(),
            },
            personal: {
            title: data.personal.title.trim(),
            milestone: data.personal.milestone.trim(),
            next_action: data.personal.nextAction.trim(),
            },
            internal: {
            title: data.internal.title.trim(),
            milestone: data.internal.milestone.trim(),
            next_action: data.internal.nextAction.trim(),
            },
          },
        }

        const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        })

        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(body?.error ?? "Failed to complete onboarding.");
          setSubmitting(false);
          return;
        }

        // ok true OR already_completed true → go home
        router.replace("/home");


    } catch {
        setError("Network error. Please try again.")
        setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12 sm:py-16">
      <div className="mx-auto flex w-full max-w-md flex-col gap-10">
        {/* Progress bar (hidden on intro) */}
        {step > 0 && <StepProgress current={step} />}

        {/* Steps */}
        {step === 0 && <StepIntro onNext={next} />}

        {step === 1 && (
          <StepIdentity
            data={data}
            onChange={setData}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 2 && (
          <StepGoal
            goalKey="career"
            data={data}
            onChange={setData}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 3 && (
          <StepGoal
            goalKey="personal"
            data={data}
            onChange={setData}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 4 && (
          <StepGoal
            goalKey="internal"
            data={data}
            onChange={setData}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 5 && (
            <StepSummary
                data={data}
                onBack={back}
                onComplete={handleComplete}
                submitting={submitting}
                error={error}
            />
            )}


      </div>
    </div>
  )
}
