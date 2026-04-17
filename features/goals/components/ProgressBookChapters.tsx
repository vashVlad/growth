import clsx from "clsx";
import { GoalCardNarrative } from "@/features/goals/components/GoalCardNarrative";
import type {ProgressDbGoal, ProgressDbReflection} from "@/features/goals/data/progressGoalHistory.server";
import { journeyMomentLine } from "@/features/goals/lib/journeyMomentLine";
import {formatShortDate, pillarLabel} from "@/features/goals/lib/progressDisplayFormat";

type FormattedReflection = ProgressDbReflection & {
  formatted_action?: string;
};


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
  insightsByGoal,
}: {
  goalRows: ProgressDbGoal[];
  reflectionsByGoal: Map<string, ProgressDbReflection[]>;
  insightsByGoal?: Map<string, string | null>;
}) {
  const ordered = chaptersForBook(goalRows);

  return (
      <section className="mt-12" aria-label="Chapters">
      {ordered.map((g, index) => {
        const list = (reflectionsByGoal.get(g.id) ?? []) as FormattedReflection[];
        const chronological = [...list].reverse();
        const latest = list[0];
        const milestone = g.milestone?.trim() ? g.milestone.trim() : null;
        const insight = insightsByGoal?.get(g.id);

        return (
          <article
            key={g.id}
            className={clsx(
            "space-y-6",
            index === 0 ? "pt-0" : "mt-40 pt-8"
          )}
          >
            {/* Chapter Label */}
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/60 mt-10">
              Chapter {index + 1} • {pillarLabel(g.pillar)}
            </div>

            {/* Title */}
            <h2
              className="mt-3 font-serif leading-[1.05] tracking-[-0.02em] text-foreground"
              style={{ fontSize: "30px" }}
            >
              {g.title}
            </h2>

            {/* Milestone */}
            {milestone ? (
              <p className="text-sm text-muted-foreground">
                Milestone: {milestone}
              </p>
            ) : null}

            {/* Narrative */}
            <div className="pt-1 space-y-3 max-w-[52ch]">
              <GoalCardNarrative
                goalId={g.id}
                status={g.status === "completed" ? "completed" : "archived"}
                title={g.title}
                actionTaken={latest?.action_taken}
                easierHarder={latest?.easier_harder}
              />
            </div>

            {/* Moments */}
            <div className="pt-1">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70 mb-3">
                Moments
              </p>

              {chronological.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  This chapter has no recorded moments.
                </div>
              ) : (
                <div className="space-y-6 pl-1">
                  {chronological.map((r) => {
                    const moment = journeyMomentLine(
                      r.formatted_action ?? r.action_taken,
                      r.easier_harder
                    );

                    return (
                      <div key={r.id} className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {formatShortDate(r.week_start_date)}
                        </div>
                        <div className="text-[15px] leading-[1.8] text-foreground/90">
                          {moment}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <>
              <p className="text-xs uppercase tracking-wide text-muted-foreground/70 mb-2">
                Insight
              </p>

              <p className="text-sm leading-relaxed text-muted-foreground max-w-[58ch] mb-10">
                {insight || "Progress appears steady, though patterns are not clearly defined yet."}
              </p>
            </>
          </article>
        );
      })}
    </section>
  );
}