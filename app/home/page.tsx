import Link from "next/link";
import { redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { HomeFocusController } from "@/components/focus/HomeFocusController";
import { Guidance } from "@/components/ai/Guidance";
import { getWeekStartDateNY } from "@/lib/dates/weekStart";
import { CompleteGoalButton } from "@/components/goals/CompleteGoalButton";

type Pillar = "career" | "personal" | "internal";

type GoalRow = {
  id: string;
  pillar: Pillar;
  title: string;
  milestone: string | null;
  next_action: string | null;
  status: string;
};

const PILLAR_ORDER: Pillar[] = ["career", "personal", "internal"];

function pillarLabel(pillar: Pillar) {
  if (pillar === "career") return "Career";
  if (pillar === "personal") return "Personal";
  return "Internal";
}

function sortGoals(goals: GoalRow[]) {
  const map = new Map<Pillar, GoalRow>();

  for (const g of goals)
    if (!map.has(g.pillar)) map.set(g.pillar, g);

  return PILLAR_ORDER.map((p) => map.get(p) ?? null);
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      {message}
    </div>
  );
}

function EmptyGoalsState() {
  return (
    <div className="rounded-2xl border border-border/40 bg-background/60 p-6 text-sm text-muted-foreground">
      <div className="space-y-2">
        <div className="text-foreground font-medium">No active goals found</div>
        <p>
          This should be rare. If it happens, refresh the page or review onboarding to confirm your setup.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button asChild variant="secondary" className="rounded-xl">
            <Link href="/onboarding">Review onboarding</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/home">Refresh</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SoftGoalCard({
  goal,
  reflectionId,
}: {
  goal: GoalRow;
  reflectionId?: string;
}) {
  return (
    <section
      id={`pillar-${goal.pillar}`}
      className="rounded-2xl border border-border/60 bg-background/60 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
    >
      {/* Top Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          {pillarLabel(goal.pillar)}
        </div>

        {goal.id ? (
          <Link
            href={`/goals/${goal.id}/adjust`}
            className="rounded-full border border-border px-3 py-1 text-xs text-foreground/80 hover:bg-muted transition-colors"
          >
            Adjust
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">Adjust</span>
        )}
      </div>

      {/* Title */}
      <div className="mt-3 text-xl font-medium leading-snug text-foreground">
        {goal.title}
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
        <div>
          <span className="text-foreground/80">Milestone:</span>{" "}
          {goal.milestone?.trim() ? goal.milestone : "—"}
        </div>
        <div>
          <span className="text-foreground/80">Current next step: </span>
          {goal.next_action?.trim() ? goal.next_action : "—"}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3 items-start">
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/reflections/new?goalId=${goal.id}`}>Update</Link>
        </Button>

        <CompleteGoalButton goalId={goal.id} />

        {reflectionId ? (
          <Guidance reflectionId={reflectionId} />
        ) : (
          <Button variant="ghost" disabled className="rounded-xl opacity-50 cursor-not-allowed">
            Guidance
          </Button>
        )}
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  /**
   * STEP 8 GUARD:
   * If identity (or onboarding) is missing, force onboarding.
   *
   * NOTE: Your table is currently queried as "profile".
   * In most setups it’s "profiles". Keep consistent with your schema.
   */
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("identity_statement, onboarding_complete")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fail closed into onboarding (no crashes)
  if (profileError) redirect("/onboarding");

  const identityStatement = profile?.identity_statement?.trim() ?? "";
  const onboardingComplete = Boolean(profile?.onboarding_complete);

  // Required: /home blocked until onboarding complete + identity exists
  if (!onboardingComplete || !identityStatement) redirect("/onboarding");

  // Load goals
  const { data: goals, error: goalsError } = await supabase
    .from("goals")
    .select("id, pillar, title, milestone, next_action, status, updated_at, created_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  // Load reflections for the week (even if it fails, we still render the page)
  const weekStart = getWeekStartDateNY();
  const { data: reflections, error: reflectionsError } = await supabase
    .from("reflections")
    .select("id, goal_id")
    .eq("user_id", user.id)
    .eq("week_start_date", weekStart);

  const reflectionByGoal = new Map<string, string>();
  for (const r of reflections ?? []) reflectionByGoal.set(r.goal_id, r.id);

  const normalized: GoalRow[] = (goals ?? []).map((g: any) => ({
    id: g.id,
    pillar: g.pillar,
    title: g.title,
    milestone: g.milestone,
    next_action: g.next_action,
    status: g.status,
  }));

  const ordered = sortGoals(normalized);
  const availablePillars = ordered.filter(Boolean).map((g) => (g as GoalRow).pillar); 
  const identityLine = identityStatement || "Becoming, one day at a time.";

  // Calm, inline error handling instead of throwing
  const loadError =
    goalsError
      ? "Couldn’t load your goals right now. Please refresh in a moment."
      : reflectionsError
      ? "Your goals loaded, but updates for this week couldn’t be checked. Refresh in a moment."
      : "";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Home
          </div>

          <Button asChild variant="ghost" className="h-8 rounded-xl px-2">
            <Link href="/identity" className="text-sm">
              Becoming → View
            </Link>
          </Button>
        </div>

        <div className="mt-10 max-w-[60ch]">
          <div className="font-serif text-3xl leading-snug text-foreground">
            {identityLine}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Your current pillars are active.
          </div>

          <HomeFocusController availablePillars={availablePillars} />
        </div>

        {/* STEP 8: calm errors */}
        {loadError ? (
          <div className="mt-6">
            <InlineError message={loadError} />
          </div>
        ) : null}

        <section className="mt-10 grid gap-4">
          {ordered.map((g, idx) => {
            const pillar = PILLAR_ORDER[idx];

            if (!g) {
              return (
                <section
                  key={pillar}
                  className="rounded-2xl border border-border/60 bg-background/60 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                >
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    {pillarLabel(pillar)}
                  </div>

                  <div className="mt-3 text-xl font-medium leading-snug text-foreground">
                    No active goal yet
                  </div>

                  <div className="mt-3 text-sm text-muted-foreground max-w-[60ch]">
                    Create a goal for this pillar to keep your cycle balanced.
                  </div>

                  <div className="mt-6">
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link href={`/goals/new?pillar=${pillar}`}>
                        Create goal
                      </Link>
                    </Button>
                  </div>
                </section>
              );
            }

            return (
              <SoftGoalCard
                key={g.pillar}
                goal={g}
                reflectionId={reflectionByGoal.get(g.id)}
              />
            );
          })}
        </section>

        <div className="mt-10 max-w-[65ch] text-xs text-muted-foreground">
          Small steps, repeated daily, become identity.
        </div>
        <a href="/api/auth/logout">Logout</a>
      </div>
    </main>
  );
}
