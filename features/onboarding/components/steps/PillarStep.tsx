"use client";

import type { Pillar } from "@/lib/onboarding/types";
import { LIMITS } from "@/features/onboarding/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta: Record<Pillar, { title: string; prompt: string }> = {
  career: { title: "Career", prompt: "What career movement would support this identity?" },
  personal: { title: "Personal", prompt: "What discipline or skill strengthens this version of you?" },
  internal: { title: "Internal", prompt: "What internal shift matters most right now?" },
};

export default function PillarStep(props: {
  pillar: Pillar;
  value: { title: string; milestone: string; nextAction: string };
  onChange: (v: { title: string; milestone: string; nextAction: string }) => void;
  onBack: () => void;
  onContinue: () => void;
  error: string | null;
}) {
  const { pillar, value, onChange, onBack, onContinue, error } = props;
  const m = meta[pillar];

  return (
    <Card>
      <CardContent className="py-10 space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-2xl">{m.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{m.prompt}</p>
        </div>

        <div className="space-y-2">
          <Label>Goal title</Label>
          <Input
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            maxLength={LIMITS.goalTitle}
          />
        </div>

        <div className="space-y-2">
          <Label>1 milestone</Label>
          <Input
            value={value.milestone}
            onChange={(e) => onChange({ ...value, milestone: e.target.value })}
            maxLength={LIMITS.milestone}
          />
        </div>

        <div className="space-y-2">
          <Label>1 next action step</Label>
          <Input
            value={value.nextAction}
            onChange={(e) => onChange({ ...value, nextAction: e.target.value })}
            maxLength={LIMITS.nextAction}
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="mt-8 flex items-center justify-between px-1">
          <Button variant="outline" className="w-full" onClick={onBack}>
            Back
          </Button>
          <Button className="w-full" onClick={onContinue}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
