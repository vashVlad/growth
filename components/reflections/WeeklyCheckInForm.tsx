"use client";

import * as React from "react";

type ActionResult =
  | { ok: true }
  | { ok: false; message: string }
  | undefined;

type WeeklyCheckInAction = (
  prevState: ActionResult,
  formData: FormData
) => Promise<ActionResult>;

export default function WeeklyCheckInForm({
  action,
  goalId,
  weekStartDate,
}: {
  action: WeeklyCheckInAction;
  goalId: string;
  weekStartDate: string;
}) {
  const [state, formAction, isPending] =
    React.useActionState<ActionResult, FormData>(action, undefined);

  const nextStepRef = React.useRef<HTMLTextAreaElement>(null);
  const [suggestion, setSuggestion] = React.useState<string>("");
  const [suggestVisible, setSuggestVisible] = React.useState(false);

  return (
    <form action={formAction} className="space-y-9">
      <Field
        autoFocus
        label="What action did you take?"
        name="action_taken"
        placeholder="A specific action you completed this week…"
      />

      <Field
        label="What made it easier or harder than expected?"
        name="easier_harder"
        placeholder="What helped, what got in the way, what surprised you…"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium">Alignment</label>
        <div className="flex flex-wrap gap-2">
          <RadioPill value="yes" label="Yes" />
          <RadioPill value="partial" label="Partially" />
          <RadioPill value="no" label="No" />
        </div>
        <p className="text-xs text-muted-foreground">
          Did your actions align with your stated identity and pillar focus?
        </p>
      </div>

      {state && !state.ok ? (
        <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm">
          {state.message}
        </div>
      ) : null}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-2xl border border-border bg-background px-5 py-3 text-sm font-medium shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Submit weekly check-in"}
        </button>

        <div className="mt-3 text-center text-xs text-muted-foreground">
          You’ll return to Home after submitting.
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  autoFocus,
  inputRef,
}: {
  label: string;
  name: string;
  placeholder: string;
  autoFocus?: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <textarea
        ref={inputRef as any}
        id={name}
        name={name}
        required
        rows={4}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-relaxed shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
      />
    </div>
  );
}

function RadioPill({
  value,
  label,
}: {
  value: "yes" | "partial" | "no";
  label: string;
}) {

  const id = `align-${value}`;
  return (
    <div className="relative">
      <input
        id={id}
        name="alignment"
        type="radio"
        value={value}
        required
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className="inline-flex cursor-pointer select-none items-center rounded-full border border-border bg-background px-4 py-2 text-sm shadow-sm transition hover:bg-muted peer-checked:border-primary/30 peer-checked:bg-primary/5"
      >
        {label}
      </label>
    </div>
  );
}
