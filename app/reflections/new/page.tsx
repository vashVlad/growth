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
      const next_step = String(formData.get("next_step") ?? "").trim();

      const alignment = normalizeAlignment(alignmentRaw);

      if (!action_taken || !easier_harder || !alignment || !next_step) {
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
        .select("id, user_id, goal_id, week_start_date, next_step, updated_at")
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

      // Sync weekly next_step into the goal's next_action (so /home updates)
      const { data: updatedGoal, error: goalUpdateErr } = await supabase
        .from("goals")
        .update({ next_action: next_step })
        .eq("id", goalId)
        .eq("user_id", user.id)
        .select("id, next_action, updated_at")
        .maybeSingle();

      if (goalUpdateErr) {
        return {
          ok: false,
          message: `Saved check-in, but failed to update goal: ${goalUpdateErr.message}`,
        };
      }
      if (!updatedGoal) {
        return {
          ok: false,
          message:
            "Saved check-in, but goal update affected 0 rows (RLS or wrong goal).",
        };
      }

      revalidatePath("/home");
      revalidatePath("/progress");

      redirect("/home");
    }

    const week_start_date = getWeekStartDateNY(new Date());

    return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <div className="flex items-center justify-between">
          <BackButton fallbackHref="/home" />
        </div>

        <div className="mt-8 mb-10">
          <div className="text-xs tracking-wide text-muted-foreground">
            Weekly Check-In • <span className="capitalize">{goal.pillar}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold leading-snug">
            {goal.title}
          </h1>
          <div className="mt-3 text-sm text-muted-foreground">
            A quiet, structured review for this week. All fields are required.
          </div>
        </div>

        <WeeklyCheckInForm action={createWeeklyCheckIn} goalId={goalId} weekStartDate={week_start_date} />
      </div>
    </main>
  );
}