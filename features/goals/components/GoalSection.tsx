"use client";

import { useEffect, useMemo, useState } from "react";
import GoalCard from "@/features/goals/components/GoalCard";
import CompleteGoalDialog from "@/features/goals/components/CompleteGoalDialog";
import type { Goal } from "@/features/goals/lib/goal-types";
import SetGoalDialog from "@/features/goals/components/SetGoalDialog";

import {
  loadGoals,
  getActiveGoal,
  createGoalSingleActive,
  completeGoalWithProof,
  upsertGoal,
} from "@/features/goals/lib/goals-store";

export default function GoalSection() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [setOpen, setSetOpen] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);


  // Load goals only on client (prevents hydration errors)
  useEffect(() => {
    setGoals(loadGoals());
  }, []);

  const activeGoal = useMemo(() => getActiveGoal(goals), [goals]);

  function refresh() {
    setGoals(loadGoals());
  }

    function handleSetGoal() {
    setReplaceMode(false);
    setSetOpen(true);
    }

    function handleReplaceGoal() {
    setReplaceMode(true);
    setSetOpen(true);
    }


  async function handleComplete(file: File | null, note: string) {
    if (!activeGoal) return;

    if (file) {
      await completeGoalWithProof(activeGoal.id, file);

      // Add note after completion if user wrote one
      if (note.trim()) {
        const updatedGoals = loadGoals();
        const updated = updatedGoals.find((g) => g.id === activeGoal.id);
        if (updated) upsertGoal({ ...updated, notes: note.trim() });
      }
    } else {
      // Allow completing without proof
      const now = new Date().toISOString();
      upsertGoal({
        ...activeGoal,
        status: "completed",
        completedAt: now,
        notes: note.trim() || undefined,
      });
    }

    refresh();
  }

  return (
    <>
      <GoalCard
        goal={activeGoal}
        onCheckOff={() => setCompleteOpen(true)}
        onReplace={handleReplaceGoal}
        onSetGoal={handleSetGoal}
      />

      <CompleteGoalDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        goalStatement={activeGoal?.statement ?? ""}
        onComplete={handleComplete}
      />

      <SetGoalDialog
        open={setOpen}
        onOpenChange={setSetOpen}
        existingActive={replaceMode ? activeGoal?.statement ?? null : null}
        onSave={(statement) => {
            createGoalSingleActive(statement);
            refresh();
        }}
        />

    </>
  );
}
