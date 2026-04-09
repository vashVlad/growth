"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  hasPlan: boolean;
  goalId: string;
};

export function GoalPlanSetupCard({ hasPlan, goalId }: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timeframeWeeks, setTimeframeWeeks] = useState("4");
  const [weeklyHours, setWeeklyHours] = useState("5");
  const [constraints, setConstraints] = useState("");
  const [intensity, setIntensity] = useState("balanced");

  async function generatePlan() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/goal-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalId,
          timeframeWeeks: Number(timeframeWeeks),
          weeklyHours: Number(weeklyHours),
          constraints,
          intensity,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error ?? "Failed to generate plan");
      }

      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-background/60 p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-foreground">
            {hasPlan ? "Current plan" : "No plan yet"}
          </div>
          <div className="text-sm text-muted-foreground">
            {hasPlan
              ? "You can rebuild this plan with new inputs."
              : "Break this goal into a step-by-step plan."}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={() => setOpen((v) => !v)}
          disabled={loading}
        >
          {open ? "Close" : hasPlan ? "Rebuild Plan" : "Break into Plan"}
        </Button>
      </div>

      {open ? (
        <div className="grid gap-6 pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-foreground">Timeframe</span>
              <select
                value={timeframeWeeks}
                onChange={(e) => setTimeframeWeeks(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
              >
                <option value="2">2 weeks</option>
                <option value="4">4 weeks</option>
                <option value="6">6 weeks</option>
                <option value="8">8 weeks</option>
                <option value="12">12 weeks</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-foreground">Weekly hours</span>
              <input
                type="number"
                min={1}
                max={40}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm text-foreground">Constraints</span>
            <textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              rows={4}
              placeholder="Optional. Example: no weekends, busy midterms."
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="grid gap-2 sm:max-w-[240px]">
            <span className="text-sm text-foreground">Style</span>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
            >
              <option value="aggressive">Aggressive</option>
              <option value="balanced">Balanced</option>
              <option value="light">Light</option>
            </select>
          </label>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="pt-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={generatePlan}
              disabled={loading}
            >
              {loading ? "Building a plan..." : "Generate Plan"}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}