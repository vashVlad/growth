// app/reflections/new/page.tsx

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import WeeklyCheckInForm from "@/components/reflections/WeeklyCheckInForm";
import { getWeekStartDateNY } from "@/lib/dates/weekStart";
import { BackButton } from "@/components/nav/BackButton";

type Alignment = "yes" | "partially" | "no";

type ActionResult =
  | { ok: true }
  | { ok: false; message: string }
  | undefined;

function normalizeAlignment(v: string): Alignment | null {
  if (v === "yes" || v === "partially" || v === "no") return v;
  return null;
}

export default async function HomePage({
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

  async function createWeeklyCheckIn(
    _prevState: ActionResult,
    formData: FormData
  ): Promise<ActionResult> {
    "use server";

    const supabase = await supabaseServer();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) redirect("/login");

    const { data: ownedGoal } = await supabase
      .from("goals")
      .select("id")
      .eq("id", goalId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!ownedGoal) {
      return { ok: false, message: "Goal not found." };
    }

    const action_taken = String(formData.get("action_taken") ?? "").trim();
    const easier_harder = String(formData.get("easier_harder") ?? "").trim();
    const alignmentRaw = String(formData.get("alignment") ?? "").trim();
    const alignment = normalizeAlignment(alignmentRaw);
    const next_step = String(formData.get("next_step") ?? "").trim();

    if (!action_taken || !easier_harder || !next_step) {
      return { ok: false, message: "Please complete all fields." };
    }

    if (!alignment) {
      return { ok: false, message: "Please select alignment." };
    }

    const week_start_date = getWeekStartDateNY(new Date());

    const { data: saved, error } = await supabase
      .from("reflections")
      .upsert(
        {
          user_id: user.id,
          goal_id: goalId,
          week_start_date,
          action_taken,
          easier_harder,
          alignment,
          next_step,
        },
        { onConflict: "user_id,goal_id,week_start_date" }
      )
      .select()
      .maybeSingle();

    if (saved) {
      await supabase
        .from("ai_notes")
        .delete()
        .eq("user_id", user.id)
        .in(
          "reflection_id",
          (
            await supabase
              .from("reflections")
              .select("id")
              .eq("goal_id", goalId)
              .eq("user_id", user.id)
          ).data?.map((r) => r.id) ?? []
        );
    }

    if (error) {
      return { ok: false, message: error.message };
    }

    // ✅ ONLY SOURCE OF TRUTH
    await supabase
      .from("goals")
      .update({ next_action: next_step })
      .eq("id", goalId)
      .eq("user_id", user.id);


    revalidatePath("/home");
    revalidatePath("/progress");
    revalidatePath("/goals");

    redirect(`/home?guidance_goal=${goalId}`);
  }

  const week_start_date = getWeekStartDateNY(new Date());

  const { data: plan } = await supabase
    .from("goal_plans")
    .select("id, plan_json")
    .eq("goal_id", goalId)
    .eq("user_id", user.id)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const currentStep =
    plan?.plan_json?.execution_steps?.find((s: any) => !s.completed) ?? null;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-6 pb-10">
        <div className="mt-8 mb-10">
          <h1 className="mt-2 text-3xl font-serif font-medium leading-tight tracking-tight">
            {goal.title}
          </h1>

          <div className="mt-3 text-sm text-muted-foreground">
            A quiet moment to reflect on this week.
          </div>
        </div>  

        {currentStep && (
          <section className="mb-8 rounded-2xl border border-border/60 bg-background/60 p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Suggested focus
            </div>

            <div className="mt-2 text-sm text-foreground">
              {currentStep.step}
            </div>

            {currentStep.definition_of_done && (
              <div className="text-xs text-muted-foreground mt-1">
                {currentStep.definition_of_done}
              </div>
            )}
          </section>
        )}

        <WeeklyCheckInForm
          action={createWeeklyCheckIn}
          goalId={goalId}
          weekStartDate={week_start_date}
        />
      </div>
    </main>
  );
}