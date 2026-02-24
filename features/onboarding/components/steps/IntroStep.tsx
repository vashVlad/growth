"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function IntroStep({ onContinue }: { onContinue: () => void }) {
  return (
    <Card>
      <CardContent className="py-10 space-y-8">
        <div className="space-y-3">
          <p className="font-serif text-2xl">This space is private.</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You’re not here to track tasks.
            <br />
            You’re here to gain clarity and build yourself deliberately.
          </p>
        </div>

        <Button className="w-full" size="lg" onClick={onContinue}>
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}
