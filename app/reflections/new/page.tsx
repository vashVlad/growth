  // app/reflections/new/page.tsx
  import { redirect } from "next/navigation";
  import { revalidatePath } from "next/cache";
  import { supabaseServer } from "@/lib/supabase/server";
  import WeeklyCheckInForm from "@/components/reflections/WeeklyCheckInForm";
  import { getWeekStartDateNY } from "@/lib/dates/weekStart";
  import { BackButton } from "@/components/nav/BackButton";
  type Alignment = "yes" | "partial" | "no";

  type ActionResult =
    | { ok: true }
    | { ok: false; message: string }
    | undefined;

  function normalizeAlignment(v: string): Alignment | null {
    if (v === "yes" || v === "partial" || v === "no") return v;
    return null;
  }

  export default async function NewReflectionPage({
    searchParams,
  }: {
    searchParams: Promise<{ goalId?: string | string[] }>;
  }) {
    const sp = await searchParams;
    const rawGoalId = sp.goalId;
    const goalId = Array.isArray(rawGoalId) ? rawGoalId[0] : rawGoalId;

    if (!goalId) redirect("/home");

    const supabase = await supabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) redirect("/login");

    const { data: goal, error: goalErr } = await supabase
      .from("goals")
      .select("id, pillar, title")
      .eq("id", goalId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (goalErr || !goal) redirect("/home");

    const { data: plan } = await supabase
      .from("goal_plans")
      .select("id, version, plan_json")
      .eq("goal_id", goalId)
      .eq("user_id", user.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const executionSteps = Array.isArray(plan?.plan_json?.execution_steps)
      ? plan.plan_json.execution_steps
      : [];

    const currentStep = executionSteps.find((s: any) => s && !s.completed) ?? null;

    async function completeStep() {
      "use server";

      const supabase = await supabaseServer();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) redirect("/login");

      const { data: plan } = await supabase
        .from("goal_plans")
        .select("id, plan_json")
        .eq("goal_id", goalId)
        .eq("user_id", user.id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!plan) redirect("/home");

      const steps = plan.plan_json.execution_steps ?? [];

      const index = steps.findIndex((s: any) => !s.completed);

      if (index === -1) redirect("/home");

      steps[index].completed = true;

      const next = steps[index + 1];

      await supabase
        .from("goal_plans")
        .update({
          plan_json: {
            ...plan.plan_json,
            execution_steps: steps,
          },
        })
        .eq("id", plan.id);

      if (next) {
        await supabase
          .from("goals")
          .update({ next_action: next.step })
          .eq("id", goalId)
          .eq("user_id", user.id);
      }

      revalidatePath("/home");
      redirect("/home");
    }

    async function createWeeklyCheckIn( _prevState: ActionResult, formData: FormData): Promise<ActionResult> {
    "use server";
      const supabase = await supabaseServer();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) redirect("/login");

      // Re-validate goal ownership inside the action (prevents tampering)
      const { data: ownedGoal, error: ownedGoalErr } = await supabase
        .from("goals")
        .select("id")
        .eq("id", goalId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (ownedGoalErr || !ownedGoal) {
        return { ok: false, message: "Goal not found." };
      }

      const action_taken = String(formData.get("action_taken") ?? "").trim();
      const easier_harder = String(formData.get("easier_harder") ?? "").trim();
      const alignmentRaw = String(formData.get("alignment") ?? "").trim();
      const next_step = String(formData.get("next_step") ?? "").trim() || "";

      const alignment = normalizeAlignment(alignmentRaw);

      if (!action_taken || !easier_harder || !alignment) {
        return { ok: false, message: "Please complete all fields." };
      }

      const week_start_date = getWeekStartDateNY(new Date());

      // Upsert + require readback so we never silently “succeed”
      const upsertPayload = {
        user_id: user.id,
        goal_id: goalId,
        week_start_date,
        action_taken,
        easier_harder,
        alignment,
        next_step,
      };

      const { data: saved, error } = await supabase
        .from("reflections")
        .upsert(upsertPayload, { onConflict: "user_id,goal_id,week_start_date" })
        const next_step = String(formData.get("next_step") ?? "").trim();
        .maybeSingle();

      if (error) {
        return { ok: false, message: error.message };
      }

      if (!saved) {
        return {
          ok: false,
          message:
            "Save returned no row. Check RLS policies for reflections and confirm updated_at exists.",
        };
      }

      revalidatePath("/home");
      revalidatePath("/progress");

      redirect("/home");
    }

    const week_start_date = getWeekStartDateNY(new Date());

    return (
    <main className="min-h-screen bg-background">
      <div className="mb-6">
        <BackButton fallbackHref="/home" />
      </div>
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <div className="flex items-center justify-between">
        </div>

        <div className="mt-8 mb-10">
          <h1 className="mt-2 text-2xl font-semibold leading-snug">
            {goal.title}
          </h1>

          <div className="mt-3 text-sm text-muted-foreground">
            A quiet, structured review for this week.
          </div>
        </div>

        {currentStep ? (
          <section className="mb-8 rounded-2xl border border-border/60 bg-background/60 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Focus
            </div>

            <div className="mt-3 grid grid-cols-[1fr_auto] gap-4 items-start">

            <div className="flex gap-3 min-w-0">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-border"></div>

              <div className="min-w-0">
                <div className="text-sm text-foreground">
                  {currentStep.step}
                </div>

                {currentStep.definition_of_done ? (
                  <div className="text-xs text-muted-foreground">
                    {currentStep.definition_of_done}
                  </div>
                ) : null}
              </div>
            </div>

            <form action={completeStep}>
              <button
                type="submit"
                className="text-xs rounded-xl border border-border px-3 py-1 hover:bg-muted transition"
              >
                Complete
              </button>
            </form>

          </div>
          </section>
        ) : null}

        <WeeklyCheckInForm action={createWeeklyCheckIn} goalId={goalId} weekStartDate={week_start_date} />
      </div>
    </main>
  );
}