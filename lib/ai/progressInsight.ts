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
  if (!reflections || reflections.length === 0) return null;

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
  You are writing a short reflection at the end of a chapter in a personal progress journal.

  Goal:
  ${goalTitle}

  Milestone:
  ${milestone ?? "None"}

  Reflections:
  ${content}

  Write a short reflection (2–3 sentences max) that focuses on how things evolved over time.

  The reflection should:
  - describe how the experience became more stable, consistent, or natural
  - highlight how earlier friction changed or settled
  - capture the overall direction of progress (not specific events)

  Then optionally add one short reflective question (max 1).

  The question must:
  - focus on the experience itself
  - be simple and natural
  - refer indirectly (e.g. "those moments", "that stage")
  - NOT suggest improvement or solutions

  Style:
  - calm, grounded, and human
  - like a quiet note written after looking back over time
  - simple, natural phrasing

  Avoid:
  - describing individual events in detail
  - analytical or technical language
  - phrases like "pattern", "process", "friction"
  - sounding like a report or explanation
  - giving advice or future suggestions
  - repeating reflection wording directly

  Important:
  - Do NOT use "I"
  - Do NOT analyze the person
  - Do NOT explain behavior
  - Focus on how things changed over time
  - keep it concise and natural

  Write it as a quiet observation of how things have settled or shifted.
  `;

  const res = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return res.choices[0]?.message?.content?.trim() || null;
}