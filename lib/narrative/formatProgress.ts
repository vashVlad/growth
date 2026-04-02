type SummaryVariant = (text: string) => string;

const summaryVariants: SummaryVariant[] = [
  (t) => t,
  (t) => `During this time, ${t}`,
  (t) => `This chapter reflects how ${t}`,
  (t) => `You moved forward by ${t}`,
];

const momentVariants: SummaryVariant[] = [
  (t) => t,
  (t) => `You worked on ${t}`,
  (t) => `You focused on ${t}`,
  (t) => `You made progress by ${t}`,
];

export function formatProgressNarrative({
  reflectionsByGoal,
}: {
  reflectionsByGoal: Map<string, any[]>;
}) {
  const newMap = new Map<string, any[]>();

  reflectionsByGoal.forEach((reflections, goalId) => {
    const formatted = reflections.map((r, i) => {
      const variants = [
        (t: string) => t,
        (t: string) => `You worked on ${t}`,
        (t: string) => `You focused on ${t}`,
      ];

      const formatter = variants[i % variants.length];

      return {
        ...r,
        formatted_action: formatter(r.action_taken || ""),
      };
    });

    newMap.set(goalId, formatted);
  });

  return newMap;
}