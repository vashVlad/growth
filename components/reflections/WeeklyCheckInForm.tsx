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

  // --- AI suggestion state (Step 9) ---
  const [suggestion, setSuggestion] = React.useState<string | null>(null);
  const [suggestVisible, setSuggestVisible] = React.useState(true);

  const [suggestLoading, setSuggestLoading] = React.useState(false);

  const nextStepRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      // Don’t spam while saving
      if (!goalId || !weekStartDate) return;

      setSuggestLoading(true);
      try {
        const res = await fetch("/api/ai/next-step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goal_id: goalId,
            week_start_date: weekStartDate,
          }),
        });

        if (!res.ok) {
          // Quietly fail (no scary error)
          if (!cancelled) setSuggestion(null);
          return;
        }

        const body = (await res.json().catch(() => null)) as
          | { suggestion?: string }
          | null;

        const text = String(body?.suggestion ?? "").trim();
        if (!cancelled) setSuggestion(text || null);
      } catch {
        if (!cancelled) setSuggestion(null);
      } finally {
        if (!cancelled) setSuggestLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [goalId, weekStartDate]);

  function useSuggestion() {
  const text = suggestion?.trim();
  if (!text) return;

  if (nextStepRef.current) {
    nextStepRef.current.value = text;
    nextStepRef.current.focus();
    const len = text.length;
    nextStepRef.current.setSelectionRange(len, len);
  }

  // Soft fade out
  setSuggestVisible(false);
}


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

      <Field
        label="What is your next intentional step?"
        name="next_step"
        placeholder="One clear step you’ll take next…"
        inputRef={nextStepRef}
      />

      {/* ✅ Minimal AI suggestion row (quiet, editable by default) */}
      <div className="-mt-6">
        {suggestLoading ? (
          <div
            className={`rounded-2xl border border-border/60 bg-background/60 px-4 py-3 transition-opacity duration-300 ${
                suggestVisible ? "opacity-100" : "opacity-0"
            }`}
            >
            <div className="h-3 w-28 rounded bg-muted" />
            <div className="mt-2 h-3 w-full rounded bg-muted" />
            <div className="mt-2 h-3 w-4/5 rounded bg-muted" />
          </div>
        ) : suggestion && suggestVisible ? (

          <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 transition-opacity duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Suggested
                </div>
                <div className="mt-2 text-sm leading-relaxed text-foreground/90">
                  {suggestion}
                </div>
              </div>

              <button
                type="button"
                onClick={useSuggestion}
                disabled={isPending}
                className="shrink-0 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground/80 shadow-sm transition hover:bg-muted disabled:opacity-60"
              >
                Use
              </button>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              Tap “Use” to prefill. You can still edit it.
            </div>
          </div>
        ) : null}
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
