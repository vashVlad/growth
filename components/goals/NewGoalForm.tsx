"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Pillar = "career" | "personal" | "internal";
const PILLARS: Pillar[] = ["career", "personal", "internal"];

function pillarLabel(p: Pillar) {
  if (p === "career") return "Career";
  if (p === "personal") return "Personal";
  return "Internal";
}

export default function NewGoalForm({
  defaultPillar,
  activePillars,
}: {
  defaultPillar: Pillar;
  activePillars: Pillar[];
}) {
  const router = useRouter();
  const [pillar, setPillar] = React.useState<Pillar>(defaultPillar);
  const [title, setTitle] = React.useState("");
  const [milestone, setMilestone] = React.useState("");
  const [nextAction, setNextAction] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isPillarTaken = activePillars.includes(pillar);
  const available = PILLARS.filter((p) => !activePillars.includes(p));
  const suggested = available[0];

  const canSubmit =
    title.trim().length > 0 &&
    milestone.trim().length > 0 &&
    nextAction.trim().length > 0 &&
    !isPillarTaken;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/goals/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pillar,
        title: title.trim(),
        milestone: milestone.trim(),
        next_action: nextAction.trim(),
      }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setError(body?.error ?? "Could not create goal.");
      return;
    }

    router.replace("/home");
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label className="text-foreground">Pillar</Label>

        <div className="flex flex-wrap gap-2">
          {PILLARS.map((p) => {
            const disabled = activePillars.includes(p);
            const selected = pillar === p;

            return (
              <button
                key={p}
                type="button"
                onClick={() => !disabled && setPillar(p)}
                className={[
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-muted",
                  selected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border"
                ].join(" ")}
                aria-disabled={disabled}
              >
                {pillarLabel(p)}
              </button>
            );
          })}
        </div>

        {isPillarTaken ? (
          <p className="text-sm text-destructive">
            You already have an active {pillarLabel(pillar)} goal.{" "}
            {suggested ? (
              <button
                type="button"
                className="underline underline-offset-4"
                onClick={() => setPillar(suggested)}
              >
                Create {pillarLabel(suggested)} instead.
              </button>
            ) : (
              "Complete one of your goals first."
            )}
          </p>
        ) : null}
      </div>

      <div className="space-y-2.5">
        <Label className="text-foreground">Goal statement</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What are you aiming for?"
          disabled={loading}
        />
      </div>

      <div className="space-y-2.5">
        <Label className="text-foreground">90-day milestone</Label>
        <Input
          value={milestone}
          onChange={(e) => setMilestone(e.target.value)}
          placeholder="What does progress look like in 90 days?"
          disabled={loading}
        />
      </div>

      <div className="space-y-2.5">
        <Label className="text-foreground">Next action</Label>
        <Input
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
          placeholder="What is the very first step?"
          disabled={loading}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="pt-6">
        <Button type="submit" className="w-full h-11 rounded-xl">
          Create goal
        </Button>
      </div>
    </form>
  );
}