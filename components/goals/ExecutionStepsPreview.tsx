type Props = {
  steps: string[] | null;
};

export function ExecutionStepsPreview({ steps }: Props) {
  if (!Array.isArray(steps) || steps.length === 0) return null;

  const visibleSteps = steps.slice(0, 3);

  return (
    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
      <div className="text-xs uppercase tracking-wide text-muted-foreground/70">
        Execution
      </div>

      {visibleSteps.map((step, index) => {
        const isCompleted = index < 1;
        const isCurrent = index === 1;

        let marker = "○";
        if (isCompleted) marker = "✓";
        else if (isCurrent) marker = "●";

        return (
          <div key={index} className="flex gap-2">
            <span>{marker}</span>
            <span>{step}</span>
          </div>
        );
      })}
    </div>
  );
}