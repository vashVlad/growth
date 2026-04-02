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

Write a short reflection (2–3 sentences max) that follows this structure:

1. Describe how the work shifted (e.g., building → fixing → finishing)
2. Highlight where difficulty appeared (especially small changes causing larger problems)
3. Keep it grounded in the experience, not interpretation

Then optionally add one short reflective question (max 1).

The question must:
- focus on the experience itself (not a specific event)
- be short and natural
- refer back indirectly (e.g. "those moments", "that stage", "the final stretch")
- NOT repeat the situation already described
- NOT suggest improvement or solutions
- NOT ask for recall (avoid "which", "when", "what took longest")

Style:
- calm, simple, and human
- like a quiet note written in the margin of a book
- clear, natural phrasing (no complex wording)
- use everyday language (e.g. "those moments", "the final stretch")
- keep sentences short and easy to read

Avoid:
- starting with "Over time"
- phrases like "you tend to", "this suggests", "patterns show"
- technical or analytical language
- mentioning AI, tools, or systems
- sounding like advice, evaluation, or a report
- poetic or metaphor-heavy language
- vague phrases like "progress stayed on track"
- abstract words like "process", "patterns"
- repeating the same situation in the question
- long or overly detailed questions

Important:
- Do NOT use "I"
- Do NOT analyze the person
- Do NOT explain behavior
- Do NOT generalize
- Keep observations concrete and specific
- Focus on what happened, not what it means
- the question should feel like a natural thought, not a restatement
- prefer present tense in the question (e.g. "What does that feel like?")

Write it as a quiet observation, not an explanation.
Keep it concise and easy to read.
`;

  const res = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return res.choices[0]?.message?.content?.trim() || null;
}