import { SoftDisclosure } from "@/components/ui/SoftDisclosure";
import { GoalCardNarrative } from "@/features/goals/components/GoalCardNarrative";
import { fetchProgressGoalHistory } from "@/features/goals/data/progressGoalHistory.server";
import { journeyMomentLine } from "@/features/goals/lib/journeyMomentLine";
import {
  formatShortDate,
  pillarLabel,
} from "@/features/goals/lib/progressDisplayFormat";

export default async function GoalHistorySection() {
  const result = await fetchProgressGoalHistory();

  if (!result.ok) {
    if (result.error === "auth") {
      return (
        <div className="rounded-2xl border border-border/40 bg-background/60 p-6 text-sm text-muted-foreground">
          Please log in again.
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {result.message}
      </div>
    );
  }

  const { goalRows, reflectionsByGoal } = result;

  if (goalRows.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-background/60 mt-4 text-sm text-muted-foreground">
        No completed or archived goals yet.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {goalRows.map((g) => {
        const list = reflectionsByGoal.get(g.id) ?? [];
        const chronological = [...list].reverse();
        const latest = list[0];

        const milestone = g.milestone?.trim() ? g.milestone.trim() : null;

        return (
          <div
            key={g.id}
            className="rounded-2xl border border-border/40 bg-background/60 px-6 py-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <div className="max-w-[540px]">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground/80">
                {pillarLabel(g.pillar)}
              </div>

              <div className="mt-2 text-[22px] font-semibold tracking-tight leading-snug text-foreground">
                {g.title}
              </div>

              {milestone ? (
                <div className="mt-3 text-sm text-muted-foreground">
                  <span className="text-foreground/70">Milestone:</span>{" "}
                  <span className="text-muted-foreground">{milestone}</span>
                </div>
              ) : null}

              <GoalCardNarrative
                goalId={g.id}
                status={g.status === "completed" ? "completed" : "archived"}
                title={g.title}
                actionTaken={latest?.action_taken}
                easierHarder={latest?.easier_harder}
              />

              <div className="mt-5">
                <SoftDisclosure title="View journey">
                  {chronological.length === 0 ? (
                    <div className="text-xs text-muted-foreground">
                      No check-ins found for this goal.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {chronological.map((r, i) => {
                        const isFirst = i === 0;
                        const isLast = i === chronological.length - 1;
                        const fadeOldest =
                          isFirst && chronological.length > 1 ? "opacity-80" : "";
                        const actionClass = isLast
                          ? "text-sm leading-relaxed text-foreground"
                          : "text-sm leading-relaxed text-foreground/85";
                        const moment = journeyMomentLine(
                          r.action_taken,
                          r.easier_harder
                        );

                        return (
                          <div key={r.id} className={fadeOldest}>
                            <div className="text-[11px] leading-relaxed text-muted-foreground/70">
                              {formatShortDate(r.week_start_date)}
                            </div>
                            <div className={`mt-2 ${actionClass}`}>
                              {moment}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </SoftDisclosure>
              </div>
            </div>
        </div>
        );
      })}
    </section>
  );
}