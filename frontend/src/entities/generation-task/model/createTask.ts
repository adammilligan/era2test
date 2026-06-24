import type { CreateGenerationTaskInput, GenerationTask } from "./types";

export function createGenerationTask(input: CreateGenerationTaskInput): GenerationTask {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: input.type,
    status: "queued",
    prompt: input.prompt,
    createdAt: new Date().toISOString(),
    providerId: input.providerId,
    modelId: input.modelId,
    modelLabel: input.modelLabel,
    credits: input.credits,
    estimatedMinutes: input.estimatedMinutes,
    estimatedSeconds: input.estimatedSeconds,
    progress: 0,
  };
}
