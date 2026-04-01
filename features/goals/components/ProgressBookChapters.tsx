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
    <section className="space-y-20" aria-label="Chapters">
      {ordered.map((g, index) => {
        const list = reflectionsByGoal.get(g.id) ?? [];
        const chronological = [...list].reverse();
        const latest = list[0];
        const milestone = g.milestone?.trim() ? g.milestone.trim() : null;

        return (
          <article key={g.id} className="space-y-6 py-10">
            {/* Chapter Label */}
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Chapter {index + 1} • {pillarLabel(g.pillar)}
            </div>

            {/* Title */}
            <h2 className="mt-3 font-serif text-[32px] leading-tight text-foreground">
              {g.title}
            </h2>

            {/* Milestone */}
            {milestone ? (
              <p className="text-sm text-muted-foreground">
                Milestone: {milestone}
              </p>
            ) : null}

            {/* Narrative */}
            <div className="pt-6 space-y-3">
              <GoalCardNarrative
                goalId={g.id}
                status={g.status === "completed" ? "completed" : "archived"}
                title={g.title}
                actionTaken={latest?.action_taken}
                easierHarder={latest?.easier_harder}
              />
            </div>

            {/* Moments */}
            <div className="pt-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">
                Moments
              </p>

              {chronological.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No check-ins found for this goal.
                </div>
              ) : (
                <div className="space-y-6 pl-2">
                  {chronological.map((r) => {
                    const moment = journeyMomentLine(
                      r.action_taken,
                      r.easier_harder
                    );

                    return (
                      <div key={r.id} className="space-y-2 py-2">
                        <div className="text-xs text-muted-foreground">
                          {formatShortDate(r.week_start_date)}
                        </div>
                        <div className="text-[15px] leading-relaxed text-foreground/90">
                          {moment}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="pt-8">
              <div className="h-px w-full bg-border/30" />
            </div>
          </article>
        );
      })}
    </section>
  );
}
/*fafjadjfasjf;*/