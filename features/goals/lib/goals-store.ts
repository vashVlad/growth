import type { Goal } from "@/features/goals/lib/goal-types";
import { putProof, deleteProof } from "@/features/goals/lib/proof-db";
import { makeId } from "@/features/goals/lib/id";

const KEY = "growth.goals.v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadGoals(): Goal[] {
  // NOTE: only call this in client components (or inside useEffect)
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    // If it's not an array (e.g., {}), reset it
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(KEY);
      return [];
    }

    return parsed as Goal[];
  } catch {
    // Bad JSON, reset it
    localStorage.removeItem(KEY);
    return [];
  }
}

export function saveGoals(goals: Goal[]) {
  localStorage.setItem(KEY, JSON.stringify(goals));
}

export function getActiveGoal(goals: Goal[]) {
  return goals.find((g) => g.status === "active") ?? null;
}

export function upsertGoal(goal: Goal): Goal[] {
  const goals = loadGoals();
  const idx = goals.findIndex((g) => g.id === goal.id);

  if (idx >= 0) goals[idx] = goal;
  else goals.unshift(goal);

  saveGoals(goals);
  return goals;
}

export function createGoal(statement: string): Goal[] {
  const goal: Goal = {
    id: makeId(),
    statement: statement.trim(),
    status: "active",
    createdAt: new Date().toISOString(),
  };
  return upsertGoal(goal);
}

/**
 * Ensures there is only ONE active goal.
 * If one exists, it gets archived before creating the new active goal.
 */
export function createGoalSingleActive(statement: string): Goal[] {
  const goals = loadGoals();
  const active = goals.find((g) => g.status === "active");

  if (active) {
    active.status = "archived";
    saveGoals(goals);
  }

  return createGoal(statement);
}

export async function completeGoalWithProof(goalId: string, file: File): Promise<Goal[]> {
  const goals = loadGoals();
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return goals;

  const proofId = makeId();
  const now = new Date().toISOString();

  await putProof({
    id: proofId,
    blob: file,
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    createdAt: now,
  });

  const updated: Goal = {
    ...goal,
    status: "completed",
    completedAt: now,
    proof: {
      id: proofId,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      createdAt: now,
    },
  };

  return upsertGoal(updated);
}

export function archiveGoal(goalId: string): Goal[] {
  const goals = loadGoals();
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return goals;

  return upsertGoal({ ...goal, status: "archived" });
}

export async function deleteGoal(goalId: string): Promise<Goal[]> {
  const goals = loadGoals();
  const goal = goals.find((g) => g.id === goalId);

  const next = goals.filter((g) => g.id !== goalId);
  saveGoals(next);

  if (goal?.proof?.id) {
    await deleteProof(goal.proof.id);
  }

  return next;
}
