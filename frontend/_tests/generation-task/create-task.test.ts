import { afterEach, describe, expect, it, vi } from "vitest";

import { createGenerationTask } from "@/entities/generation-task/model/createTask";
import type { CreateGenerationTaskInput } from "@/entities/generation-task";

const baseInput: CreateGenerationTaskInput = {
  type: "text",
  prompt: "Напиши пост",
  providerId: "chatgpt",
  modelId: "gpt-5.2",
  modelLabel: "GPT 5.2",
  credits: 6,
  estimatedMinutes: 2,
  estimatedSeconds: 120,
};

describe("createGenerationTask", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("creates queued task with zero progress", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-24T12:00:00.000Z"));
    vi.spyOn(Math, "random").mockReturnValue(0.123456789);

    const task = createGenerationTask(baseInput);

    expect(task).toMatchObject({
      type: "text",
      status: "queued",
      prompt: "Напиши пост",
      providerId: "chatgpt",
      modelId: "gpt-5.2",
      modelLabel: "GPT 5.2",
      credits: 6,
      estimatedMinutes: 2,
      estimatedSeconds: 120,
      progress: 0,
      createdAt: "2026-06-24T12:00:00.000Z",
    });
    expect(task.id.startsWith("task-")).toBe(true);
    expect(task.completedAt).toBeUndefined();
    expect(task.errorMessage).toBeUndefined();
  });
});
