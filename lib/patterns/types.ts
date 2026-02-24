export type Pillar = "career" | "personal" | "internal";
export type GoalStatus = "active" | "completed" | "archived";
export type AlignmentLabel = "yes" | "partial" | "no" | string;

export type PillarStats = {
  goalsTotal: number;
  goalsClosed: number; // completed+archived

  avgAlignment: number | null; // 0..1
  avgCheckIns: number | null;
  avgDurationWeeks: number | null;

  dipsCount: number; // alignment == "no"
  dipsRate: number | null; // dips / checkins

  shortGoalCount: number; // closed goals that ended quickly
  shortGoalRate: number | null; // short / closed
};

export type BehaviorPatternsV1 = {
  version: "patterns.v1";
  generatedAt: string; // ISO

  totals: {
    goalsTotal: number;
    goalsClosed: number;
    checkInsTotal: number;

    adjustmentsTotal: number;
    goalAdjustmentsTotal: number;
    identityAdjustmentsTotal: number;
  };

  alignmentTrend: "stable" | "improving" | "declining" | "unknown";

  shortGoalRate: number | null; // closed goals only

  adjustmentFrequency: {
    perClosedGoal: number | null; // adjustments / closed goals
    last30Days: number; // count in last 30 days
  };

  pillarStats: Record<Pillar, PillarStats>;

  pillarImbalance: {
    score: number | null; // (max avgAlignment - min avgAlignment)
    mostActivePillar: Pillar | null; // most closed goals
    leastActivePillar: Pillar | null; // least closed goals
  };

  notes: string[]; // internal hints for future AI summary
};