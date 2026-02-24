import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type Pillar = "career" | "personal" | "internal";
type GoalStatus = "active" | "completed" | "archived";

type DbGoal = {
  id: string;
  pillar: Pillar;
  title: string;
  milestone: string | null;
  next_action: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
};

type DbReflection = {
  id: string;
  goal_id: string;
  week_start_date: string;
  next_step: string | null;
  created_at: string;
  updated_at: string | null;
};

type HistoryItem = DbGoal & {
  latest_reflection?: {
    id: string;
    week_start_date: string;
    next_step: string | null;
    updated_at: string | null;
    created_at: string;
  };
};

function pillarLabel(p: Pillar) {
  if (p === "career") return "Career";
  if (p === "personal") return "Personal";
  return "Internal";
}

function statusLabel(s: GoalStatus) {
  if (s === "completed") return "Completed";
  if (s === "archived") return "Archived";
  return "Active";
}

export default async function GoalHistorySection() {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return (
      <div className="rounded-2xl border border-border/60 bg-background/60 p-6 text-sm text-muted-foreground">
        Please log in again.
      </div>
    );
  }

  // 1) Load NON-active goals from DB
  const { data: goals, error: goalsErr } = await supabase
    .from("goals")
    .select("id, pillar, title, milestone, next_action, status, created_at, updated_at")
    .eq("user_id", user.id)
    .in("status", ["completed", "archived"])
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (goalsErr) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Couldn’t load your goal history. Please refresh.
      </div>
    );
  }

  const goalRows = (goals ?? []) as DbGoal[];

  if (goalRows.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-background/60 p-6 text-sm text-muted-foreground">
        No completed or archived goals yet.
      </div>
    );
  }

  // 2) Load reflections for these goals (latest per goal)
  const goalIds = goalRows.map((g) => g.id);

  const { data: reflections, error: refErr } = await supabase
    .from("reflections")
    .select("id, goal_id, week_start_date, next_step, created_at, updated_at")
    .eq("user_id", user.id)
    .in("goal_id", goalIds)
    // newest reflections first
    .order("week_start_date", { ascending: false })
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  // Even if reflections fail, still show goals history
  const reflectionByGoal = new Map<string, DbReflection>();
  if (!refErr) {
    for (const r of (reflections ?? []) as DbReflection[]) {
      if (!reflectionByGoal.has(r.goal_id)) reflectionByGoal.set(r.goal_id, r);
    }
  }

  const items: HistoryItem[] = goalRows.map((g) => {
    const r = reflectionByGoal.get(g.id);
    return {
      ...g,
      latest_reflection: r
        ? {
            id: r.id,
            week_start_date: r.week_start_date,
            next_step: r.next_step ?? null,
            updated_at: r.updated_at ?? null,
            created_at: r.created_at,
          }
        : undefined,
    };
  });

  return (
    <section className="space-y-3">
      {items.map((g) => (
        <div
          key={g.id}
          className="rounded-2xl border border-border/60 bg-background/60 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              {pillarLabel(g.pillar)} • {statusLabel(g.status)}
            </div>

            <Link
              href={`/goals/${g.id}/adjust`}
              className="rounded-full border border-border px-3 py-1 text-xs text-foreground/80 hover:bg-muted transition-colors"
            >
              View
            </Link>
          </div>

          <div className="mt-2 text-lg font-medium leading-snug text-foreground">
            {g.title}
          </div>

          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            <div>
              <span className="text-foreground/80">Milestone:</span>{" "}
              {g.milestone?.trim() ? g.milestone : "—"}
            </div>
            <div>
              <span className="text-foreground/80">Next action:</span>{" "}
              {g.next_action?.trim() ? g.next_action : "—"}
            </div>
            <div>
              <span className="text-foreground/80">Latest weekly next step:</span>{" "}
              {g.latest_reflection?.next_step?.trim()
                ? g.latest_reflection.next_step
                : "—"}
            </div>
          </div>
          
          {g.latest_reflection?.week_start_date ? (
            <div className="mt-2 text-[11px] text-muted-foreground/70">
              Last check-in week: {g.latest_reflection.week_start_date}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              className="rounded-xl border border-border px-3 py-2 text-xs hover:bg-muted transition-colors"
              href={`/reflections/new?goalId=${g.id}`}
            >
              Open weekly check-in
            </Link>
          </div>

          <div className="mt-3 text-[11px] text-muted-foreground/70">
            Goal id: {g.id}
          </div>
        </div>
      ))}
    </section>
  );
}