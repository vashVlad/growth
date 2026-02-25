import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabase/server";

type ReqBody = {
  goal_id: string;
  week_start_date: string; // YYYY-MM-DD
};

function safeTrim(s: unknown) {
  return String(s ?? "").trim();
}

function buildPrompt(input: {
  goalTitle: string;
  milestone: string | null;
  lastSteps: Array<{ week: string; alignment: string; next_step: string }>;
}) {
  const history =
    input.lastSteps.length === 0
      ? "N/A"
      : input.lastSteps
          .map((r) => `- ${r.week} | alignment: ${r.alignment} | next: ${r.next_step}`)
          .join("\n");

  return `
You are the weekly planner inside Growth.

Task: Write ONE next-step sentence for the coming week.
This is a real weekly commitment — not a tiny task.

RULES:
- Output exactly ONE sentence.
- No commands ("must", "should", "try to").
- Calm and practical tone.
- Make it concrete and measurable by including:
  (a) a timebox OR frequency,
  (b) a clear deliverable,
  (c) a simple constraint that reduces friction (when/how).

If recent alignment was "no" or "partial", reduce scope slightly — but keep it meaningful.

GOAL:
- Title: ${input.goalTitle}
- Milestone: ${input.milestone ?? "N/A"}

Recent history (most recent first):
${history}

Write the one-sentence weekly plan now.
`.trim();
}

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as ReqBody | null;
    const goal_id = safeTrim(body?.goal_id);
    const week_start_date = safeTrim(body?.week_start_date);

    if (!goal_id || !week_start_date) {
      return NextResponse.json(
        { error: "goal_id and week_start_date are required" },
        { status: 400 }
      );
    }

    // Fetch goal context (ownership check via RLS + explicit)
    const { data: goal, error: goalErr } = await supabase
      .from("goals")
      .select("id, user_id, title, milestone")
      .eq("id", goal_id)
      .single();

    if (goalErr || !goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    if (goal.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch recent reflections for this goal (last 5)
    const { data: recent } = await supabase
      .from("reflections")
      .select("week_start_date, alignment, next_step")
      .eq("user_id", user.id)
      .eq("goal_id", goal_id)
      .order("week_start_date", { ascending: false })
      .limit(5);

    const lastSteps =
      (recent ?? []).map((r) => ({
        week: String(r.week_start_date),
        alignment: String(r.alignment),
        next_step: String(r.next_step ?? ""),
      })) ?? [];

    const prompt = buildPrompt({
      goalTitle: goal.title ?? "Untitled goal",
      milestone: goal.milestone ?? null,
      lastSteps,
    });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

    const llm = await client.responses.create({
      model,
      input: prompt,
      temperature: 0.4,
      max_output_tokens: 80,
    });

    const suggestion = safeTrim(llm.output_text);

    if (!suggestion) {
      return NextResponse.json({ suggestion: "" }, { status: 200 });
    }

    // Optional: enforce one sentence-ish
    const oneLine = suggestion.replace(/\s+/g, " ").trim();

    const hasNumber = /\b\d+\b/.test(oneLine); // 2, 3, 45, etc.
    const hasTimeWord = /\b(min|minute|hour|hr|times|sessions|days|week)\b/i.test(oneLine);

const finalSuggestion =
  hasNumber || hasTimeWord ? oneLine : `${oneLine} (3 sessions this week).`;  

    return NextResponse.json({ suggestion: finalSuggestion, cached: false }, { status: 200 });
  } catch (err) {
    console.error("[NEXT_STEP_AI_FAIL]", err);
    return NextResponse.json({ suggestion: "" }, { status: 200 });
  }
}
