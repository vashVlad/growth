"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OnboardingData, Pillar } from "./types";
import { t, validateAll, validateIdentity, validatePillar, type OnboardingState as LegacyOnboardingState,} from "../schema";

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

const initialState: OnboardingData = {
  identity: { becoming: "", consistently: "" },
  career: { title: "", milestone: "", nextAction: "" },
  personal: { title: "", milestone: "", nextAction: "" },
  internal: { title: "", milestone: "", nextAction: "" },
};

function toLegacyValidationState(s: OnboardingData): LegacyOnboardingState {
  return {
    identityStatement: s.identity.becoming,
    identityBehaviors: s.identity.consistently,
    goals: {
      career: s.career,
      personal: s.personal,
      internal: s.internal,
    },
  };
}

export default function OnboardingWizard() {
  const router = useRouter();

  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<OnboardingData>(initialState);
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
      const e = validateIdentity(toLegacyValidationState(state));
      if (e) return setError(e);
    }
    if (current.kind === "pillar") {
      const e = validatePillar(toLegacyValidationState(state), current.pillar);
      if (e) return setError(e);
    }

    setIdx((v) => Math.min(steps.length - 1, v + 1));
  };

  const summary = useMemo(() => {
  return {
    identityStatement: t(state.identity.becoming),
    identityBehaviors: t(state.identity.consistently),
    goals: {
      career: {
        title: t(state.career.title),
        milestone: t(state.career.milestone),
        nextAction: t(state.career.nextAction),
      },
      personal: {
        title: t(state.personal.title),
        milestone: t(state.personal.milestone),
        nextAction: t(state.personal.nextAction),
      },
      internal: {
        title: t(state.internal.title),
        milestone: t(state.internal.milestone),
        nextAction: t(state.internal.nextAction),
      },
    },
  };
}, [state]);

  const finalSubmit = async () => {
    setError(null);

    const e = validateAll(toLegacyValidationState(state));
    if (e) return setError(e);

    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        identity_statement: t(state.identity.becoming),
        identity_behaviors: t(state.identity.consistently),
        goals: {
          career: {
            title: t(state.career.title),
            milestone: t(state.career.milestone),
            next_action: t(state.career.nextAction),
          },
          personal: {
            title: t(state.personal.title),
            milestone: t(state.personal.milestone),
            next_action: t(state.personal.nextAction),
          },
          internal: {
            title: t(state.internal.title),
            milestone: t(state.internal.milestone),
            next_action: t(state.internal.nextAction),
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
            identityStatement: state.identity.becoming,
            identityBehaviors: state.identity.consistently,
          }}
          onChange={(patch) =>
            setState((s) => ({
              ...s,
              identity: {
                becoming: patch.identityStatement ?? s.identity.becoming,
                consistently: patch.identityBehaviors ?? s.identity.consistently,
              },
            }))
          }
          onBack={goBack}
          onContinue={goNext}
          error={error}
        />
      )}

      {current.kind === "pillar" && (
        <PillarStep
          pillar={current.pillar}
          value={state[current.pillar]}
          onChange={(g) => setState((s) => ({ ...s, [current.pillar]: g }))}
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
