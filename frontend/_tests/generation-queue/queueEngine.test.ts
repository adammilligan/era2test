import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyEngineTick,
  initEngineMeta,
  MAX_CONCURRENT,
  removeEngineMeta,
} from "@/features/generation-queue/model/queueEngine";
import { createMockTask } from "../helpers/generation-task";

describe("queueEngine", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts queued tasks up to MAX_CONCURRENT", () => {
    const tasks = [
      createMockTask({ id: "running", status: "running", progress: 10 }),
      createMockTask({ id: "queued-1", status: "queued", createdAt: "2026-01-01T09:00:00.000Z" }),
      createMockTask({ id: "queued-2", status: "queued", createdAt: "2026-01-01T10:00:00.000Z" }),
      createMockTask({ id: "queued-3", status: "queued", createdAt: "2026-01-01T11:00:00.000Z" }),
    ];

    const nextTasks = applyEngineTick(tasks);
    const startedIds = nextTasks
      .filter((task) => task.status === "running")
      .map((task) => task.id);

    expect(startedIds).toEqual(["running", "queued-1"]);
    expect(startedIds.length).toBeLessThanOrEqual(MAX_CONCURRENT);
  });

  it("progresses running task on tick", () => {
    const task = createMockTask({ id: "running", status: "running", progress: 10, type: "image" });
    initEngineMeta(task);

    const [nextTask] = applyEngineTick([task]);

    expect(nextTask.progress).toBeGreaterThan(10);
    expect(nextTask.status).toBe("running");
  });

  it("completes running task when progress reaches 100", () => {
    let randomCall = 0;
    vi.spyOn(Math, "random").mockImplementation(() => {
      randomCall += 1;
      if (randomCall === 1) {
        return 0.99;
      }

      return 0;
    });

    const task = createMockTask({ id: "running", status: "running", progress: 96, type: "text" });
    removeEngineMeta(task.id);
    initEngineMeta(task);

    const [nextTask] = applyEngineTick([task]);

    expect(nextTask).toMatchObject({
      status: "done",
      progress: 100,
    });
    expect(nextTask.completedAt).toBeTypeOf("string");
  });

  it("recovers meta for running task and still progresses", () => {
    const task = createMockTask({ id: "running", status: "running", progress: 20, type: "video" });
    removeEngineMeta(task.id);

    const [nextTask] = applyEngineTick([task]);

    expect(nextTask.progress).toBeGreaterThan(20);
  });

  it("fails running task when fail threshold is reached", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);

    const task = createMockTask({ id: "running", status: "running", progress: 70, type: "text" });
    removeEngineMeta(task.id);
    initEngineMeta(task);

    const [nextTask] = applyEngineTick([task]);

    expect(nextTask).toMatchObject({
      status: "failed",
      progress: 74,
    });
    expect(nextTask.errorMessage).toBeTypeOf("string");
  });

  it("progresses multiple running tasks on one tick", () => {
    const tasks = [
      createMockTask({ id: "running-a", status: "running", progress: 10, type: "image" }),
      createMockTask({ id: "running-b", status: "running", progress: 20, type: "video" }),
    ];

    tasks.forEach((task) => initEngineMeta(task));

    const nextTasks = applyEngineTick(tasks);

    expect(nextTasks[0].progress).toBeGreaterThan(10);
    expect(nextTasks[1].progress).toBeGreaterThan(20);
  });
});
