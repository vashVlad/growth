// lib/ai/lifeArchitectureSummary.server.ts
import OpenAI from "openai";
import { getUserPatterns } from "@/lib/patterns/getUserPatterns.server";
import { supabaseServer } from "@/lib/supabase/server";

type ReflectionRow = {
  goal_id: string;
  week_start_date: string;
  alignment: string;
  action_taken: string;
  easier_harder: string;
  next_step: string;
};

function clampText(s: string, max = 700): string {
  const t = (s ?? "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trim() + "…";
}

function buildReflectionsTexture(reflections: ReflectionRow[]): string {
  if (!reflections.length) return "No recent reflection entries available.";
  return reflections
    .map((r) => {
      const a = clampText(r.action_taken, 160);
      const eh = clampText(r.easier_harder, 140);
      const ns = clampText(r.next_step, 140);
      const al = clampText(r.alignment, 80);
      return `- Week ${r.week_start_date}: alignment="${al}", action="${a}", easier/harder="${eh}", next="${ns}"`;
    })
    .join("\n");
}

function buildSystemPrompt(): string {
  return [
    "You are the calm reflection voice of Growth, a structured self-development app.",
    "Write like a thoughtful mentor: human, calm, clear. No hype. No shame. No clinical tone.",
    "Do NOT show raw metrics, numbers, or percentages. Translate signals into plain language.",
    "No lists of stats. No dashboards. No gamification. No scores.",
    "Prefer short sentences. Avoid long multi-clause lines.",
    "Length: 140–185 words. Aim for 2 short paragraphs max.",
    "If data is thin (alignmentTrend is unknown OR checkInsTotal < 6), gently say:",
    `"Not enough weeks of data yet to see a strong trend — keep going."`,
    "Only mention 'getting in the way' if evidence exists (dips exist, declining trend, or consistent friction in reflections).",
    "End with ONE gentle next direction (only one suggestion).",
  ].join("\n");
}

function buildUserPrompt(input: {
  patternsJson: unknown;
  reflectionsTexture: string;
}): string {
  return [
    "Create a Life Architecture Summary for the user based on:",
    "",
    "STRUCTURED PATTERNS (primary input):",
    JSON.stringify(input.patternsJson, null, 2),
    "",
    "RECENT REFLECTIONS (optional texture, last ~10):",
    input.reflectionsTexture,
    "",
    "Include these ideas (in plain language):",
    "- What your recent pattern suggests",
    "- What may be helping",
    "- What may be getting in the way (only if evidence exists)",
    "- A gentle next direction (one suggestion max)",
    "",
    "Translate these signals (no raw metrics):",
    "- pillar activity balance (most active vs least active)",
    "- alignment trend (or not enough data yet)",
    "- short goals signal as 'some chapters closing quickly' (no judgement)",
    "- adjustment frequency (mention lightly, optionally separating goal vs identity)",
    "- dips rate if any (what it suggests, gently)",
  ].join("\n");
}

function capToWordsClean(text: string, maxWords = 185): string {
  const t = (text ?? "").trim();
  if (!t) return t;

  const words = t.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return t;

  // Split into sentences (simple + reliable enough for this use)
  const sentences =
    t.match(/[^.!?]+[.!?]+(\s+|$)/g)?.map((s) => s.trim()).filter(Boolean) ?? [t];

  let out: string[] = [];
  let count = 0;

  for (const s of sentences) {
    const w = s.split(/\s+/).filter(Boolean).length;
    if (count + w > maxWords) break;
    out.push(s);
    count += w;
  }

  // Fallback if sentence splitting fails / first sentence too long
  if (out.length === 0) {
    return words.slice(0, maxWords).join(" ").trim() + "…";
  }

  return out.join(" ").trim();
}

export async function generateLifeArchitectureSummary(userId: string): Promise<string> {
  const patterns = await getUserPatterns(); // relies on server auth context in your existing implementation

  // Optional texture: last 10 reflections across all goals for this user, deterministic by week_start_date desc
  const supabase = await supabaseServer();

  // NOTE:
  // This join assumes reflections.goal_id -> goals.id and the relationship is named "goals".
  // If your relationship name differs, adjust `goals!inner(...)` accordingly.
  const { data: reflectionsData } = await supabase
    .from("reflections")
    .select(
      `
      goal_id,
      week_start_date,
      alignment,
      action_taken,
      easier_harder,
      next_step,
      goals!inner(user_id)
    `
    )
    .eq("goals.user_id", userId)
    .order("week_start_date", { ascending: false })
    .limit(10);

  const reflections: ReflectionRow[] = Array.isArray(reflectionsData)
    ? reflectionsData.map((r: any) => ({
        goal_id: String(r.goal_id ?? ""),
        week_start_date: String(r.week_start_date ?? ""),
        alignment: String(r.alignment ?? ""),
        action_taken: String(r.action_taken ?? ""),
        easier_harder: String(r.easier_harder ?? ""),
        next_step: String(r.next_step ?? ""),
      }))
    : [];

  const reflectionsTexture = buildReflectionsTexture(reflections);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Fail gracefully (still deterministic and calm)
    return "Insight is temporarily unavailable right now. Please try again in a bit.";
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const system = buildSystemPrompt();
  const user = buildUserPrompt({ patternsJson: patterns, reflectionsTexture });

  const resp = await openai.chat.completions.create({
    model,
    temperature: 0.35, // calm + consistent
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  let content = resp.choices?.[0]?.message?.content?.trim() ?? ""; 
  if (!content) return "Not enough weeks of data yet to see a strong trend — keep going.";

  // Hard cap safety (keep UI calm)
  const words = content.split(/\s+/).filter(Boolean);
  if (words.length > 240) return words.slice(0, 220).join(" ").trim() + "…";

  content = capToWordsClean(content, 185);

  return content;
}