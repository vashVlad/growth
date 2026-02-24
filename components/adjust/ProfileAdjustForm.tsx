"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adjustProfileIdentity } from "@/app/actions/adjustments";

type Props = { initialIdentity: string };

export default function ProfileAdjustForm({ initialIdentity }: Props) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [identity, setIdentity] = useState(initialIdentity);

  // Adjustment reflection fields
  const [reason, setReason] = useState("");
  const [changed, setChanged] = useState("");
  const [evo, setEvo] = useState<"evolution" | "avoidance">("evolution");

  const isChanged = useMemo(
    () => identity.trim() !== initialIdentity.trim(),
    [identity, initialIdentity]
  );
  const canContinue = identity.trim().length > 0 && isChanged;

  const canSave =
    canContinue &&
    reason.trim().length > 0 &&
    changed.trim().length > 0 &&
    (evo === "evolution" || evo === "avoidance");

  async function onSubmit() {
    setError(null);
    setDone(false);

    const fd = new FormData();
    fd.set("identity_statement", identity);
    fd.set("reason_misaligned", reason);
    fd.set("what_changed", changed);
    fd.set("evolution_or_avoidance", evo);

    startTransition(async () => {
        const res = await adjustProfileIdentity(fd);

        if (!res.ok) {
            setError(res.error);
            return;
        }

        router.replace(res.redirectTo ?? "/identity");
        router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      {done ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm text-neutral-800">Saved.</p>
          <p className="mt-1 text-xs text-neutral-600">
            Your adjustment reflection is stored for later review.
          </p>
        </div>
      ) : null}

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-neutral-800">
            Identity statement
          </label>
          <textarea
            className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-neutral-300"
            rows={4}
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            placeholder="A sentence or two that defines who you are becoming."
          />
          <div className="mt-2 text-xs text-neutral-500">
            {isChanged ? "Change detected." : "Edit to continue."}
          </div>
        </div>

        {step === 1 ? (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canContinue}
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-neutral-900">
                  Adjustment reflection
                </h2>
                <p className="mt-1 text-xs text-neutral-600">
                  Required before saving. Keep it honest and short.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-neutral-800">
                    What feels misaligned right now?
                  </label>
                  <textarea
                    className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-neutral-300"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-800">
                    What changed since you set this?
                  </label>
                  <textarea
                    className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-neutral-300"
                    rows={3}
                    value={changed}
                    onChange={(e) => setChanged(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-800">
                    Is this an evolution or an avoidance?
                  </label>
                  <select
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-neutral-300"
                    value={evo}
                    onChange={(e) => setEvo(e.target.value as any)}
                  >
                    <option value="evolution">Evolution</option>
                    <option value="avoidance">Avoidance</option>
                  </select>
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={pending}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 disabled:opacity-40"
              >
                Back
              </button>

              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSave || pending}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white
                    disabled:bg-neutral-300 disabled:text-neutral-500"
              >
                {pending ? "Saving…" : "Confirm & Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
