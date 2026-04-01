function splitJourneySentences(s: string): string[] {
  const t = s.replace(/\s+/g, " ").trim();
  if (!t) return [];
  const parts = t.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
  return parts.length ? parts : [t];
}

function trimJourneyFiller(s: string): string {
  return s
    .replace(/\b(obviously|basically|honestly|in conclusion|all in all)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const JOURNEY_WEAK_FRICTION = [
  /ai\s+makes?\s+it\s+easier/i,
  /using\s+ai\s+made/i,
  /^it\s+was\s+pretty\s+easy\.?$/i,
  /^not\s+much\.?$/i,
  /^(yes|no|n\/?a)\.?$/i,
];

function isJourneyWeakFriction(s: string): boolean {
  const x = s.trim();
  if (x.length < 6) return true;
  return JOURNEY_WEAK_FRICTION.some((re) => re.test(x));
}

function journeyFrictionDisplay(raw: string): string {
  const parts = splitJourneySentences(raw)
    .map(trimJourneyFiller)
    .filter(Boolean)
    .filter((p) => !isJourneyWeakFriction(p))
    .slice(0, 2);
  return parts.join(" ").trim();
}

function normJourneyAction(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

function stripJourneyActionTail(s: string): string {
  return s
    .replace(
      /\b(Overall|In conclusion|All in all|Looking back),?\s+[^.!?]*[.!?]?\s*$/i,
      ""
    )
    .replace(/\s{2,}/g, " ")
    .trim();
}

function stripLeadingSubject(s: string): string {
  return s
    .replace(/^I(?:'ve|'m|\s+am)?\s+/i, "")
    .replace(/^We(?:'ve)?\s+/i, "")
    .trim();
}

function journeyActionDisplay(
  raw: string,
  ctx: { isNewestEntry: boolean; latestActionNorm: string }
): string {
  let t = raw.replace(/\s+/g, " ").trim();
  if (!t) return "";
  const compact = normJourneyAction(t);
  if (
    ctx.isNewestEntry &&
    ctx.latestActionNorm.length > 12 &&
    compact === ctx.latestActionNorm
  ) {
    return "";
  }
  t = stripJourneyActionTail(t);
  let one = splitJourneySentences(t)[0] ?? t;
  one = stripJourneyActionTail(stripLeadingSubject(one));
  one = one.replace(/[.!?]+$/g, "").trim();
  if (one.length > 200) {
    const cut = one.slice(0, 197).replace(/\s+\S*$/, "");
    return `${cut.trim()}…`;
  }
  return one;
}

function journeyMomentsSimilar(a: string, b: string): boolean {
  const A = normJourneyAction(a);
  const B = normJourneyAction(b);
  if (A.length < 12 || B.length < 12) return false;
  return A === B || A.includes(B) || B.includes(A);
}

function clipJourneyMoment(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1).replace(/\s+\S*$/, "");
  return `${cut.trim()}…`;
}

/** One calm sentence from action + easier_harder for this week only. */
export function journeyMomentLine(actionRaw: string, easierRaw: string): string {
  const a = journeyActionDisplay(actionRaw, {
    isNewestEntry: false,
    latestActionNorm: "",
  });
  const rBlock = journeyFrictionDisplay(easierRaw);
  let r =
    (splitJourneySentences(rBlock)[0] ?? rBlock).replace(/[.!?]+$/g, "").trim();
  r = trimJourneyFiller(r);

  if (!a && !r) return "";
  if (!r) return clipJourneyMoment(a, 200);
  if (!a) return clipJourneyMoment(r, 200);
  if (journeyMomentsSimilar(a, r)) return clipJourneyMoment(a, 200);

  const rLower = r.charAt(0).toLowerCase() + r.slice(1);
  const frictionCue =
    /\b(harder|easier|frustrat|difficult|challenging|struggl|drain|stress|tired|stuck|uncertain)\b/i.test(
      r
    );

  let out: string;
  if (/^(but|however|yet)\b/i.test(r)) {
    out = `${a}, ${rLower}.`;
  } else if (frictionCue) {
    out = `${a}, which ${rLower}.`;
  } else {
    out = `${a} while ${rLower}.`;
  }

  out = out
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/\.\.+$/g, ".");
  if (!/[.!?]$/.test(out)) out += ".";
  return clipJourneyMoment(out, 220);
}
