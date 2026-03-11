type ExecutionStep = {
  step: string;
  definition_of_done?: string;
  completed?: boolean;
};

export function ExecutionSteps({
  steps,
  title="Next actions",
}: {
  steps: ExecutionStep[];
  title?: string;
}) {
  if (!steps?.length) return null;

  return (
    <section className="rounded-2xl border border-border/60 bg-background/60 p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        {title}
      </div>

      <div className="mt-4 space-y-0">
        {steps.map((item, idx) => {
          const last = idx === steps.length - 1;
          const done = Boolean(item.completed);

          return (
            <div key={`${item.step}-${idx}`} className="flex gap-3">
              <div className="flex w-5 flex-col items-center">
                <div
                  className={[
                    "flex h-5 w-5 items-center justify-center rounded-full border text-[11px] leading-none",
                    done
                      ? "border-foreground text-foreground"
                      : "border-border text-transparent",
                  ].join(" ")}
                >
                  {done ? "✓" : ""}
                </div>

                {!last ? (
                  <div className="my-1 w-px flex-1 bg-border/70 min-h-6" />
                ) : null}
              </div>

              <div className="pb-4">
                <div
                  className={[
                    "text-sm leading-6",
                    done
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background"
                  ].join(" ")}
                >
                  {item.step}
                </div>

                {item.definition_of_done?.trim() ? (
                  <div className="text-xs text-muted-foreground">
                    {item.definition_of_done}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}