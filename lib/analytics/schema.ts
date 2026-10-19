import { z } from "zod";

// Query strings and fragments can carry personal data (emails, tokens): they are removed before anything is stored.
const path = z
  .string()
  .max(2000)
  .transform((p) => p.split(/[?#]/)[0] ?? "")
  .pipe(z.string().min(1).max(300).startsWith("/").refine((p) => !p.startsWith("/admin") && !p.startsWith("/api"), "private path"));
const sid = z.string().uuid();
const seq = z.number().int().min(0).max(500);

export const EVENT_NAMES = ["resume_download", "newsletter_subscribe", "comment"] as const;

export const trackPayload = z.discriminatedUnion("type", [
  z.object({ type: z.literal("view"), sid, path, seq, title: z.string().max(200).optional(), referrer: z.string().max(500).optional(), utm: z.string().max(60).optional() }),
  z.object({ type: z.literal("leave"), sid, path, seq, activeSeconds: z.number().int().min(0).max(7200), scrollDepth: z.number().int().min(0).max(100) }),
  z.object({ type: z.literal("event"), sid, path, name: z.enum(EVENT_NAMES) }),
]);

export type TrackPayload = z.infer<typeof trackPayload>;
