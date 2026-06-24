import type { GenerationTask } from "@/entities/generation-task";

const STORAGE_KEY = "era2_generation_queue";

function isGenerationTask(value: unknown): value is GenerationTask {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string"
    && typeof record.type === "string"
    && typeof record.status === "string"
    && typeof record.prompt === "string"
    && typeof record.createdAt === "string"
    && typeof record.providerId === "string"
    && typeof record.modelId === "string"
    && typeof record.modelLabel === "string"
    && typeof record.credits === "number"
    && typeof record.progress === "number"
  );
}

function normalizeStoredTask(task: GenerationTask): GenerationTask {
  const estimatedMinutes = task.estimatedMinutes ?? 1;

  return {
    ...task,
    estimatedMinutes,
    estimatedSeconds: task.estimatedSeconds ?? estimatedMinutes * 60,
  };
}

export function loadQueueTasks(): GenerationTask[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed
      .filter(isGenerationTask)
      .map(normalizeStoredTask);
  } catch {
    return null;
  }
}

export function saveQueueTasks(tasks: GenerationTask[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
