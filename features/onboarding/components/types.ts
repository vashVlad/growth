export type GoalEntry = {
  title: string
  milestone: string
  nextAction: string
}

export type OnboardingData = {
  identity: {
    becoming: string
    consistently: string
  }
  career: GoalEntry
  personal: GoalEntry
  internal: GoalEntry
}

// 0..5 for 6 screens
export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5

// Progress bar labels for steps 1..5 (intro hidden)
export const STEP_LABELS = [
  "Identity",
  "Career",
  "Personal",
  "Internal",
  "Summary",
] as const

export const EMPTY_ONBOARDING: OnboardingData = {
  identity: { becoming: "", consistently: "" },
  career: { title: "", milestone: "", nextAction: "" },
  personal: { title: "", milestone: "", nextAction: "" },
  internal: { title: "", milestone: "", nextAction: "" },
}
