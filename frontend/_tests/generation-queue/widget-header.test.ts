import { describe, expect, it } from "vitest";

import {
  formatRunningCount,
  getWidgetHeader,
} from "@/features/generation-queue/lib/widget-header";
import { createMockTask } from "../helpers/generation-task";

describe("widget-header", () => {
  it("formats running count in singular and plural", () => {
    expect(formatRunningCount(1)).toBe("1 активна");
    expect(formatRunningCount(3)).toBe("3 активны");
  });

  it("builds header for single running task", () => {
    const tasks = [createMockTask({ status: "running", progress: 50 })];

    expect(getWidgetHeader(tasks, 1)).toEqual({
      title: "Генерация идёт",
      subtitle: "1 активна · 50%",
      progress: 50,
    });
  });

  it("builds header for multiple running tasks", () => {
    const tasks = [
      createMockTask({ id: "a", status: "running", progress: 40 }),
      createMockTask({ id: "b", status: "running", progress: 60 }),
    ];

    expect(getWidgetHeader(tasks, 2)).toEqual({
      title: "Генерации идут",
      subtitle: "2 активны · 50%",
      progress: 50,
    });
  });

  it("builds header for queued-only tasks", () => {
    const tasks = [
      createMockTask({ id: "queued-1", status: "queued" }),
      createMockTask({ id: "queued-2", status: "queued" }),
    ];

    expect(getWidgetHeader(tasks, 0)).toEqual({
      title: "Генерации в очереди",
      subtitle: "2 в очереди",
      progress: 0,
    });
  });

  it("builds header for single queued task", () => {
    const tasks = [createMockTask({ status: "queued" })];

    expect(getWidgetHeader(tasks, 0)).toEqual({
      title: "Генерации в очереди",
      subtitle: "1 в очереди",
      progress: 0,
    });
  });
});
