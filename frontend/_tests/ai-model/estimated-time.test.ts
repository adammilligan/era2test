import { describe, expect, it } from "vitest";

import {
  formatEstimatedSeconds,
  formatRunningTaskMetaLabel,
  parseTimeLabelToMinutes,
  resolveEstimatedMinutes,
  resolveEstimatedSeconds,
} from "@/entities/ai-model/lib/estimated-time";

describe("estimated-time", () => {
  it("parses seconds label to minutes", () => {
    expect(parseTimeLabelToMinutes("30 сек")).toBe(1);
    expect(parseTimeLabelToMinutes("120 сек")).toBe(2);
  });

  it("parses minutes label", () => {
    expect(parseTimeLabelToMinutes("2 мин")).toBe(2);
  });

  it("resolves estimated minutes from time label", () => {
    expect(resolveEstimatedMinutes({ time: "30 сек" })).toBe(1);
    expect(resolveEstimatedMinutes({ estimatedMinutes: 3 })).toBe(3);
  });

  it("resolves estimated seconds from model data", () => {
    expect(resolveEstimatedSeconds({ time: "30 сек" })).toBe(30);
    expect(resolveEstimatedSeconds({ estimatedSeconds: 45 })).toBe(45);
    expect(resolveEstimatedSeconds({ estimatedMinutes: 2 })).toBe(120);
  });

  it("formats estimated seconds label", () => {
    expect(formatEstimatedSeconds(30)).toBe("≈ 30 сек");
    expect(formatEstimatedSeconds(120)).toBe("≈ 2 мин");
  });

  it("formats running meta label", () => {
    expect(formatRunningTaskMetaLabel(30, 80)).toBe("≈ 30 сек · 80 cr");
  });
});
