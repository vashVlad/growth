import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type ReflectionInput = {
  action_taken: string;
  easier_harder: string;
  alignment: string;
  next_step: string;
};

export async function generateProgressInsight({
  goalTitle,
  milestone,
  reflections,
}: {
  goalTitle: string;
  milestone: string | null;
  reflections: ReflectionInput[];
}): Promise<string | null> {
  if (!reflections) reflections = [];

  const content = reflections
    .map(
      (r) => `
Action: ${r.action_taken}
Friction: ${r.easier_harder}
Alignment: ${r.alignment}
Next Step: ${r.next_step}
`
    )
    .join("\n\n");

 const prompt = `
  You are writing a short insight at the end of a chapter in a personal progress journal.

  Goal:
  ${goalTitle}

  Milestone:
  ${milestone ?? "None"}

  Reflections:
  ${content || "No reflections recorded."}

  Write a concise insight (2–4 sentences max).

  The insight must:
  - capture ONE clear pattern (not multiple)
  - describe how things changed over time
  - explain what made progress easier or more stable

  Optional:
  - include one short reflective question (max 1)

  Style:
  - calm, simple, and clear
  - like a margin note, not a report
  - easy to read in one pass

  Avoid:
  - repeating the same idea in different wording
  - expressing the same pattern more than once
  - stacking multiple explanations
  - analytical or technical language
  - poetic phrasing
  - describing events step-by-step
  - giving advice


  Important:
  - compress the insight into one clear idea
  - prefer brevity over completeness
  - always return a result (never null)

  If there are no reflections:
  - infer lightly from the goal and milestone
  - keep it simple and neutral

  Write it as a short, effortless observation.
  `;

  const res = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const output = res.choices[0]?.message?.content?.trim();

  if (!output) {
    return "Progress appears steady, though patterns are not clearly defined yet.";
  }

  return output;
  
}