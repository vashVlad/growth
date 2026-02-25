"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Pillar = "career" | "personal" | "internal";

type SummaryData = {
  identityStatement: string;
  identityBehaviors: string;
  goals: Record<
    Pillar,
    {
      title: string;
      milestone: string;
      nextAction: string;
    }
  >;
};

export default function SummaryStep(props: {
  data: SummaryData;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const { data, onBack, onSubmit, submitting, error } = props;

  return (
    <Card>
      <CardContent className="py-10 space-y-6">
        <h1 className="font-serif text-2xl">Commitment Summary</h1>

        <div className="rounded-xl border p-4 space-y-1">
          <div className="text-xs text-muted-foreground">Identity</div>
          <div className="leading-relaxed">{data.identityStatement}</div>
        </div>

        {(["career", "personal", "internal"] as const).map((p) => (
          <div key={p} className="rounded-xl border p-4 space-y-1">
            <div className="text-xs text-muted-foreground">
              {p === "career"
                ? "Career Goal"
                : p === "personal"
                ? "Personal Goal"
                : "Internal Goal"}
            </div>
            <div className="leading-relaxed">{data.goals[p].title}</div>
          </div>
        ))}

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="mt-8 flex items-center justify-between px-1 gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={onBack}
            disabled={submitting}
            type="button"
          >
            Back
          </Button>
          <Button
            className="w-full"
            onClick={onSubmit}
            disabled={submitting}
            type="button"
          >
            {submitting ? "Submitting…" : "Begin 90-Day Cycle"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}