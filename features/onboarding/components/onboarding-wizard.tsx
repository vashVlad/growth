"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OnboardingState, Pillar } from "@/lib/onboarding/types";
import { t, validateAll, validateIdentity, validatePillar } from "../schema";

import IntroStep from "./steps/IntroStep";
import IdentityStep from "./steps/IdentityStep";
import PillarStep from "./steps/PillarStep";
import SummaryStep from "./steps/SummaryStep";

type Step =
  | { kind: "intro" }
  | { kind: "identity" }
  | { kind: "pillar"; pillar: Pillar }
  | { kind: "summary" };

const steps: Step[] = [
  { kind: "intro" },
  { kind: "identity" },
  { kind: "pillar", pillar: "career" },
  { kind: "pillar", pillar: "personal" },
  { kind: "pillar", pillar: "internal" },
  { kind: "summary" },
];

const initialState: OnboardingState = {
  identityStatement: "",
  identityBehaviors: "",
  goals: {
    career: { title: "", milestone: "", nextAction: "" },
    personal: { title: "", milestone: "", nextAction: "" },
    internal: { title: "", milestone: "", nextAction: "" },
  },
};

export default function OnboardingWizard() {
  const router = useRouter();

  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<OnboardingState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const current = steps[idx];

  const goBack = () => {
    setError(null);
    setIdx((v) => Math.max(0, v - 1));
  };

  const goNext = () => {
    setError(null);

    if (current.kind === "identity") {
      const e = validateIdentity(state);
      if (e) return setError(e);
    }
    if (current.kind === "pillar") {
      const e = validatePillar(state, current.pillar);
      if (e) return setError(e);
    }

    setIdx((v) => Math.min(steps.length - 1, v + 1));
  };

  const summary = useMemo(() => {
    return {
      identityStatement: t(state.identityStatement),
      identityBehaviors: t(state.identityBehaviors),
      goals: state.goals,
    };
  }, [state]);

  const finalSubmit = async () => {
    setError(null);

    const e = validateAll(state);
    if (e) return setError(e);

    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        identity_statement: t(state.identityStatement),
        identity_behaviors: t(state.identityBehaviors),
        goals: {
          career: {
            title: t(state.goals.career.title),
            milestone: t(state.goals.career.milestone),
            next_action: t(state.goals.career.nextAction),
          },
          personal: {
            title: t(state.goals.personal.title),
            milestone: t(state.goals.personal.milestone),
            next_action: t(state.goals.personal.nextAction),
          },
          internal: {
            title: t(state.goals.internal.title),
            milestone: t(state.goals.internal.milestone),
            next_action: t(state.goals.internal.nextAction),
          },
        },
      };

      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.replace("/home");
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      {current.kind === "intro" && <IntroStep onContinue={goNext} />}

      {current.kind === "identity" && (
        <IdentityStep
          value={{
            identityStatement: state.identityStatement,
            identityBehaviors: state.identityBehaviors,
          }}
          onChange={(patch) => setState((s) => ({ ...s, ...patch }))}
          onBack={goBack}
          onContinue={goNext}
          error={error}
        />
      )}

      {current.kind === "pillar" && (
        <PillarStep
          pillar={current.pillar}
          value={state.goals[current.pillar]}
          onChange={(g) =>
            setState((s) => ({ ...s, goals: { ...s.goals, [current.pillar]: g } }))
          }
          onBack={goBack}
          onContinue={goNext}
          error={error}
        />
      )}

      {current.kind === "summary" && (
        <SummaryStep
          data={summary}
          onBack={goBack}
          onSubmit={finalSubmit}
          submitting={submitting}
          error={error}
        />
      )}
    </div>
  );
}
