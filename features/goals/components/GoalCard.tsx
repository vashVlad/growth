"use client"

import { CalendarDays, CheckCircle2, Plus, RefreshCw, Target } from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Goal, GoalStatus } from "@/features/goals/lib/goal-types"

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface GoalCardProps {
  goal: Goal | null
  onCheckOff: () => void
  onReplace: () => void
  onSetGoal: () => void
}

export default function GoalCard({
  goal,
  onCheckOff,
  onReplace,
  onSetGoal,
}: GoalCardProps) {
  if (!goal) {
    return (
      <Card className="border-dashed border-2 bg-card">
        <CardContent className="flex flex-col items-center gap-4 py-12 px-6">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Target className="size-7 text-muted-foreground" />
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              No active goal
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Start your day with focus. Set a goal to track what matters most.
            </p>
          </div>
          <Button onClick={onSetGoal} className="mt-2">
            <Plus className="size-4" />
            Set a goal
          </Button>
        </CardContent>
      </Card>
    )
  }

  const isCompleted = goal.status === "completed"

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            {"Today's Goal"}
          </CardTitle>
          <Badge
            variant={isCompleted ? "secondary" : "default"}
            className={
              isCompleted
                ? "bg-success text-success-foreground"
                : ""
            }
          >
            {isCompleted && <CheckCircle2 className="size-3" />}
            {isCompleted ? "Completed" : "Active"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p
          className={`text-base leading-relaxed ${
            isCompleted
              ? "text-muted-foreground line-through decoration-muted-foreground/30"
              : "text-card-foreground"
          }`}
        >
          {goal.statement}
        </p>
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          <span>Created {formatDate(goal.createdAt)}</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2.5 sm:flex-row pt-0">
        {!isCompleted && (
          <Button
            onClick={onCheckOff}
            className="w-full sm:w-auto"
          >
            <CheckCircle2 className="size-4" />
            Check off
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onReplace}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="size-4" />
          Replace goal
        </Button>
      </CardFooter>
    </Card>
  )
}
