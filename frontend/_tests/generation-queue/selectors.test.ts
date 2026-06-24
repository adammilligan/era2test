import { describe, expect, it } from "vitest";

import {
  filterTasksByStatus,
  getActiveTaskCount,
  getAverageActiveProgress,
  getQueuedTaskPositions,
  getQueueStats,
  getRunningTaskCount,
  getWidgetPreviewTasks,
  searchTasksByPrompt,
  sortTasks,
} from "@/features/generation-queue/model/selectors";
import { createMockTask } from "../helpers/generation-task";

describe("queue selectors", () => {
  const tasks = [
    createMockTask({ id: "queued-old", status: "queued", createdAt: "2026-01-01T09:00:00.000Z" }),
    createMockTask({ id: "queued-new", status: "queued", createdAt: "2026-01-01T11:00:00.000Z" }),
    createMockTask({ id: "running", status: "running", progress: 40, createdAt: "2026-01-01T10:00:00.000Z" }),
    createMockTask({ id: "done", status: "done", progress: 100, createdAt: "2026-01-01T08:00:00.000Z" }),
    createMockTask({ id: "failed", status: "failed", progress: 50, createdAt: "2026-01-01T07:00:00.000Z" }),
    createMockTask({ id: "canceled", status: "canceled", progress: 10, createdAt: "2026-01-01T06:00:00.000Z" }),
  ];

  it("calculates queue stats", () => {
    expect(getQueueStats(tasks)).toEqual({
      queued: 2,
      running: 1,
      done: 1,
      failed: 2,
    });
  });

  it("counts active tasks", () => {
    expect(getActiveTaskCount(tasks)).toBe(3);
  });

  it("calculates average running progress", () => {
    expect(getAverageActiveProgress(tasks)).toBe(40);
    expect(getAverageActiveProgress([createMockTask({ status: "done" })])).toBe(0);
  });

  it("maps queued positions by createdAt", () => {
    expect(getQueuedTaskPositions(tasks)).toEqual({
      "queued-old": 1,
      "queued-new": 2,
    });
  });

  it("filters tasks by status", () => {
    expect(filterTasksByStatus(tasks, "running").map((task) => task.id)).toEqual(["running"]);
    expect(filterTasksByStatus(tasks, "failed").map((task) => task.id)).toEqual(["failed", "canceled"]);
  });

  it("sorts tasks by newest and oldest", () => {
    expect(sortTasks(tasks, "newest").map((task) => task.id)).toEqual([
      "queued-new",
      "running",
      "queued-old",
      "done",
      "failed",
      "canceled",
    ]);

    expect(sortTasks(tasks, "oldest").map((task) => task.id)).toEqual([
      "canceled",
      "failed",
      "done",
      "queued-old",
      "running",
      "queued-new",
    ]);
  });

  it("sorts tasks by progress and status", () => {
    expect(sortTasks(tasks, "progress").map((task) => task.id)[0]).toBe("done");
    expect(sortTasks(tasks, "status").map((task) => task.id)[0]).toBe("running");
  });

  it("searches tasks by prompt", () => {
    const searchable = [
      createMockTask({ id: "a", prompt: "Cyberpunk city" }),
      createMockTask({ id: "b", prompt: "Portrait photo" }),
    ];

    expect(searchTasksByPrompt(searchable, "cyber").map((task) => task.id)).toEqual(["a"]);
    expect(searchTasksByPrompt(searchable, "  ")).toEqual(searchable);
  });

  it("counts running tasks", () => {
    expect(getRunningTaskCount(tasks)).toBe(1);
    expect(getRunningTaskCount([createMockTask({ status: "queued" })])).toBe(0);
  });

  it("returns widget preview with two running and one queued task", () => {
    const previewTasks = [
      createMockTask({ id: "running-new", status: "running", createdAt: "2026-01-01T12:00:00.000Z" }),
      createMockTask({ id: "running-old", status: "running", createdAt: "2026-01-01T11:00:00.000Z" }),
      createMockTask({ id: "running-extra", status: "running", createdAt: "2026-01-01T10:00:00.000Z" }),
      createMockTask({ id: "queued-new", status: "queued", createdAt: "2026-01-01T13:00:00.000Z" }),
      createMockTask({ id: "queued-old", status: "queued", createdAt: "2026-01-01T09:00:00.000Z" }),
      createMockTask({ id: "done", status: "done" }),
    ];

    expect(getWidgetPreviewTasks(previewTasks).map((task) => task.id)).toEqual([
      "running-new",
      "running-old",
      "queued-old",
    ]);
  });

  it("returns empty widget preview when there are no active tasks", () => {
    const previewTasks = [
      createMockTask({ id: "done", status: "done" }),
      createMockTask({ id: "failed", status: "failed" }),
    ];

    expect(getWidgetPreviewTasks(previewTasks)).toEqual([]);
  });
});
