"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeGoal } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";

export function CompleteGoalButton({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);

    const ok = window.confirm("Mark this goal as completed?");
    if (!ok) return;

    startTransition(async () => {
      const res = await completeGoal(goalId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        className="rounded-xl"
        disabled={pending}
        onClick={onClick}
      >
        {pending ? "Completing…" : "Complete"}
      </Button>

      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}