"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadGoal, saveGoal } from "@/features/goals/lib/storage";
import type { Goal } from "@/features/goals/types";

function nowIso() {
  return new Date().toISOString();
}

export default function GoalHero() {
  const [goal, setGoal] = React.useState<Goal | null>(null);

  React.useEffect(() => {
    setGoal(loadGoal());
  }, []);

  function setDemoGoal() {
    const g: Goal = {
      id: Date.now().toString(),
      statement: "Show up today—even if it’s messy—and move one step forward.",
      status: "active",
      createdAt: nowIso(),
    };
    setGoal(g);
    saveGoal(g);
  }

  function markComplete() {
    if (!goal) return;
    const updated: Goal = {
      ...goal,
      status: "completed",
      completedAt: nowIso(),
    };
    setGoal(updated);
    saveGoal(updated);
  }

  function clearGoal() {
    setGoal(null);
    saveGoal(null);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-lg">Today&apos;s Goal</CardTitle>
        {goal ? (
          <Badge variant={goal.status === "completed" ? "secondary" : "default"}>
            {goal.status === "completed" ? "Completed" : "Active"}
          </Badge>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        {!goal ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Set a goal you’ll see every time you open the app.
            </p>
            <Button onClick={setDemoGoal}>Set a goal</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-base">{goal.statement}</p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={markComplete}
                disabled={goal.status === "completed"}
              >
                Mark complete
              </Button>
              <Button variant="secondary" onClick={clearGoal}>
                Edit goal
              </Button>
            </div>

            {goal.status === "completed" && goal.completedAt ? (
              <p className="text-xs text-muted-foreground">
                Completed: {new Date(goal.completedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
