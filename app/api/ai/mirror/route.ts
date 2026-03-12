// app/api/ai/mirror/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabase/server";

type MirrorRequest = {
  reflection_id: string;
};

function buildMirrorPrompt(input: {
  goalTitle: string;
  pillar: string;
  identityStatement: string | null;
  patternSnapshot: string;
  executionStep: string;
  reflection: {
    action_taken: string;
    easier_harder: string;
    alignment: "yes" | "partial" | "no";
    next_step: string;
  };
}) {

  const { goalTitle, pillar, identityStatement, patternSnapshot, reflection } =
    input;

  return `
You are "Guidance": a calm and thoughtful mentor inside Growth.

Purpose: help the user move forward next week with clarity.
Not a summary. Not a report. Not motivation. Not therapy.

OUTPUT RULES (strict):
- 3–5 sentences total.
- Calm, steady, human.
- No commands ("you must", "you should", "try to").
- Do not restate the reflection word-for-word.
- If referencing history, do so briefly and naturally (max one short phrase).

STRUCTURE:
1) A grounded observation about what truly mattered this week (1 sentence).
2) A quiet insight about what this suggests (1–2 sentences).
3) End with either:
   - one thoughtful question OR
   - one gentle guiding principle (max 1 sentence).

CONTEXT:
- Pillar: ${pillar}
- Goal: ${goalTitle}
- Identity: ${identityStatement ?? "N/A"}

Recent alignment snapshot (optional, brief): ${patternSnapshot}

Current execution step: ${input.executionStep}

This week:
- Action taken: ${reflection.action_taken}
- Easier/harder: ${reflection.easier_harder}
- Alignment: ${reflection.alignment}
- Draft next step: ${reflection.next_step}

Write the Guidance now.
`.trim();
}

