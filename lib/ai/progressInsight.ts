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
You are writing a short analytical insight at the end of a chapter in a personal progress journal.

Goal:
${goalTitle}

Milestone:
${milestone ?? "None"}

Reflections:
${content || "No reflections recorded."}

Write a short insight (3–5 sentences max).

The insight must:
- identify how behavior changed over time
- explain what reduced friction or improved consistency
- highlight a clear pattern (e.g., inconsistency → structure, friction → stability)

If there are no reflections:
- infer carefully from the goal and milestone
- mention that patterns are less visible due to lack of recorded data
- still provide a calm, reasonable interpretation

Optional:
- include one short reflective question (max 1)

Style:
- calm, neutral, analytical
- clear and grounded language
- no poetic phrasing
- no storytelling or recap

Avoid:
- describing events in detail
- vague phrases like "settled into rhythm"
- giving advice or instructions
- "you should", "you can", "next time"

Important:
- do NOT return null
- always return a complete paragraph
- focus on patterns, not individual actions
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