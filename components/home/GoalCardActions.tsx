"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Guidance } from "@/components/ai/Guidance";

type Props = {
  goalId: string;
  reflectionId?: string;
  autoOpen?: boolean;
};

export function GoalCardActions({
  goalId,
  reflectionId,
  autoOpen = false,
}: Props) {
  const [showGuidance, setShowGuidance] = useState(autoOpen);

  useEffect(() => {
    if (autoOpen) setShowGuidance(true);
  }, [autoOpen]);

  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={`/reflections/new?goalId=${goalId}`}>Update</Link>
          </Button>

          <Button asChild variant="outline" className="rounded-xl">
            <Link href={`/goals/${goalId}/plan`}>Plan</Link>
          </Button>
        </div>

        {reflectionId ? (
          <button
            type="button"
            onClick={() => setShowGuidance((v) => !v)}
            className="inline-flex items-center rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            {showGuidance ? "Close insight" : "✦ Guidance"}
          </button>
        ) : null}
      </div>

      {reflectionId ? (
        <Guidance reflectionId={reflectionId} open={showGuidance} />
      ) : null}
    </div>
  );
}