import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AlignmentLabel,
  BehaviorPatternsV1,
  Pillar,
  GoalStatus,
  PillarStats,
} from "./types";

type DbGoal = {
  id: string;
  pillar: Pillar;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
};

type DbReflection = {
  id: string;
  goal_id: string;
  week_start_date: string; // YYYY-MM-DD
  alignment: AlignmentLabel;
  created_at: string;
  updated_at: string | null;
};

type DbAdjustment = {
  entity_type: "profile" | "goal" | string;
  entity_id: string;
  created_at: string;
};

const PILLARS: Pillar[] = ["career", "personal", "internal"];

function toMs(dateLike: string | null | undefined): number | null {
  if (!dateLike) return null;
  const ms = new Date(dateLike).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function toMsFromYYYYMMDD(s: string | null | undefined): number | null {
  const v = String(s ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const ms = Date.parse(v + "T00:00:00.000Z");
  return Number.isFinite(ms) ? ms : null;
}

function weeksBetween(aYYYYMMDD: string | null | undefined, bYYYYMMDD: string | null | undefined): number | null {
  const a = toMsFromYYYYMMDD(aYYYYMMDD);
  const b = toMsFromYYYYMMDD(bYYYYMMDD);
  if (a == null || b == null) return null;
  const diff = Math.abs(b - a);
  const weeks = diff / (7 * 24 * 60 * 60 * 1000);
  return Math.max(0, Math.round(weeks));
}

function alignmentScore(label: AlignmentLabel): number | null {
  const v = String(label ?? "").trim().toLowerCase();
  if (!v) return null;
  if (v === "yes") return 1;
  if (v === "partial") return 0.5;
  if (v === "no") return 0;
  return null; // ignore unknown values (keeps deterministic)
}

function isDip(label: AlignmentLabel): boolean {
  return String(label ?? "").trim().toLowerCase() === "no";
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function safeRate(n: number, d: number): number | null {
  if (!Number.isFinite(n) || !Number.isFinite(d) || d <= 0) return null;
  return n / d;
}

function trendFromSeries(series: number[]): "stable" | "improving" | "declining" | "unknown" {
  // Compare recent 4 vs previous 4
  if (series.length < 6) return "unknown";
  const recent = series.slice(-4);
  const prev = series.slice(Math.max(0, series.length - 8), series.length - 4);
  const a = avg(prev);
  const b = avg(recent);
  if (a == null || b == null) return "unknown";

  const delta = b - a;
  if (Math.abs(delta) < 0.08) return "stable";
  return delta > 0 ? "improving" : "declining";
}

function initPillarStats(): PillarStats {
  return {
    goalsTotal: 0,
    goalsClosed: 0,
    avgAlignment: null,
    avgCheckIns: null,
    avgDurationWeeks: null,
    dipsCount: 0,
    dipsRate: null,
    shortGoalCount: 0,
    shortGoalRate: null,
  };
}

export async function analyzeUserPatterns(
  supabase: SupabaseClient,
  userId: string
): Promise<BehaviorPatternsV1> {
  // ---- Load goals ----
  const { data: goals, error: goalsErr } = await supabase
    .from("goals")
    .select("id, pillar, status, created_at, updated_at")
    .eq("user_id", userId);

  if (goalsErr) {
    return {
      version: "patterns.v1",
      generatedAt: new Date().toISOString(),
      totals: {
        goalsTotal: 0,
        goalsClosed: 0,
        checkInsTotal: 0,
        adjustmentsTotal: 0,
        goalAdjustmentsTotal: 0,
        identityAdjustmentsTotal: 0,
      },
      alignmentTrend: "unknown",
      shortGoalRate: null,
      adjustmentFrequency: { perClosedGoal: null, last30Days: 0 },
      pillarStats: {
        career: initPillarStats(),
        personal: initPillarStats(),
        internal: initPillarStats(),
      },
      pillarImbalance: { score: null, mostActivePillar: null, leastActivePillar: null },
      notes: ["Could not load goals (DB error)."],
    };
  }

  const goalRows = (goals ?? []) as DbGoal[];
  const goalIds = goalRows.map((g) => g.id);

  const closedGoalIds = new Set(
    goalRows
      .filter((g) => g.status === "completed" || g.status === "archived")
      .map((g) => g.id)
  );

  // ---- Load reflections ----
  let reflections: DbReflection[] = [];
  if (goalIds.length > 0) {
    const { data: refs, error: refErr } = await supabase
      .from("reflections")
      .select("id, goal_id, week_start_date, alignment, created_at, updated_at")
      .eq("user_id", userId)
      .in("goal_id", goalIds)
      .order("week_start_date", { ascending: true });

    if (!refErr) reflections = (refs ?? []) as DbReflection[];
  }

  // ---- Load adjustments (matches your schema) ----
  const { data: adjustmentsData } = await supabase
    .from("adjustments")
    .select("entity_type, entity_id, created_at")
    .eq("user_id", userId);

  const adjustments = (adjustmentsData ?? []) as DbAdjustment[];
  const goalAdjustments = adjustments.filter((a) => a.entity_type === "goal");
  const identityAdjustments = adjustments.filter((a) => a.entity_type === "profile");

  // ---- Aggregate ----
  const pillarStats: Record<Pillar, PillarStats> = {
    career: initPillarStats(),
    personal: initPillarStats(),
    internal: initPillarStats(),
  };

  // Reflections by goal
  const byGoal = new Map<string, DbReflection[]>();
  for (const r of reflections) {
    const arr = byGoal.get(r.goal_id) ?? [];
    arr.push(r);
    byGoal.set(r.goal_id, arr);
  }

  // Global alignment series
  const alignmentSeries: number[] = [];
  for (const r of reflections) {
    const s = alignmentScore(r.alignment);
    if (s != null) alignmentSeries.push(s);
  }

  // Goal counts
  for (const g of goalRows) {
    pillarStats[g.pillar].goalsTotal += 1;
    if (g.status === "completed" || g.status === "archived") {
      pillarStats[g.pillar].goalsClosed += 1;
    }
  }

  const pillarAlignments: Record<Pillar, number[]> = { career: [], personal: [], internal: [] };
  const pillarCheckins: Record<Pillar, number[]> = { career: [], personal: [], internal: [] };
  const pillarCheckInsTotal: Record<Pillar, number> = { career: 0, personal: 0, internal: 0 };
  const pillarDurWeeks: Record<Pillar, number[]> = { career: [], personal: [], internal: [] };

  let totalCheckIns = 0;
  let closedGoals = 0;
  let shortClosedGoals = 0;

  for (const g of goalRows) {
    const list = byGoal.get(g.id) ?? [];
    totalCheckIns += list.length;
    pillarCheckInsTotal[g.pillar] += list.length;

    // dips
    const dips = list.filter((r) => isDip(r.alignment)).length;
    pillarStats[g.pillar].dipsCount += dips;

    // avg alignment for this goal
    const scores: number[] = [];
    for (const r of list) {
      const s = alignmentScore(r.alignment);
      if (s != null) scores.push(s);
    }
    const goalAvgAlignment = avg(scores);

    // duration weeks for this goal (based on week_start_date)
    const firstWeek = list[0]?.week_start_date ?? null;
    const lastWeek = list[list.length - 1]?.week_start_date ?? null;
    const durWeeks = firstWeek && lastWeek ? weeksBetween(firstWeek, lastWeek) : null;

    const isClosed = g.status === "completed" || g.status === "archived";
    if (isClosed) {
      closedGoals += 1;

      // short goal heuristic: <=2 check-ins OR <=2 weeks span
      const short =
        (list.length > 0 && list.length <= 2) ||
        (durWeeks != null && durWeeks <= 2);

      if (short) {
        shortClosedGoals += 1;
        pillarStats[g.pillar].shortGoalCount += 1;
      }
    }

    // rollups
    if (goalAvgAlignment != null) pillarAlignments[g.pillar].push(goalAvgAlignment);
    if (list.length > 0) pillarCheckins[g.pillar].push(list.length);
    if (durWeeks != null) pillarDurWeeks[g.pillar].push(durWeeks);
  }

  // finalize pillar stats
  for (const p of PILLARS) {
    const ps = pillarStats[p];

    ps.avgAlignment = avg(pillarAlignments[p]);
    ps.avgCheckIns = avg(pillarCheckins[p]);
    ps.avgDurationWeeks = avg(pillarDurWeeks[p]);

    const checkinsTotalInPillar = pillarCheckins[p].reduce((x, y) => x + y, 0);
    ps.dipsRate = safeRate(ps.dipsCount, checkinsTotalInPillar);

    ps.shortGoalRate = safeRate(ps.shortGoalCount, ps.goalsClosed);
  }

  // imbalance: alignment spread across pillars
  const alignVals = PILLARS.map((p) => pillarStats[p].avgAlignment).filter((v): v is number => v != null);
  const imbalanceScore = alignVals.length >= 2 ? Math.max(...alignVals) - Math.min(...alignVals) : null;

  // most/least active pillars by total check-ins (better signal than closed goals)
    const activity = PILLARS.map((p) => ({
    pillar: p,
    checkIns: pillarCheckInsTotal[p],
    })).sort((a, b) => b.checkIns - a.checkIns);

    const totalAcrossPillars = PILLARS.reduce((sum, p) => sum + pillarCheckInsTotal[p], 0);

    const mostActivePillar = totalAcrossPillars > 0 ? activity[0].pillar : null;
    const leastActivePillar = totalAcrossPillars > 0 ? activity[activity.length - 1].pillar : null;

  // adjustment frequency (last 30 days)
  const nowMs = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const adjustmentsLast30 = adjustments.filter((a) => {
    const ms = toMs(a.created_at);
    return ms != null && nowMs - ms <= thirtyDaysMs;
  }).length;

  const perClosedGoal = safeRate(adjustments.length, closedGoals);

  const alignmentTrend = trendFromSeries(alignmentSeries);

  // notes (internal only)
  const notes: string[] = [];
  if (closedGoals > 0 && safeRate(shortClosedGoals, closedGoals) != null && (shortClosedGoals / closedGoals) >= 0.5) {
    notes.push("Many chapters are closing quickly (short-goal rate is high).");
  }
  if (imbalanceScore != null && imbalanceScore >= 0.35) {
    notes.push("Alignment varies noticeably across pillars (possible pillar imbalance).");
  }
  if (goalAdjustments.length >= 6) {
    notes.push("Frequent goal adjustments observed (may indicate shifting scope).");
  }
  if (identityAdjustments.length >= 3) {
    notes.push("Multiple identity adjustments observed (identity is evolving).");
  }

  return {
    version: "patterns.v1",
    generatedAt: new Date().toISOString(),
    totals: {
      goalsTotal: goalRows.length,
      goalsClosed: closedGoals,
      checkInsTotal: totalCheckIns,
      adjustmentsTotal: adjustments.length,
      goalAdjustmentsTotal: goalAdjustments.length,
      identityAdjustmentsTotal: identityAdjustments.length,
    },
    alignmentTrend,
    shortGoalRate: safeRate(shortClosedGoals, closedGoals),
    adjustmentFrequency: {
      perClosedGoal,
      last30Days: adjustmentsLast30,
    },
    pillarStats,
    pillarImbalance: {
      score: imbalanceScore,
      mostActivePillar,
      leastActivePillar,
    },
    notes,
  };
}