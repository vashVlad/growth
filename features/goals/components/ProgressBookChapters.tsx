import { GoalCardNarrative } from "@/features/goals/components/GoalCardNarrative";
import type {
  ProgressDbGoal,
  ProgressDbReflection,
} from "@/features/goals/data/progressGoalHistory.server";
import { journeyMomentLine } from "@/features/goals/lib/journeyMomentLine";
import {
  formatShortDate,
  pillarLabel,
} from "@/features/goals/lib/progressDisplayFormat";

/**
 * Chapters ordered by `updated_at` ascending (earlier last-update first), then
 * `id` for stability. Interprets `updated_at` as the best available proxy for
 * “when this goal last settled” in the absence of a dedicated completed_at.
 */
function chaptersForBook(goalRows: ProgressDbGoal[]): ProgressDbGoal[] {
  return [...goalRows].sort((a, b) => {
    const ta = new Date(a.updated_at).getTime();
    const tb = new Date(b.updated_at).getTime();
    if (Number.isNaN(ta) || Number.isNaN(tb)) return a.id.localeCompare(b.id);
    if (ta !== tb) return ta - tb;
    return a.id.localeCompare(b.id);
  });
}

export function ProgressBookChapters({
  goalRows,
  reflectionsByGoal,
}: {
  goalRows: ProgressDbGoal[];
  reflectionsByGoal: Map<string, ProgressDbReflection[]>;
}) {
  const ordered = chaptersForBook(goalRows);

  return (
    <section className="6" aria-label="Chapters">
      {ordered.map((g) => {
        const list = reflectionsByGoal.get(g.id) ?? [];
        const chronological = [...list].reverse();
        const latest = list[0];
        const milestone = g.milestone?.trim() ? g.milestone.trim() : null;

        return (
          <article key={g.id} className="space-y-6 py-12">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Chapter {ordered.indexOf(g) + 1} • {pillarLabel(g.pillar)}
            </div>

            <h2 className="font-serif text-3xl leading-tight text-foreground">    
              {g.title}
            </h2>

            {milestone ? (
              <p className="text-sm text-muted-foreground">
                Milestone: {milestone}
              </p>
            ) : null}

            <div className="pt-2">
              <GoalCardNarrative
                goalId={g.id}
                status={g.status === "completed" ? "completed" : "archived"}
                title={g.title}
                actionTaken={latest?.action_taken}
                easierHarder={latest?.easier_harder}
              />
            </div>

            <div className="pt-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Moments
              </p>
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
                      <div key={r.id} className="space-y-1 py-3">
                        <div className="text-xs text-muted-foreground">
                          {formatShortDate(r.week_start_date)}
                        </div>
                        <div className="text-sm leading-relaxed text-foreground">
                          {moment}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="pt-8">
              <div className="h-px w-full bg-border/50" />
            </div>
          </article>
        );
      })}
    </section>
  );
}
