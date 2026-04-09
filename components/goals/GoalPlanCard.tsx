import { ExecutionSteps } from "@/components/goals/ExecutionSteps";

type PlanJson = {
  execution_steps?: {
    step: string;
    definition_of_done?: string;
    completed?: boolean;
  }[];
  milestones?: {
    id: string;
    title: string;
    success_metric: string;
    due_week: number;
  }[];
  weekly_plan?: {
    week: number;
    focus: string;
    tasks: {
      task: string;
      estimate_hours: number;
      definition_of_done: string;
    }[];
    target_hours: number;
  }[];
  risks?: {
    risk: string;
    mitigation: string;
  }[];
  success_criteria?: string[];
};

function CardShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/40 bg-background/60 p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground/80">
        {title}
      </div>
      <div className="mt-4 max-w-[560px]">{children}</div>
    </section>
  );
}

function formatStamp(iso: string | null | undefined) {
  if (!iso) return "";
  return String(iso).slice(0, 16).replace("T", " ");
}

export function GoalPlanCard({
  plan,
  version,
  savedAt,
}: {
  plan: PlanJson;
  version: number;
  savedAt?: string | null;
}) {
  return (
    <div className="space-y-8">
      {plan.execution_steps?.length ? (
        <ExecutionSteps steps={plan.execution_steps} />
      ) : null}

      {plan.milestones?.length ? (
        <CardShell title="Milestones">
          <div className="space-y-3">
            {plan.milestones.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-border/30 bg-background/30 p-4"
              >
                <div className="text-sm font-medium text-foreground">
                  {m.title}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Week {m.due_week} · {m.success_metric}
                </div>
              </div>
            ))}
          </div>
        </CardShell>
      ) : null}

      {plan.weekly_plan?.length ? (
        <CardShell title="Weekly Plan">
          <div className="space-y-3">
            {plan.weekly_plan.map((week) => (
              <div
                key={week.week}
                className="rounded-xl border border-border/30 bg-background/30 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-foreground">
                    Week {week.week}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {week.target_hours} hrs
                  </div>
                </div>

                <div className="mt-1 text-sm text-muted-foreground">
                  Focus: {week.focus}
                </div>

                <div className="mt-3 space-y-2">
                  {week.tasks.map((task, idx) => (
                    <div key={`${week.week}-${idx}`} className="text-sm">
                      <div className="text-foreground/90">
                        • {task.task} ({task.estimate_hours}h)
                      </div>
                      <div className="text-xs text-muted-foreground pl-4">
                        {task.definition_of_done}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardShell>
      ) : null}

      {plan.risks?.length ? (
        <CardShell title="Risks">
          <div className="space-y-3">
            {plan.risks.map((r, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border/30 bg-background/30 p-5"
              >
                <div className="text-sm font-medium text-foreground">
                  {r.risk}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {r.mitigation}
                </div>
              </div>
            ))}
          </div>
        </CardShell>
      ) : null}

      {plan.success_criteria?.length ? (
        <CardShell title="Success Criteria">
          <div className="space-y-2">
            {plan.success_criteria.map((item, idx) => (
              <div key={idx} className="text-sm text-foreground/90">
                • {item}
              </div>
            ))}
          </div>
        </CardShell>
      ) : null}

      <section className="rounded-2xl border border-border/40 bg-background/40 px-5 py-4 text-xs text-muted-foreground">
        Saved · v{version}
        {savedAt ? ` · ${formatStamp(savedAt)}` : ""}
      </section>
    </div>
  );
}