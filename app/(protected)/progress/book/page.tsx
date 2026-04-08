import { redirect } from "next/navigation";
import { ProgressBookChapters } from "@/features/goals/components/ProgressBookChapters";
import { fetchProgressGoalHistory } from "@/features/goals/data/progressGoalHistory.server";
import { formatProgressNarrative } from "@/lib/narrative/formatProgress";
import { generateProgressInsight } from "@/lib/ai/progressInsight";

export default async function ProgressBookPage() {
  const result = await fetchProgressGoalHistory();

  if (!result.ok) {
    if (result.error === "auth") {
      redirect("/login");
    }
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-2xl px-5 py-10 space-y-10">
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {result.message}
          </div>
        </div>
      </main>
    );
  }

  const { goalRows, reflectionsByGoal } = result;

  const formattedReflections = formatProgressNarrative({
    reflectionsByGoal,
  });

  const insightsByGoal = new Map<string, string | null>();

  for (const goal of goalRows) {
    const goalId = String(goal.id);
    const reflections = formattedReflections.get(goalId) ?? [];

    const insight = await generateProgressInsight({
      goalTitle: goal.title ?? "Untitled goal",
      milestone: goal.milestone ?? null,
      reflections,
    });

    insightsByGoal.set(goalId, insight);
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 space-y-10">
        <div className="max-w-[60ch]">
          <h1 className="font-serif text-[36px] leading-snug text-foreground">
            Progress Book
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            One calm read through what you completed—story, not stats.
          </p>
        </div>

        <p className="text-xs text-muted-foreground/70">
          {goalRows.length} {goalRows.length === 1 ? "completed chapter" : "completed chapters"}
        </p>

        {goalRows.length === 0 ? (
          <section aria-label="Chapters">
            <p className="text-sm leading-relaxed text-muted-foreground">
              No completed or archived goals yet.
            </p>
          </section>
        ) : (
          <ProgressBookChapters
            goalRows={goalRows}
            reflectionsByGoal={formattedReflections}
            insightsByGoal={insightsByGoal}
          />
        )}
      </div>
    </main>
  );
}
