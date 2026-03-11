import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { runGoalPlanner } from "@/lib/ai/goal-planner/planner";
import { runGoalPlanValidator } from "@/lib/ai/goal-planner/validator";
import { runGoalPlanRewriter } from "@/lib/ai/goal-planner/rewriter";

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const goalId = String(body?.goalId ?? "").trim();
    const timeframeWeeks = Number(body?.timeframeWeeks ?? 4);
    const weeklyHours = Number(body?.weeklyHours ?? 5);
    const constraints = String(body?.constraints ?? "").trim() || null;
    const intensity = String(body?.intensity ?? "balanced").trim().toLowerCase();

    if (!goalId) {
      return NextResponse.json({ error: "Missing goalId" }, { status: 400 });
    }

    const { data: goal, error: goalError } = await supabase
      .from("goals")
      .select("id, pillar, title, milestone, next_action, user_id")
      .eq("id", goalId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (goalError || !goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const { data: reflection } = await supabase
      .from("reflections")
      .select("action_taken, easier_harder, alignment, next_step, week_start_date")
      .eq("user_id", user.id)
      .eq("goal_id", goal.id)
      .order("week_start_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const latestReflection = reflection
      ? [
          `week: ${reflection.week_start_date ?? ""}`,
          `alignment: ${reflection.alignment ?? ""}`,
          `action: ${reflection.action_taken ?? ""}`,
          `friction: ${reflection.easier_harder ?? ""}`,
          `next: ${reflection.next_step ?? ""}`,
        ].join(" | ")
      : null;

    let plan = await runGoalPlanner({
      goalId: goal.id,
      pillar: goal.pillar,
      title: goal.title,
      milestone: goal.milestone,
      timeframeWeeks,
      weeklyHours,
      constraints,
      intensity,
      latestReflection,
    });

    let issues = await runGoalPlanValidator({
      plan,
      weeklyHours,
      pillar: goal.pillar,
      timeframeWeeks,
      constraints,
    });

    let pass = 0;
    while (issues.some((i) => i.severity === "high") && pass < 2) {
      plan = await runGoalPlanRewriter({
        plan,
        issues,
        weeklyHours,
      });

      issues = await runGoalPlanValidator({
        plan,
        weeklyHours,
        pillar: goal.pillar,
        timeframeWeeks,
        constraints,
      });

      pass += 1;
    }

    const firstIncomplete =
      plan.execution_steps.find((s) => !s.completed)?.step?.trim() || goal.next_action || null;

    const { data: latestPlan } = await supabase
      .from("goal_plans")
      .select("version")
      .eq("goal_id", goal.id)
      .eq("user_id", user.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (latestPlan?.version ?? 0) + 1;

    const { error: insertError, data: inserted } = await supabase
      .from("goal_plans")
      .insert({
        user_id: user.id,
        goal_id: goal.id,
        version: nextVersion,
        timeframe_weeks: timeframeWeeks,
        weekly_hours: weeklyHours,
        constraints,
        intensity,
        plan_json: plan,
      })
      .select("id, version, plan_json, created_at, updated_at, timeframe_weeks, weekly_hours, constraints, intensity")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await supabase
      .from("goals")
      .update({ next_action: firstIncomplete })
      .eq("id", goal.id)
      .eq("user_id", user.id);

    return NextResponse.json({
      ok: true,
      plan: inserted,
      issues,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to generate plan" },
      { status: 500 }
    );
  }
}