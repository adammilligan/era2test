import type { GenerationTask } from "@/entities/generation-task";

export function createMockTask(overrides: Partial<GenerationTask> = {}): GenerationTask {
  return {
    id: "task-1",
    type: "image",
    status: "queued",
    prompt: "Test prompt",
    createdAt: "2026-01-01T10:00:00.000Z",
    providerId: "midjourney",
    modelId: "mj-8",
    modelLabel: "Midjourney v7",
    credits: 80,
    estimatedMinutes: 1,
    estimatedSeconds: 30,
    progress: 0,
    ...overrides,
  };
}
