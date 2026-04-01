import { supabaseServer } from "@/lib/supabase/server";

export type ProgressGoalStatus = "active" | "completed" | "archived";

export type ProgressDbGoal = {
  id: string;
  pillar: "career" | "personal" | "internal";
  title: string;
  milestone: string | null;
  status: ProgressGoalStatus;
  created_at: string;
  updated_at: string;
};

export type ProgressDbReflection = {
  id: string;
  goal_id: string;
  week_start_date: string;
  action_taken: string;
  easier_harder: string;
  alignment: "yes" | "partial" | "no" | string;
  next_step: string;
  created_at: string;
  updated_at: string | null;
};

export type ProgressGoalHistoryResult =
  | { ok: false; error: "auth" }
  | { ok: false; error: "goals"; message: string }
  | {
      ok: true;
      goalRows: ProgressDbGoal[];
      reflectionsByGoal: Map<string, ProgressDbReflection[]>;
    };

/**
 * Same Supabase pipeline as Progress goal history (completed + archived goals,
 * reflections for current user). Does not reorder—callers decide display order.
 */
export async function fetchProgressGoalHistory(): Promise<ProgressGoalHistoryResult> {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { ok: false, error: "auth" };
  }

  const { data: goals, error: goalsErr } = await supabase
    .from("goals")
    .select(
      `
      id, pillar, title, milestone, status, created_at, updated_at,
      reflections (week_start_date, alignment, next_step, updated_at, created_at)
    `
    )
    .in("status", ["completed", "archived"])
    .order("updated_at", { ascending: false });

  if (goalsErr) {
    return {
      ok: false,
      error: "goals",
      message: "Couldn’t load your goal history. Please refresh.",
    };
  }

  const goalRows = (goals ?? []) as ProgressDbGoal[];
  const goalIds = goalRows.map((g) => g.id);

  const reflectionsByGoal = new Map<string, ProgressDbReflection[]>();

  if (goalIds.length === 0) {
    return { ok: true, goalRows, reflectionsByGoal };
  }

  const { data: reflections, error: refErr } = await supabase
    .from("reflections")
    .select(
      "id, goal_id, week_start_date, action_taken, easier_harder, alignment, next_step, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .in("goal_id", goalIds)
    .order("week_start_date", { ascending: false })
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (!refErr) {
    for (const r of (reflections ?? []) as ProgressDbReflection[]) {
      const arr = reflectionsByGoal.get(r.goal_id) ?? [];
      arr.push(r);
      reflectionsByGoal.set(r.goal_id, arr);
    }
  }

  return { ok: true, goalRows, reflectionsByGoal };
}
