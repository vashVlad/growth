"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adjustGoal } from "@/app/actions/adjustments";
import { CompleteGoalButton } from "../goals/CompleteGoalButton";

type Goal = {
  id: string;
  title: string;
  milestone: string | null;
  next_action: string | null;
};

export default function GoalAdjustForm({ goal }: { goal: Goal }) {
  const router = useRouter();

  const [title, setTitle] = useState(goal.title ?? "");
  const [milestone, setMilestone] = useState(goal.milestone ?? "");
  const [nextAction, setNextAction] = useState(goal.next_action ?? "");

  const [reason, setReason] = useState("");
  const [changed, setChanged] = useState("");
  const [evo, setEvo] = useState<"evolution" | "avoidance">("evolution");

  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const hasChanges =
    title.trim() !== (goal.title ?? "").trim() ||
    milestone.trim() !== (goal.milestone ?? "").trim() ||
    nextAction.trim() !== (goal.next_action ?? "").trim();

  const canContinue = hasChanges && title.trim().length > 0;

  const canSave = canContinue && reason.trim().length > 0 && changed.trim().length > 0;

  async function handleSave() {
    setError(null);

    const fd = new FormData();
    fd.set("goal_id", goal.id);
    fd.set("title", title);
    fd.set("milestone", milestone);
    fd.set("next_action", nextAction);
    fd.set("reason_misaligned", reason);
    fd.set("what_changed", changed);
    fd.set("evolution_or_avoidance", evo);

    startTransition(async () => {
        const res = await adjustGoal(fd);

        if (!res.ok) {
            setError(res.error);
            return;
        }

        router.replace(res.redirectTo ?? "/home");
        router.refresh(); // ← THIS LINE is the fix
        });
    }

  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-6 shadow-sm space-y-6">
      {step === 1 && (
        <>
          <div>
            <div className="text-sm font-medium">Title</div>
            <input
              className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <div className="text-sm font-medium">Milestone</div>
            <input
              className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-sm"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
            />
          </div>

          <div>
            <div className="text-sm font-medium">Next action</div>
            <input
              className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-sm"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
  <CompleteGoalButton goalId={goal.id} />

  <button
    disabled={!canContinue}
    onClick={() => setStep(2)}
    className="rounded-xl bg-foreground px-4 py-2 text-sm text-background disabled:opacity-40"
  >
    Continue
  </button>
</div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="space-y-4">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground/80">
                Adjustment reflection
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Required before saving.
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">
                What feels misaligned right now?
              </div>
              <textarea
                className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-sm"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div>
              <div className="text-sm font-medium">
                What changed since you set this?
              </div>
              <textarea
                className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-sm"
                rows={3}
                value={changed}
                onChange={(e) => setChanged(e.target.value)}
              />
            </div>

            <div>
              <div className="text-sm font-medium">
                Is this an evolution or an avoidance?
              </div>
              <select
                className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-sm"
                value={evo}
                onChange={(e) =>
                  setEvo(e.target.value as "evolution" | "avoidance")
                }
              >
                <option value="evolution">Evolution</option>
                <option value="avoidance">Avoidance</option>
              </select>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-between pr-1">
            <button
              disabled={!canSave || pending}
              onClick={handleSave}
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white
                disabled:bg-neutral-300 disabled:text-neutral-500"
            >
              {pending ? "Saving…" : "Confirm & Save"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
