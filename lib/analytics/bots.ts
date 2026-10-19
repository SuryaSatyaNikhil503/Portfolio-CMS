const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|httpclient|axios|node-fetch|go-http|java\/|libwww|facebookexternalhit|embedly|whatsapp|telegram|discord|petalbot|semrush|ahrefs|perplexity|chatgpt-user|gptbot|claudebot|anthropic-ai/i;

/** True for crawlers, link-preview fetchers, headless browsers, scripts and requests with no user agent. */
export function isBot(ua: string | null | undefined): boolean {
  return !ua || BOT.test(ua);
}
