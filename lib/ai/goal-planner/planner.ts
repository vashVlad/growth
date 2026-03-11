import OpenAI from "openai";
import { goalPlanSchema, type GoalPlan } from "@/lib/ai/goal-planner/schema";

type PlannerInput = {
  goalId: string;
  pillar: "career" | "personal" | "internal";
  title: string;
  milestone: string | null;
  timeframeWeeks: number;
  weeklyHours: number;
  constraints?: string | null;
  intensity?: string | null;
  latestReflection?: string | null;
};

function buildPrompt(input: PlannerInput) {
  return `
You are a planning agent. Output ONLY valid JSON. No markdown. No prose.

JSON rules:
- Match this exact structure:
{
  "goal_summary": {
    "goal_id": "string",
    "pillar": "career|personal|internal",
    "title": "string",
    "milestone": "string|null"
  },
  "assumptions": ["string"],
  "execution_steps": [
    {
      "step": "string",
      "definition_of_done": "string",
      "completed": false
    }
  ],
  "milestones": [
    {
      "id": "m1",
      "title": "string",
      "success_metric": "string",
      "due_week": 1
    }
  ],
  "weekly_plan": [
    {
      "week": 1,
      "focus": "string",
      "tasks": [
        {
          "task": "string",
          "estimate_hours": 1,
          "definition_of_done": "string"
        }
      ],
      "target_hours": 1
    }
  ],
  "risks": [
    {
      "risk": "string",
      "mitigation": "string"
    }
  ],
  "success_criteria": ["string"]
}

Planning rules:
- Produce 1 to 3 execution_steps only.
- execution_steps must be concrete, short, and realistically doable soon.
- completed must always be false.
- weekly_plan total per week must stay within weeklyHours.
- tasks must be specific and verifiable, never vague.
- milestones must be measurable.
- include at least 1 risk and 1 success_criteria item.
- align to the goal pillar.
- timeframe must fit the requested weeks.
- intensity should influence ambition level.
- next steps should feel realistic for this user.

Goal context:
goal_id: ${input.goalId}
pillar: ${input.pillar}
title: ${input.title}
milestone: ${input.milestone ?? "null"}
timeframe_weeks: ${input.timeframeWeeks}
weekly_hours: ${input.weeklyHours}
constraints: ${input.constraints?.trim() || "none"}
intensity: ${input.intensity?.trim() || "balanced"}
latest_reflection: ${input.latestReflection?.trim() || "none"}
`.trim();
}

export async function runGoalPlanner(input: PlannerInput): Promise<GoalPlan> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const makeCall = async () => {
    const res = await openai.chat.completions.create({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a planning agent. Output only valid JSON.",
        },
        {
          role: "user",
          content: buildPrompt(input),
        },
      ],
    });

    const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
    if (!raw) throw new Error("Planner returned empty response");

    const parsed = JSON.parse(raw);
    return goalPlanSchema.parse(parsed);
  };

  try {
    return await makeCall();
  } catch {
    return await makeCall();
  }
}