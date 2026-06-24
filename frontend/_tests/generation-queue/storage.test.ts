import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadQueueTasks, saveQueueTasks } from "@/features/generation-queue/model/storage";
import { createMockTask } from "../helpers/generation-task";

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe("queue storage", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", createLocalStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when storage is empty", () => {
    expect(loadQueueTasks()).toBeNull();
  });

  it("saves and loads tasks", () => {
    const tasks = [createMockTask({ id: "stored" })];
    saveQueueTasks(tasks);

    expect(loadQueueTasks()).toEqual(tasks);
  });

  it("normalizes missing estimatedSeconds on load", () => {
    const legacyTask = {
      id: "legacy",
      type: "text",
      status: "queued",
      prompt: "Legacy prompt",
      createdAt: "2026-01-01T10:00:00.000Z",
      providerId: "chatgpt",
      modelId: "gpt-5.2",
      modelLabel: "GPT 5.2",
      credits: 6,
      estimatedMinutes: 2,
      progress: 0,
    };

    localStorage.setItem("era2_generation_queue", JSON.stringify([legacyTask]));

    expect(loadQueueTasks()?.[0]).toMatchObject({
      estimatedMinutes: 2,
      estimatedSeconds: 120,
    });
  });

  it("filters invalid records", () => {
    localStorage.setItem(
      "era2_generation_queue",
      JSON.stringify([{ id: "broken" }, createMockTask({ id: "valid" })]),
    );

    expect(loadQueueTasks()?.map((task) => task.id)).toEqual(["valid"]);
  });
});
