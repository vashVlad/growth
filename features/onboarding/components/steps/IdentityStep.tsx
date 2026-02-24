"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LIMITS } from "@/features/onboarding/schema";

export default function IdentityStep(props: {
  value: { identityStatement: string; identityBehaviors: string };
  onChange: (v: { identityStatement?: string; identityBehaviors?: string }) => void;
  onBack: () => void;
  onContinue: () => void;
  error: string | null;
}) {
  const { value, onChange, onBack, onContinue, error } = props;

  return (
    <Card>
      <CardContent className="py-10 space-y-6">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl">Identity Anchor</h1>
        </div>

        <div className="space-y-2">
          <Label>Who are you becoming in the next 90 days?</Label>
          <Input
            value={value.identityStatement}
            onChange={(e) => onChange({ identityStatement: e.target.value })}
            maxLength={LIMITS.identityStatement}
            placeholder="Max 120 characters"
          />
        </div>

        <div className="space-y-2">
          <Label>What does this version of you consistently do?</Label>
          <Textarea
            value={value.identityBehaviors}
            onChange={(e) => onChange({ identityBehaviors: e.target.value })}
            maxLength={LIMITS.identityBehaviors}
            rows={4}
            placeholder="Max 200 characters"
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
