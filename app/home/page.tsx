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
  // pick most recent per pillar (you already order by updated/created desc in query)
  const map = new Map<Pillar, GoalRow>();
  for (const g of goals) if (!map.has(g.pillar)) map.set(g.pillar, g);
  return PILLAR_ORDER.map((p) => map.get(p) ?? null);
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      {message}
    </div>
  );
}

function SoftCardShell({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-border/60 bg-background/60 p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
    >
      {children}
    </section>
  );
}

function EmptyPillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <SoftCardShell id={`pillar-${pillar}`}>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        {pillarLabel(pillar)}
      </div>

      <div className="mt-3 text-lg sm:text-xl font-medium leading-snug text-foreground">
        No active goal yet
      </div>

      <div className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-[60ch]">
        Create a goal for this pillar to keep your cycle balanced.
      </div>

      <div className="mt-5">
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/goals/new?pillar=${pillar}`}>Create goal</Link>
        </Button>
      </div>
    </SoftCardShell>
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
    <SoftCardShell id={`pillar-${goal.pillar}`}>
      {/* Top Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          {pillarLabel(goal.pillar)}
        </div>

        <Link
          href={`/goals/${goal.id}/adjust`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Adjust
        </Link>
      </div>

      {/* Title */}
      <div className="mt-3 text-xl sm:text-2xl font-semibold leading-snug text-foreground">
        {goal.title}
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
        <div>
          <span className="text-foreground/80">Milestone:</span>{" "}
          {goal.milestone?.trim() ? goal.milestone : "—"}
        </div>
        <div>
          <span className="text-foreground/80">Current next step:</span>{" "}
          {goal.next_action?.trim() ? goal.next_action : "—"}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-start gap-3">
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/reflections/new?goalId=${goal.id}`}>
            Update
          </Link>
        </Button>

        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/goals/${goal.id}/plan`}>Plan</Link>
        </Button>
      </div>
    </SoftCardShell>
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

  // Profile guard
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("identity_statement, onboarding_complete")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) redirect("/onboarding");

  const identityStatement = profile?.identity_statement?.trim() ?? "";
  const onboardingComplete = Boolean(profile?.onboarding_complete);

  if (!onboardingComplete || !identityStatement) redirect("/onboarding");

  // Load active goals (ordered so "most recent" for each pillar wins)
  const { data: goals, error: goalsError } = await supabase
    .from("goals")
    .select(
      "id, pillar, title, milestone, next_action, status, updated_at, created_at"
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  // Load reflections for current week
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

  // For focus selector: only pillars with an active goal
  const activePillars = ordered
    .filter((g): g is GoalRow => Boolean(g))
    .map((g) => g.pillar);

  const identityLine = identityStatement || "Becoming, one day at a time.";

  const loadError =
    goalsError
      ? "Couldn’t load your goals right now. Please refresh in a moment."
      : reflectionsError
      ? "Your goals loaded, but updates for this week couldn’t be checked. Refresh in a moment."
      : "";

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:py-10">
      {/* HERO + FOCUS (single instance) */}
      <section className="space-y-5 sm:space-y-6">
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Today
          </div>

          <h1 className="font-serif text-[2rem] leading-[1.08] tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {identityLine}
          </h1>

          <div className="text-sm text-muted-foreground">
            Your current pillars are active.
          </div>
        </div>

        <HomeFocusController availablePillars={activePillars} />
      </section>

      {/* Errors */}
      {loadError ? (
        <div className="mt-6">
          <InlineError message={loadError} />
        </div>
      ) : null}

      {/* GOALS GRID (restored) */}
      <section className="mt-6 sm:mt-8 grid gap-4">
        {ordered.map((g, idx) => {
          const pillar = PILLAR_ORDER[idx];

          if (!g) return <EmptyPillarCard key={pillar} pillar={pillar} />;

          return (
            <SoftGoalCard
              key={g.id}
              goal={g}
              reflectionId={reflectionByGoal.get(g.id)}
            />
          );
        })}
      </section>

      {/* Footer */}
      <div className="mt-8 sm:mt-10 max-w-[65ch] text-xs text-muted-foreground">
        Small steps, repeated daily, become identity.
      </div>

      <div className="mt-4">
        <Button
          asChild
          variant="ghost"
          className="rounded-xl text-muted-foreground"
        >
          <a href="/api/auth/logout">Logout</a>
        </Button>
      </div>
    </main>
  );
}