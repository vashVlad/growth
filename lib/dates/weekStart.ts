// lib/dates/weekStart.ts
export function getWeekStartDateNY(input: Date = new Date()): string {
  // Compute week start (Monday) in America/New_York and return YYYY-MM-DD
  const tz = "America/New_York";

  // Get Y-M-D in NY
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(input);

  const y = parts.find(p => p.type === "year")?.value!;
  const m = parts.find(p => p.type === "month")?.value!;
  const d = parts.find(p => p.type === "day")?.value!;

  // Construct a Date at midnight NY by interpreting as UTC and adjusting via day math only
  // We only need the *date* math (not time), so we can safely work with a UTC date constructed from Y-M-D.
  const dateUTC = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));

  // Day of week: 0=Sun ... 6=Sat. We want Monday as start.
  const dow = dateUTC.getUTCDay();
  const offsetToMonday = (dow + 6) % 7; // Mon=0, Tue=1, ... Sun=6
  dateUTC.setUTCDate(dateUTC.getUTCDate() - offsetToMonday);

  const yyyy = dateUTC.getUTCFullYear();
  const mm = String(dateUTC.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dateUTC.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
