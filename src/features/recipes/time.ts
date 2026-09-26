export type Duration = { hours: number; minutes: number };

const HOURS = /(\d+(?:[.,]\d+)?)\s*(?:h|hrs?|hours?)(?![a-z])/i;
const MINUTES = /(\d+)\s*(?:m|mins?|minutes?)(?![a-z])/i;

/**
 * Read a free-text time like "1 hr 45 min", "1.5 hours" or "90 minutes".
 * A bare number is taken as minutes. Returns null for text with no
 * recognizable hours or minutes (e.g. "overnight").
 */
export function parseDuration(text: string | undefined): Duration | null {
  const t = text?.trim();
  if (!t) return null;
  if (/^\d+$/.test(t)) return normalize(0, Number(t));

  const h = t.match(HOURS);
  const m = t.match(MINUTES);
  if (!h && !m) return null;
  return normalize(h ? Number(h[1]!.replace(",", ".")) : 0, m ? Number(m[1]) : 0);
}

/** Whole hours and minutes, with fractional hours and 60+ minutes carried over. */
function normalize(hours: number, minutes: number): Duration {
  const total = Math.round(hours * 60 + minutes);
  return { hours: Math.floor(total / 60), minutes: total % 60 };
}

/** "1 hr 45 min", "2 hr", "45 min", or "" when there's no time. */
export function formatDuration({ hours, minutes }: Duration): string {
  const { hours: h, minutes: m } = normalize(hours, minutes);
  return [h && `${h} hr`, m && `${m} min`].filter(Boolean).join(" ");
}
