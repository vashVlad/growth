"use client"

import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Eye,
  Flame,
  ListChecks,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Goal, GoalStatus } from "@/features/goals/lib/goal-types"
import { useState } from "react";
import ProofViewerDialog from "@/features/goals/components/ProofViewerDialog";


function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: GoalStatus }) {
  switch (status) {
    case "active":
      return (
        <Badge variant="default">
          <Flame className="size-3" />
          Active
        </Badge>
      )
    case "completed":
      return (
        <Badge
          variant="secondary"
          className="bg-success text-success-foreground"
        >
          <CheckCircle2 className="size-3" />
          Completed
        </Badge>
      )
    case "archived":
      return (
        <Badge variant="outline">
          <Archive className="size-3" />
          Archived
        </Badge>
      )
  }
}

interface GoalHistoryListProps {
  goals: Goal[]
  loading?: boolean
}

export function GoalHistoryListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-card">
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="h-4 w-3/4 rounded-md bg-muted" />
            <div className="flex gap-3">
              <div className="h-3 w-24 rounded-md bg-muted" />
              <div className="h-3 w-24 rounded-md bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


export default function GoalHistoryList({
  goals,
  loading = false,
}: GoalHistoryListProps) {
  if (loading) {
    return <GoalHistoryListSkeleton />
  }

  if (goals.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-card">
        <CardContent className="flex flex-col items-center gap-3 py-12 px-6">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <ListChecks className="size-7 text-muted-foreground" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-base font-semibold text-foreground">
              No goals yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Goals you create will appear here so you can track your progress
              over time.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
  const [proofOpen, setProofOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState<{
    id: string;
    filename: string;
    mimeType: string;
    } | null>(null);

  const sorted = [...goals].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);  

  return (
    <div className="flex flex-col gap-3" role="list" aria-label="Goal history">
      {sorted.map((goal) => (
        <Card key={goal.id} className="bg-card" role="listitem">
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <p
                className={`text-sm font-medium leading-relaxed flex-1 ${
                  goal.status === "completed"
                    ? "text-muted-foreground line-through decoration-muted-foreground/30"
                    : goal.status === "archived"
                      ? "text-muted-foreground"
                      : "text-card-foreground"
                }`}
              >
                {goal.statement}
              </p>
              <StatusBadge status={goal.status} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3" />
                  Created {formatDate(goal.createdAt)}
                </span>
                {goal.completedAt && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    Done {formatDate(goal.completedAt)}
                  </span>
                )}
              </div>

              {goal.status === "completed" && goal.proof?.filename && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2 -mr-2"
                    onClick={() => {
                    setSelectedProof({
                        id: goal.proof!.id,
                        filename: goal.proof!.filename,
                        mimeType: goal.proof!.mimeType,
                    });
                    setProofOpen(true);
                    }}
                >
                    <Eye className="size-3" />
                    View proof
                </Button>
                )}
            </div>

            {goal.completionNote && (
              <p className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2 leading-relaxed">
                {goal.completionNote}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
      <ProofViewerDialog
        open={proofOpen}
        onOpenChange={setProofOpen}
        proofId={selectedProof?.id ?? null}
        filename={selectedProof?.filename ?? null}
        mimeType={selectedProof?.mimeType ?? null}
        />
    </div>
  )
}
