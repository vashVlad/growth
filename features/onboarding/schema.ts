export type Pillar = "career" | "personal" | "internal";

export type PillarGoalInput = {
  title: string;
  milestone: string;
  nextAction: string;
};

export type OnboardingState = {
  identityStatement: string;
  identityBehaviors: string;
  goals: Record<Pillar, PillarGoalInput>;
};

export const LIMITS = {
  identityStatement: 120,
  identityBehaviors: 200,
  goalTitle: 80,
  milestone: 120,
  nextAction: 120,
};

export const t = (v: string) => (v ?? "").trim();

export function validateIdentity(s: OnboardingState): string | null {
  const a = t(s.identityStatement);
  const b = t(s.identityBehaviors);
  if (!a) return "Identity statement is required.";
  if (!b) return "Identity behaviors are required.";
  if (a.length > LIMITS.identityStatement) return "Identity statement is too long.";
  if (b.length > LIMITS.identityBehaviors) return "Identity behaviors are too long.";
  return null;
}

export function validatePillar(s: OnboardingState, p: Pillar): string | null {
  const g = s.goals[p];
  const title = t(g.title);
  const milestone = t(g.milestone);
  const nextAction = t(g.nextAction);

  if (!title) return "Goal title is required.";
  if (!milestone) return "Milestone is required.";
  if (!nextAction) return "Next action is required.";

  if (title.length > LIMITS.goalTitle) return "Goal title is too long.";
  if (milestone.length > LIMITS.milestone) return "Milestone is too long.";
  if (nextAction.length > LIMITS.nextAction) return "Next action is too long.";

  return null;
}

export function validateAll(s: OnboardingState): string | null {
  const e1 = validateIdentity(s);
  if (e1) return e1;

  const pillars: Pillar[] = ["career", "personal", "internal"];
  for (const p of pillars) {
    const ep = validatePillar(s, p);
    if (ep) return `${p.toUpperCase()}: ${ep}`;
  }
  return null;
}
