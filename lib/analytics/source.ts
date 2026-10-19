const HOSTS: [RegExp, string][] = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/, "LinkedIn"],
  [/^t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/, "Twitter/X"],
  [/(^|\.)github\.com$/, "GitHub"],
  [/(^|\.)reddit\.com$/, "Reddit"],
  [/(^|\.)facebook\.com$|^fb\.com$|(^|\.)l\.facebook\.com$/, "Facebook"],
  [/(^|\.)youtube\.com$|^youtu\.be$/, "YouTube"],
  [/^news\.ycombinator\.com$/, "Hacker News"],
];
const UTM: Record<string, string> = { linkedin: "LinkedIn", twitter: "Twitter/X", x: "Twitter/X", google: "Google", github: "GitHub", reddit: "Reddit", facebook: "Facebook", youtube: "YouTube" };
const strip = (h: string) => h.toLowerCase().replace(/^www\./, "");

/** Where a visit came from. utm_source wins over the referrer; the site itself counts as Direct. */
export function classifySource(referrer: string, utmSource: string | null | undefined, selfHost: string): { source: string; host: string } {
  const utm = utmSource?.trim().toLowerCase();
  let host = "";
  if (referrer) {
    try { host = strip(new URL(referrer).hostname); } catch { host = ""; }
  }
  if (utm) return { source: UTM[utm] ?? utm.charAt(0).toUpperCase() + utm.slice(1), host };
  if (!referrer) return { source: "Direct", host: "" };
  if (host && host === strip(selfHost)) return { source: "Direct", host };
  const hit = HOSTS.find(([re]) => re.test(host));
  return { source: hit ? hit[1] : "Other", host };
}
