import { describe, it, expect } from "vitest";
import { fillDays, delta, fmtDuration } from "@/lib/analytics/series";

describe("fillDays", () => {
  const today = new Date("2026-10-19T10:00:00Z");
  it("returns one value per day, oldest first, with zeros for quiet days", () => {
    const out = fillDays([{ d: "2026-10-17", n: 4 }, { d: "2026-10-19", n: 7 }], 5, today);
    expect(out).toEqual([0, 0, 4, 0, 7]); // Oct 15, 16, 17, 18, 19
  });
  it("ignores rows outside the window", () => {
    expect(fillDays([{ d: "2026-09-01", n: 99 }], 3, today)).toEqual([0, 0, 0]);
  });
});

describe("delta", () => {
  it("shows percentage change against the previous period", () => {
    expect(delta(118, 100)).toEqual({ text: "+18%", up: true });
    expect(delta(80, 100)).toEqual({ text: "-20%", up: false });
  });
  it("handles no previous data without dividing by zero", () => {
    expect(delta(5, 0)).toEqual({ text: "new", up: true });
    expect(delta(0, 0)).toEqual({ text: "0%", up: true });
  });
});

describe("fmtDuration", () => {
  it("formats seconds as 12s, 3m 04s", () => {
    expect(fmtDuration(0)).toBe("0s");
    expect(fmtDuration(12)).toBe("12s");
    expect(fmtDuration(184)).toBe("3m 04s");
    expect(fmtDuration(3600)).toBe("60m 00s");
  });
});