/** --- Stabilization helpers (Step 6 hardening) --- */
function splitSentences(text: string) {
  // simple + reliable enough for short outputs
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function countSentences(text: string) {
  return splitSentences(text).length;
}

function countQuestions(text: string) {
  return (text.match(/\?/g) ?? []).length;
}

function violatesTone(text: string) {
  const lower = text.toLowerCase();
  return (
    /\byou must\b/.test(lower) ||
    /\byou should\b/.test(lower) ||
    /\bdo this now\b/.test(lower) ||
    /\btry to\b/.test(lower)
  );
}

function guidanceOutputOk(text: string) {
  const sentences = countSentences(text);
  const questions = countQuestions(text);
  return (
    text.trim().length > 0 &&
    sentences >= 3 &&
    sentences <= 5 &&
    questions <= 1 &&
    !violatesTone(text)
  );
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

    const body = (await req.json()) as MirrorRequest;
    const reflectionId = body?.reflection_id;

    if (!reflectionId) {
      return NextResponse.json(
        { error: "reflection_id is required" },
        { status: 400 }
      );
    }

    // 1) Fetch reflection (RLS + double-check)
    const { data: reflection, error: reflErr } = await supabase
      .from("reflections")
      .select(
        "id, user_id, goal_id, week_start_date, action_taken, easier_harder, alignment, next_step"
      )
      .eq("id", reflectionId)
      .single();

    if (reflErr || !reflection) {
      return NextResponse.json(
        { error: "Reflection not found" },
        { status: 404 }
      );
    }

    if (reflection.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Stabilization A: Reflection completeness guard
    const required = [
      reflection.action_taken,
      reflection.easier_harder,
      reflection.alignment,
      reflection.next_step,
    ];
    if (!reflection.action_taken || !reflection.easier_harder || !reflection.alignment) {
      return Response.json(
        { error: "Reflection is incomplete" },
        { status: 400 }
      );
    }

    // 2) Return cached note if it exists
    const { data: existingNote } = await supabase
      .from("ai_notes")
      .select("content")
      .eq("user_id", user.id)
      .eq("reflection_id", reflection.id)
      .maybeSingle();

    if (existingNote?.content?.trim()) {
      return NextResponse.json({ content: existingNote.content, cached: true });
    }

    // 3) Goal context (title + pillar)
    const { data: goal, error: goalErr } = await supabase
      .from("goals")
      .select("title, pillar")
      .eq("id", reflection.goal_id)
      .single();

    if (goalErr || !goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // 4) Identity statement (profile table keyed by user_id)
    const { data: profile } = await supabase
      .from("profile")
      .select("identity_statement")
      .eq("user_id", user.id)
      .maybeSingle();

    const identityStatement = profile?.identity_statement ?? null;

    // 5b) Current execution step (plan context)

    const { data: plan } = await supabase
      .from("goal_plans")
      .select("plan_json")
      .eq("goal_id", reflection.goal_id)
      .eq("user_id", user.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

      let currentExecutionStep = "N/A";

      if (plan?.plan_json?.execution_steps) {
        const step = plan.plan_json.execution_steps.find((s: any) => !s.completed);
        if (step?.step) currentExecutionStep = step.step;
      }

    const { data: recent } = await supabase
      .from("reflections")
      .select("week_start_date, alignment")
      .eq("user_id", user.id)
      .eq("goal_id", reflection.goal_id)
      .order("week_start_date", { ascending: false })
      .limit(5);  

    const patternSnapshot =
      !recent || recent.length === 0
        ? "N/A"
        : recent
            .map((r) => `- ${r.week_start_date}: ${r.alignment}`)
            .join("\n");

    const prompt = buildMirrorPrompt({
      goalTitle: goal.title ?? "Untitled goal",
      pillar: goal.pillar ?? "Growth",
      identityStatement,
      patternSnapshot,
      reflection: {
        action_taken: reflection.action_taken,
        easier_harder: reflection.easier_harder,
        alignment: reflection.alignment,
        next_step: reflection.next_step,
      },
      executionStep: currentExecutionStep,
    });

    // 6) Call LLM (server-side only)
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

    // ✅ Step 8: basic logging for failed AI calls (no user-facing feature)
    let llm;
    try {
      llm = await client.responses.create({
        model,
        input: prompt,
        temperature: 0.4,
        max_output_tokens: 180,
      });
    } catch (e: any) {
      const msg = typeof e?.message === "string" ? e.message : "Unknown AI error";

      console.error("[AI_FAIL] mirror", {
        user_id: user.id,
        reflection_id: reflectionId,
        model,
        message: msg,
      });

      // Optional DB log (only if table exists; ignore failures)
      try {
        await supabase.from("ai_failures").insert({
          user_id: user.id,
          route: "/api/ai/mirror",
          error: msg.slice(0, 500),
        });
      } catch {}

      return NextResponse.json(
        { error: "Mirror is unavailable right now. Please try again in a moment." },
        { status: 502 }
      );
    }

    let content = (llm.output_text ?? "").trim();

    // ✅ Stabilization B: Enforce output constraints (retry once)
    if (!content || !guidanceOutputOk(content)) {
      const retry = await client.responses.create({
        model,
        input: `${prompt}
          STRICT FIX:
          Rewrite to 3–5 sentences total, max 1 question, no commands. Avoid "must/should/try to". Not a summary.`,
        temperature: 0.2,
        max_output_tokens: 180,
      });

      content = (retry.output_text ?? "").trim();
    }

    if (!content || !guidanceOutputOk(content)) {
      content =
        "Something in this week’s effort mattered. Notice what supported your action and what resisted it. Growth often hides in small adjustments. What would it look like to repeat the helpful part once more next week?";
    }

    // ✅ Stabilization C: race guard (check again before saving)
    const { data: existingNote2 } = await supabase
      .from("ai_notes")
      .select("content")
      .eq("user_id", user.id)
      .eq("reflection_id", reflection.id)
      .maybeSingle();

    if (existingNote2?.content?.trim()) {
      return NextResponse.json({ content: existingNote2.content, cached: true });
    }

    // 7) Save to ai_notes (1 per reflection per user)
    const { error: noteErr } = await supabase.from("ai_notes").upsert(
      {
        user_id: user.id,
        reflection_id: reflection.id,
        content,
      },
      { onConflict: "user_id,reflection_id" }
    );

    if (noteErr) {
      return NextResponse.json(
        { error: "Failed to save ai note" },
        { status: 500 }
      );
    }

    return NextResponse.json({ content, cached: false });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "Unknown server error";
    console.error("Mirror route error:", msg);
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}
