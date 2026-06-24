import { describe, expect, it } from "vitest";

import { getMobileBottomStyle } from "@/features/generation-queue/lib/widget-layout";

describe("widget-layout", () => {
  it("uses measured input stack offset on workspace pages", () => {
    expect(getMobileBottomStyle("/text", 212)).toBe("212px");
    expect(getMobileBottomStyle("/design", 180)).toBe("180px");
  });

  it("uses fallback offset on workspace pages without measurement", () => {
    expect(getMobileBottomStyle("/video", null)).toBe("240px");
  });

  it("uses default offset outside workspace pages", () => {
    expect(getMobileBottomStyle("/", null)).toBe("calc(env(safe-area-inset-bottom) + 8px)");
    expect(getMobileBottomStyle("/pricing", 120)).toBe("calc(env(safe-area-inset-bottom) + 8px)");
  });
});
