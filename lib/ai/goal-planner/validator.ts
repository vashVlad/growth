import OpenAI from "openai";
import { goalPlanSchema, type GoalPlan } from "@/lib/ai/goal-planner/schema";
import { z } from "zod";

const issueSchema = z.object({
  severity: z.enum(["high", "medium", "low"]),
  path: z.string(),
  problem: z.string(),
  fix: z.string(),
});

const validatorResultSchema = z.object({
  issues: z.array(issueSchema),
});

export type GoalPlanIssue = z.infer<typeof issueSchema>;

type ValidatorInput = {
  plan: GoalPlan;
  weeklyHours: number;
  pillar: "career" | "personal" | "internal";
  timeframeWeeks: number;
  constraints?: string | null;
};

function buildPrompt(input: ValidatorInput) {
  return `
Validate this goal plan and output ONLY valid JSON:
{
  "issues": [
    {
      "severity": "high|medium|low",
      "path": "string",
      "problem": "string",
      "fix": "string"
    }
  ]
}

Flag issues for:
- vague tasks
- vague execution_steps
- missing definition_of_done
- weekly_plan.target_hours exceeds weekly_hours
- missing success criteria
- missing risks or mitigations
- milestones not measurable
- bad pillar alignment
- overloaded week 1
- unrealistic execution_steps
- weekly_plan.target_hours must never exceed weekly_hours
- total estimate_hours in tasks must equal target_hours

Context:
weekly_hours: ${input.weeklyHours}
pillar: ${input.pillar}
timeframe_weeks: ${input.timeframeWeeks}
constraints: ${input.constraints?.trim() || "none"}

Plan JSON:
${JSON.stringify(input.plan, null, 2)}
`.trim();
}

export async function runGoalPlanValidator(input: ValidatorInput): Promise<GoalPlanIssue[]> {
  goalPlanSchema.parse(input.plan);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const res = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are a plan validator. Output only valid JSON.",
      },
      {
        role: "user",
        content: buildPrompt(input),
      },
    ],
  });

  const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
  if (!raw) return [];

  const parsed = JSON.parse(raw);
  const result = validatorResultSchema.parse(parsed);
  return result.issues;
}