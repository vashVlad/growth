export type ProgressPillar = "career" | "personal" | "internal";

export function pillarLabel(p: ProgressPillar) {
  if (p === "career") return "Career";
  if (p === "personal") return "Personal";
  return "Internal";
}

/** "2026-02-23" -> "Feb 23" */
export function formatShortDate(iso: string | null | undefined) {
  const s = String(iso ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "—";
  const [, m, d] = s.split("-").map(Number);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[(m ?? 1) - 1] ?? "—"} ${d}`;
}
