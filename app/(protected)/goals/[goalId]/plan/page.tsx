import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { BackButton } from "@/components/nav/BackButton";
import { GoalPlanSetupCard } from "@/components/goals/GoalPlanSetupCard";
import { GoalPlanCard } from "@/components/goals/GoalPlanCard";

type GoalPlanRow = {
  id: string;
  version: number;
  plan_json: any;
  created_at: string;
  updated_at: string;
  timeframe_weeks: number;
  weekly_hours: number;
  constraints: string | null;
  intensity: string | null;
};

export default async function GoalPlanPage({
  params,
}: {
  params: Promise<{ goalId?: string }>;
}) {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { goalId } = await params;

  if (!goalId) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-3xl px-5 py-10 space-y-6">
          <BackButton fallbackHref="/home" />
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Plan
          </div>
          <div className="text-sm text-red-600">Missing goal ID.</div>
        </div>
      </main>
    );
  }

  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("id, title, milestone, pillar, next_action, user_id")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (goalError) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-3xl px-5 py-10 space-y-6">
          <BackButton fallbackHref="/home" />
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Plan
          </div>
          <div className="text-sm text-red-600">DB error: {goalError.message}</div>
        </div>
      </main>
    );
  }

  if (!goal) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-3xl px-5 py-10 space-y-6">
          <BackButton fallbackHref="/home" />
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Plan
          </div>
          <div className="text-sm text-red-600">Goal not found.</div>
        </div>
      </main>
    );
  }

  const { data: latestPlan } = await supabase
    .from("goal_plans")
    .select(
      "id, version, plan_json, created_at, updated_at, timeframe_weeks, weekly_hours, constraints, intensity"
    )
    .eq("goal_id", goal.id)
    .eq("user_id", user.id)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const plan = latestPlan as GoalPlanRow | null;

   return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-14 space-y-12">

        <section className="space-y-5 max-w-prose">
          <h1 className="text-3xl font-serif font-medium leading-[1.2] tracking-tight max-w-[22ch]">
            {goal.title}
          </h1>

          <div className="text-sm text-muted-foreground">
            <span className="text-foreground/80">Milestone:</span>{" "}
            {goal.milestone?.trim() ? goal.milestone : "—"}
          </div>

          <div className="text-sm text-muted-foreground leading-relaxed">
            Turn this goal into a realistic execution plan.
          </div>
        </section>

        <div className="pt-2">
          <GoalPlanSetupCard hasPlan={Boolean(plan)} goalId={goal.id} />
        </div>

        {plan?.plan_json ? (
        <GoalPlanCard
            plan={plan.plan_json}
            version={plan.version}
            savedAt={plan.updated_at ?? plan.created_at}
        />
        ) : (
          <section className="rounded-2xl border border-border/40 bg-background/40 p-6 text-sm text-muted-foreground max-w-[560px]">            
            Plan output will render here.
          </section>
        )}
      </div>
    </main>
  );
}