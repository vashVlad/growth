export function formatProgressNarrative({
  reflectionsByGoal,
}: {
  reflectionsByGoal: Map<string, any[]>;
}) {
  function formatMoment(text: string) {
    if (!text) return "";

    let t = text.trim();

    // capitalize first letter
    t = t.charAt(0).toUpperCase() + t.slice(1);

    // fix spacing after commas
    t = t.replace(/,\s*/g, ", ");

    // ensure punctuation at the end
    if (!/[.!?]$/.test(t)) t += ".";

    return t;
  }

  const newMap = new Map<string, any[]>();

  reflectionsByGoal.forEach((reflections, goalId) => {
    const formatted = reflections.map((r) => ({
      ...r,
      formatted_action: formatMoment(r.action_taken || ""),
    }));

    newMap.set(goalId, formatted);
  });

  return newMap;
}