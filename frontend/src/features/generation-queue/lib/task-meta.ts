import type { GenerationTask } from "@/entities/generation-task";

export const CANCELED_BY_USER_MESSAGE = "Отменено пользователем";

const metaSecondaryClassName = "shrink-0 text-xs font-normal leading-none text-muted-foreground";

function formatDurationLabel(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds} сек`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (seconds === 0) {
    return `${minutes} мин`;
  }

  return `${minutes} мин ${seconds} сек`;
}

function getTaskEstimatedSeconds(task: GenerationTask): number {
  if (task.estimatedSeconds !== undefined) {
    return task.estimatedSeconds;
  }

  return Math.max(1, (task.estimatedMinutes ?? 1) * 60);
}

export function formatDoneTaskMetaLabel(durationSeconds: number, credits: number): string {
  return `Готово за ${formatDurationLabel(durationSeconds)} · ${credits} cr`;
}

export function formatQueuedTaskMetaLabel(position: number, credits: number): string {
  return `Позиция ${position} в очереди · ${credits} cr`;
}

export function formatRunningTaskMetaLabel(estimatedSeconds: number, credits: number): string {
  if (estimatedSeconds < 60) {
    return `≈ ${estimatedSeconds} сек · ${credits} cr`;
  }

  const minutes = Math.ceil(estimatedSeconds / 60);
  return `≈ ${minutes} мин · ${credits} cr`;
}

export function getTaskSecondaryLabel(task: GenerationTask, queuePosition?: number): string {
  if (task.status === "done") {
    return formatDoneTaskMetaLabel(getTaskEstimatedSeconds(task), task.credits);
  }

  if (task.status === "canceled") {
    return task.errorMessage ?? CANCELED_BY_USER_MESSAGE;
  }

  if (task.status === "failed") {
    return task.errorMessage ?? "Ошибка генерации";
  }

  if (task.status === "queued" && queuePosition !== undefined) {
    return formatQueuedTaskMetaLabel(queuePosition, task.credits);
  }

  if (task.status === "running") {
    return formatRunningTaskMetaLabel(getTaskEstimatedSeconds(task), task.credits);
  }

  return formatQueuedTaskMetaLabel(queuePosition ?? 1, task.credits);
}

export { metaSecondaryClassName };
