import type { GenerationTask } from "@/entities/generation-task";

const STORAGE_KEY = "era2_generation_queue";

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

    return parsed as GenerationTask[];
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
