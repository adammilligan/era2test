import { afterEach, describe, expect, it, vi } from "vitest";

import { CANCELED_BY_USER_MESSAGE } from "@/features/generation-queue/lib/task-meta";
import {
  initialQueueState,
  queueReducer,
} from "@/features/generation-queue/model/queueReducer";
import { createMockTask } from "../helpers/generation-task";

describe("queueReducer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("hydrates tasks", () => {
    const tasks = [createMockTask({ id: "hydrated" })];
    const state = queueReducer(initialQueueState, { type: "HYDRATE_SUCCESS", tasks });

    expect(state.isHydrated).toBe(true);
    expect(state.isInitializing).toBe(false);
    expect(state.tasks).toEqual(tasks);
  });

  it("prepends enqueued task", () => {
    const existing = createMockTask({ id: "existing" });
    const incoming = createMockTask({ id: "incoming" });
    const state = queueReducer(
      { ...initialQueueState, tasks: [existing], isHydrated: true, isInitializing: false },
      { type: "ENQUEUE", task: incoming },
    );

    expect(state.tasks.map((task) => task.id)).toEqual(["incoming", "existing"]);
  });

  it("cancels queued or running task", () => {
    const queued = createMockTask({ id: "queued", status: "queued" });
    const running = createMockTask({ id: "running", status: "running" });
    const done = createMockTask({ id: "done", status: "done" });
    const initialState = {
      ...initialQueueState,
      isHydrated: true,
      isInitializing: false,
      tasks: [queued, running, done],
    };

    const afterQueuedCancel = queueReducer(initialState, { type: "CANCEL", taskId: "queued" });
    expect(afterQueuedCancel.tasks[0]).toMatchObject({
      status: "canceled",
      errorMessage: CANCELED_BY_USER_MESSAGE,
    });

    const afterRunningCancel = queueReducer(initialState, { type: "CANCEL", taskId: "running" });
    expect(afterRunningCancel.tasks[1]).toMatchObject({
      status: "canceled",
      errorMessage: CANCELED_BY_USER_MESSAGE,
    });

    const afterDoneCancel = queueReducer(initialState, { type: "CANCEL", taskId: "done" });
    expect(afterDoneCancel.tasks[2].status).toBe("done");
  });

  it("retries failed or canceled task", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-24T12:00:00.000Z"));

    const failed = createMockTask({
      id: "failed",
      status: "failed",
      progress: 61,
      errorMessage: "Недостаточно кредитов",
      completedAt: "2026-06-24T11:00:00.000Z",
    });

    const state = queueReducer(
      { ...initialQueueState, isHydrated: true, isInitializing: false, tasks: [failed] },
      { type: "RETRY", taskId: "failed" },
    );

    expect(state.tasks[0]).toMatchObject({
      status: "queued",
      progress: 0,
      errorMessage: undefined,
      completedAt: undefined,
      createdAt: "2026-06-24T12:00:00.000Z",
    });

    vi.useRealTimers();
  });

  it("removes task by id", () => {
    const tasks = [createMockTask({ id: "keep" }), createMockTask({ id: "remove" })];
    const state = queueReducer(
      { ...initialQueueState, isHydrated: true, isInitializing: false, tasks },
      { type: "REMOVE", taskId: "remove" },
    );

    expect(state.tasks.map((task) => task.id)).toEqual(["keep"]);
  });
});
