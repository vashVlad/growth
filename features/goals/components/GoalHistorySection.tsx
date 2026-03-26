import { supabaseServer } from "@/lib/supabase/server";
import { SoftDisclosure } from "@/components/ui/SoftDisclosure";
import { CompletionSummaryButton } from "@/components/ai/CompletionSummaryButton";
import ExecutionTimeline from "@/components/goals/ExecutionTimeline";

type Pillar = "career" | "personal" | "internal";
type GoalStatus = "active" | "completed" | "archived";

type DbGoal = {
  id: string;
  pillar: Pillar;
  title: string;
  milestone: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
};

type DbReflection = {
  id: string;
  goal_id: string;
  week_start_date: string; // date
  action_taken: string;
  easier_harder: string;
  alignment: "yes" | "partial" | "no" | string;
  next_step: string;
  created_at: string;
  updated_at: string | null;
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

function formatStamp(iso: string | null | undefined) {
  if (!iso) return "";
  return String(iso).slice(0, 16).replace("T", " ");
}

function prettyAlignment(a: string | null | undefined) {
  const v = String(a ?? "").trim().toLowerCase();
  if (!v) return "—";
  if (v === "yes") return "Yes";
  if (v === "no") return "No";
  if (v === "partial") return "Partial";
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function alignmentTone(a: string | null | undefined) {
  const v = prettyAlignment(a);
  if (v === "Yes") return "Aligned";
  if (v === "No") return "Misaligned";
  if (v === "Partial") return "Partially aligned";
  return v;
}

// "2026-02-23" -> "Feb 23"
function formatShortDate(iso: string | null | undefined) {
  const s = String(iso ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "—";
  const [, m, d] = s.split("-").map(Number);
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
  ];
  return `${months[(m ?? 1) - 1] ?? "—"} ${d}`;
}

function chip(text: string) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/50 bg-background/40 px-2.5 py-1 text-xs text-muted-foreground">
      {text}
    </span>
  );
}

export default async function GoalHistorySection( {plans = [],} : {plans?: any[];} ) {
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

  const goalIds = goalRows.map((g) => g.id);

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

  const reflectionsByGoal = new Map<string, DbReflection[]>();
  if (!refErr) {
    for (const r of (reflections ?? []) as DbReflection[]) {
      const arr = reflectionsByGoal.get(r.goal_id) ?? [];
      arr.push(r);
      reflectionsByGoal.set(r.goal_id, arr);
    }
  }

  return (
    <section className="space-y-3">
      {goalRows.map((g) => {
        const plan = plans.find((p) => p.goal_id === g.id);
        const steps = plan?.plan_json?.execution_steps ?? [];
        const list = reflectionsByGoal.get(g.id) ?? [];
        const chronological = [...list].reverse();
        const reflectionsForGoal = chronological;
        const latest = list[0];

        const checkIns = list.length;

        const firstWeek = chronological[0]?.week_start_date;
        const lastWeek = chronological[chronological.length - 1]?.week_start_date;

        const span =
        firstWeek && lastWeek
          ? (() => {
              const a = formatShortDate(firstWeek); // "Feb 16"
              const b = formatShortDate(lastWeek);  // "Feb 23"
              if (a === b) return a;

              const [am, ad] = a.split(" ");
              const [bm, bd] = b.split(" ");

              // Same month: "Feb 16–23"
              if (am && bm && am === bm) return `${am} ${ad}–${bd}`;

              // Different month: keep "Feb 28–Mar 3"
              return `${a}–${b}`;
            })()
          : "—";

        const isCompleted = g.status === "completed";

        const milestone = g.milestone?.trim() ? g.milestone.trim() : null;
        const lastAlignment = latest ? prettyAlignment(latest.alignment) : "—";
        const lastIntention = latest?.next_step?.trim()
          ? latest.next_step.trim()
          : null;

        return (
          <div
            key={g.id}
            className="rounded-2xl border border-border/60 bg-background/60 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              {pillarLabel(g.pillar)} • {statusLabel(g.status)}
            </div>

            <div className="mt-2 text-[22px] font-semibold tracking-tight leading-snug text-foreground">
              {g.title}
            </div>

            {milestone ? (
              <div className="mt-1 text-sm text-muted-foreground">
                <span className="text-foreground/70">Milestone:</span>{" "}
                <span className="text-muted-foreground">{milestone}</span>
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              {chip(alignmentTone(latest?.alignment))}
              {chip(`${checkIns} check-in${checkIns === 1 ? "" : "s"}`)}
              {chip(span)}
            </div>

            <ExecutionTimeline steps={steps} reflections={reflectionsForGoal} />

            {isCompleted ? (
              <div className="mt-4">
                <CompletionSummaryButton goalId={g.id} />
              </div>
            ) : null}

            <div className="mt-4">
              <SoftDisclosure title="View journey">
                {chronological.length === 0 ? (
                  <div className="text-xs text-muted-foreground">
                    No check-ins found for this goal.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chronological.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-xl border border-border/30 bg-background/30 p-4"
                      >
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {formatShortDate(r.week_start_date)}
                          </div>
                          <div className="mt-0.5 text-sm text-foreground/80">
                            {alignmentTone(r.alignment)}
                          </div>
                        </div>

                        {r.updated_at || r.created_at ? (
                          <div className="mt-1 text-[10px] text-muted-foreground/50">
                            Edited: {formatStamp(r.updated_at ?? r.created_at)}
                          </div>
                        ) : null}

                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                          <div>
                            <span className="text-foreground/80">Action:</span>{" "}
                            {r.action_taken}
                          </div>
                          <div>
                            <span className="text-foreground/80">Easier/Harder:</span>{" "}
                            {r.easier_harder}
                          </div>
                          <div>
                            <span className="text-foreground/80">Intention:</span>{" "}
                            {r.next_step}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SoftDisclosure>
            </div>
          </div>
        );
      })}
    </section>
  );
}