import type { GenType, GenerationTask } from "@/entities/generation-task";

export const MAX_CONCURRENT = 2;

const FAIL_MESSAGES = [
  "Недостаточно кредитов",
  "Превышено время ожидания",
  "Модель временно недоступна",
] as const;

const TYPE_STEP_RANGE: Record<GenType, { min: number; max: number }> = {
  text: { min: 4, max: 10 },
  image: { min: 4, max: 10 },
  video: { min: 1, max: 4 },
  audio: { min: 1, max: 4 },
};

interface TaskEngineMeta {
  stepMin: number;
  stepMax: number;
  willFail: boolean;
  failAtProgress?: number;
}

const engineMeta = new Map<string, TaskEngineMeta>();

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickFailMessage(): string {
  const index = randomInt(0, FAIL_MESSAGES.length - 1);
  return FAIL_MESSAGES[index];
}

export function initEngineMeta(task: GenerationTask): void {
  const range = TYPE_STEP_RANGE[task.type];
  const willFail = Math.random() < 0.15;

  engineMeta.set(task.id, {
    stepMin: range.min,
    stepMax: range.max,
    willFail,
    failAtProgress: willFail ? randomInt(25, 85) : undefined,
  });
}

export function removeEngineMeta(taskId: string): void {
  engineMeta.delete(taskId);
}

export function clearAllEngineMeta(): void {
  engineMeta.clear();
}

export function ensureEngineMetaForRunningTasks(tasks: GenerationTask[]): void {
  for (const task of tasks) {
    if (task.status === "running" && !engineMeta.has(task.id)) {
      initEngineMeta(task);
    }
  }
}

function sortQueuedTasks(tasks: GenerationTask[]): GenerationTask[] {
  return [...tasks].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

function startQueuedTasks(tasks: GenerationTask[]): GenerationTask[] {
  const runningCount = tasks.filter((task) => task.status === "running").length;
  if (runningCount >= MAX_CONCURRENT) {
    return tasks;
  }

  const slotsLeft = MAX_CONCURRENT - runningCount;
  const queuedIds = new Set(
    sortQueuedTasks(tasks.filter((task) => task.status === "queued"))
      .slice(0, slotsLeft)
      .map((task) => task.id),
  );

  if (queuedIds.size === 0) {
    return tasks;
  }

  return tasks.map((task) => {
    if (!queuedIds.has(task.id)) {
      return task;
    }

    initEngineMeta(task);
    return { ...task, status: "running" as const };
  });
}

function progressRunningTasks(tasks: GenerationTask[]): GenerationTask[] {
  return tasks.map((task) => {
    if (task.status !== "running") {
      return task;
    }

    if (!engineMeta.has(task.id)) {
      initEngineMeta(task);
    }

    const meta = engineMeta.get(task.id);
    if (!meta) {
      return task;
    }

    const currentProgress = Number.isFinite(task.progress) ? task.progress : 0;

    if (currentProgress >= 100) {
      removeEngineMeta(task.id);
      return {
        ...task,
        status: "done",
        progress: 100,
        completedAt: new Date().toISOString(),
      };
    }

    const step = randomInt(meta.stepMin, meta.stepMax);
    const nextProgress = Math.min(100, currentProgress + step);

    if (meta.willFail && meta.failAtProgress !== undefined && nextProgress >= meta.failAtProgress) {
      removeEngineMeta(task.id);
      return {
        ...task,
        status: "failed",
        progress: nextProgress,
        errorMessage: pickFailMessage(),
      };
    }

    if (nextProgress >= 100) {
      removeEngineMeta(task.id);
      return {
        ...task,
        status: "done",
        progress: 100,
        completedAt: new Date().toISOString(),
      };
    }

    return {
      ...task,
      progress: nextProgress,
    };
  });
}

export function applyEngineTick(tasks: GenerationTask[]): GenerationTask[] {
  ensureEngineMetaForRunningTasks(tasks);
  const withStarted = startQueuedTasks(tasks);
  return progressRunningTasks(withStarted);
}
