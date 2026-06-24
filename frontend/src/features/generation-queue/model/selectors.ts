import type { GenerationTask, TaskStatus } from "@/entities/generation-task";

export interface QueueStats {
  queued: number;
  running: number;
  done: number;
  failed: number;
}

export function getQueueStats(tasks: GenerationTask[]): QueueStats {
  return tasks.reduce<QueueStats>(
    (stats, task) => {
      if (task.status === "queued") {
        stats.queued += 1;
      } else if (task.status === "running") {
        stats.running += 1;
      } else if (task.status === "done") {
        stats.done += 1;
      } else if (task.status === "failed" || task.status === "canceled") {
        stats.failed += 1;
      }

      return stats;
    },
    { queued: 0, running: 0, done: 0, failed: 0 },
  );
}

export function getActiveTaskCount(tasks: GenerationTask[]): number {
  return tasks.filter((task) => task.status === "queued" || task.status === "running").length;
}

export function getAverageActiveProgress(tasks: GenerationTask[]): number {
  const activeTasks = tasks.filter((task) => task.status === "running");

  if (activeTasks.length === 0) {
    return 0;
  }

  const total = activeTasks.reduce((sum, task) => sum + task.progress, 0);
  return Math.round(total / activeTasks.length);
}

export type StatusFilter = "all" | TaskStatus;

export type SortOrder = "newest" | "oldest";

export function filterTasksByStatus(tasks: GenerationTask[], filter: StatusFilter): GenerationTask[] {
  if (filter === "all") {
    return tasks;
  }

  return tasks.filter((task) => task.status === filter);
}

export function sortTasks(tasks: GenerationTask[], order: SortOrder): GenerationTask[] {
  return [...tasks].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    return order === "newest" ? rightTime - leftTime : leftTime - rightTime;
  });
}

export function searchTasksByPrompt(tasks: GenerationTask[], query: string): GenerationTask[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return tasks;
  }

  return tasks.filter((task) => task.prompt.toLowerCase().includes(normalizedQuery));
}
