import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabase/server";

function safeTrim(v: unknown) {
  return String(v ?? "").trim();
}

function buildPrompt(input: {
  title: string;
  milestone: string | null;
  pillar: string;
  createdAt: string;
  completedAt: string;
  reflections: Array<{
    week: string;
    alignment: string;
    action: string;
    harder: string;
    next: string;
  }>;
}) {
  const history =
    input.reflections.length === 0
      ? "No check-ins recorded."
      : input.reflections
          .map(
            (r) =>
              `- ${r.week} | alignment: ${r.alignment} | action: ${r.action} | harder/easier: ${r.harder} | next: ${r.next}`
          )
          .join("\n");

  return `
You are writing inside a calm goal journal app called "Growth".

Write like a clear, trustworthy person.
No therapy tone. No diagnosing. No complicated words. No hype.
Short sentences. Concrete observations.

Goal:
- Pillar: ${input.pillar}
- Title: ${input.title}
- Milestone: ${input.milestone ?? "N/A"}
- Duration: ${input.createdAt} → ${input.completedAt}

Weekly history (oldest to newest):
${history}

Write a "Completion Reflection" with exactly these sections:

What actually happened:
(2–3 short sentences.)

What this shows about me:
(2 short sentences. Focus on behavior patterns, not personality labels.)

What helped the most:
(1 short sentence.)

What got in the way:
(1 short sentence.)

A natural next direction:
(1 short sentence. Offer a direction, not a command.)

Optional: If the user has no reflections, be honest and keep it short.
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

    const body = await req.json().catch(() => null);
    const goalId = safeTrim(body?.goal_id);

    if (!goalId) {
      return NextResponse.json({ error: "goal_id required" }, { status: 400 });
    }

    const { data: goal } = await supabase
      .from("goals")
      .select("id, user_id, pillar, title, milestone, status, created_at, updated_at")
      .eq("id", goalId)
      .single();

    if (!goal || goal.user_id !== user.id) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    if (goal.status !== "completed") {
      return NextResponse.json(
        { error: "Completion reflection is only for completed goals." },
        { status: 400 }
      );
    }

    const { data: reflections } = await supabase
      .from("reflections")
      .select("week_start_date, alignment, action_taken, easier_harder, next_step")
      .eq("user_id", user.id)
      .eq("goal_id", goalId)
      .order("week_start_date", { ascending: true })
      .limit(30);

    const prompt = buildPrompt({
      pillar: String(goal.pillar),
      title: String(goal.title ?? "Untitled goal"),
      milestone: goal.milestone ?? null,
      createdAt: String(goal.created_at).slice(0, 10),
      completedAt: String(goal.updated_at).slice(0, 10),
      reflections:
        (reflections ?? []).map((r) => ({
          week: String(r.week_start_date),
          alignment: String(r.alignment),
          action: String(r.action_taken),
          harder: String(r.easier_harder),
          next: String(r.next_step),
        })) ?? [],
    });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

    const response = await client.responses.create({
      model,
      input: prompt,
      temperature: 0.5,
      max_output_tokens: 320,
    });

    const text = safeTrim(response.output_text);

    return NextResponse.json({ content: text });
  } catch (err) {
    console.error("[COMPLETION_SUMMARY_AI_FAIL]", err);
    return NextResponse.json({ content: "" }, { status: 200 });
  }
}