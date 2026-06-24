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

export function getWidgetPreviewTasks(tasks: GenerationTask[]): GenerationTask[] {
  const runningTasks = tasks
    .filter((task) => task.status === "running")
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 2);

  const queuedTasks = tasks
    .filter((task) => task.status === "queued")
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
    .slice(0, 1);

  return [...runningTasks, ...queuedTasks];
}

export function getRunningTaskCount(tasks: GenerationTask[]): number {
  return tasks.filter((task) => task.status === "running").length;
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

export function getQueuedTaskPositions(tasks: GenerationTask[]): Record<string, number> {
  const queuedTasks = tasks
    .filter((task) => task.status === "queued")
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

  return queuedTasks.reduce<Record<string, number>>((positions, task, index) => {
    positions[task.id] = index + 1;
    return positions;
  }, {});
}

export type QueueStatusFilter = "all" | "queued" | "running" | "done" | "failed";

export type SortOrder = "newest" | "oldest" | "progress" | "status";

const statusSortOrder: Record<TaskStatus, number> = {
  running: 0,
  queued: 1,
  failed: 2,
  canceled: 3,
  done: 4,
};

export function filterTasksByStatus(tasks: GenerationTask[], filter: QueueStatusFilter): GenerationTask[] {
  if (filter === "all") {
    return tasks;
  }

  if (filter === "failed") {
    return tasks.filter((task) => task.status === "failed" || task.status === "canceled");
  }

  return tasks.filter((task) => task.status === filter);
}

export function sortTasks(tasks: GenerationTask[], order: SortOrder): GenerationTask[] {
  return [...tasks].sort((left, right) => {
    if (order === "progress") {
      return right.progress - left.progress;
    }

    if (order === "status") {
      const statusDiff = statusSortOrder[left.status] - statusSortOrder[right.status];
      if (statusDiff !== 0) {
        return statusDiff;
      }
    }

    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    return order === "oldest" ? leftTime - rightTime : rightTime - leftTime;
  });
}

export function searchTasksByPrompt(tasks: GenerationTask[], query: string): GenerationTask[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return tasks;
  }

  return tasks.filter((task) => task.prompt.toLowerCase().includes(normalizedQuery));
}
