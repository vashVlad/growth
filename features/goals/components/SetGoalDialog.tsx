"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SetGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (statement: string) => void;
  existingActive?: string | null;
}

export default function SetGoalDialog({
  open,
  onOpenChange,
  onSave,
  existingActive = null,
}: SetGoalDialogProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!open) setText("");
  }, [open]);

  const canSave = text.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existingActive ? "Replace Goal" : "Set a Goal"}</DialogTitle>
          <DialogDescription>
            Write one clear goal you want to see every time you open the app.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="goal-statement" className="text-sm font-medium">
            Goal statement
          </Label>
          <Textarea
            id="goal-statement"
            placeholder="Example: Finish my Data Mining assignment and submit before 8pm."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Tip: make it specific + finishable today.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(text.trim());
              onOpenChange(false);
            }}
            disabled={!canSave}
          >
            Save goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
