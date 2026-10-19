/** One value per day, oldest first (UTC days). Days with no row are 0; rows outside the window are ignored. */
export function fillDays(rows: { d: string; n: number }[], days: number, today: Date = new Date()): number[] {
  const byDay = new Map(rows.map((r) => [r.d, r.n]));
  const end = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(end - (days - 1 - i) * 86_400_000).toISOString().slice(0, 10);
    return byDay.get(day) ?? 0;
  });
}

/** Change against the previous period, as the text shown next to a number. */
export function delta(current: number, previous: number): { text: string; up: boolean } {
  if (previous === 0) return current === 0 ? { text: "0%", up: true } : { text: "new", up: true };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { text: `${pct >= 0 ? "+" : ""}${pct}%`, up: pct >= 0 };
}

export function fmtDuration(s: number): string {
  const t = Math.max(0, Math.round(s));
  return t < 60 ? `${t}s` : `${Math.floor(t / 60)}m ${String(t % 60).padStart(2, "0")}s`;
}
