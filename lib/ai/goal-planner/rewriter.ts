import OpenAI from "openai";
import { goalPlanSchema, type GoalPlan } from "@/lib/ai/goal-planner/schema";
import type { GoalPlanIssue } from "@/lib/ai/goal-planner/validator";

type RewriterInput = {
  plan: GoalPlan;
  issues: GoalPlanIssue[];
  weeklyHours: number;
};

function buildPrompt(input: RewriterInput) {
  return `
Revise this plan to fix the listed issues.
Output ONLY valid JSON.
Only change what is needed.

Rules:
- keep the same JSON shape
- keep execution_steps concrete
- keep within weekly hours
- keep completed as false
- preserve good parts

Issues:
${JSON.stringify(input.issues, null, 2)}

Original plan:
${JSON.stringify(input.plan, null, 2)}
`.trim();
}

export async function runGoalPlanRewriter(input: RewriterInput): Promise<GoalPlan> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const res = await openai.chat.completions.create({
    model,
    temperature: 0.25,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are a plan rewriter. Output only valid JSON.",
      },
      {
        role: "user",
        content: buildPrompt(input),
      },
    ],
  });

  const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
  if (!raw) throw new Error("Rewriter returned empty response");

  const parsed = JSON.parse(raw);
  return goalPlanSchema.parse(parsed);
}