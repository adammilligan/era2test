import type { GenerationTask } from "@/entities/generation-task";
import { getAverageActiveProgress } from "../model/selectors";

export function formatRunningCount(count: number): string {
  if (count === 1) {
    return "1 активна";
  }

  return `${count} активны`;
}

export function getWidgetHeader(tasks: GenerationTask[], runningCount: number) {
  if (runningCount > 0) {
    const progress = getAverageActiveProgress(tasks);

    return {
      title: runningCount === 1 ? "Генерация идёт" : "Генерации идут",
      subtitle: `${formatRunningCount(runningCount)} · ${progress}%`,
      progress,
    };
  }

  const queuedCount = tasks.filter((task) => task.status === "queued").length;

  return {
    title: "Генерации в очереди",
    subtitle: queuedCount === 1 ? "1 в очереди" : `${queuedCount} в очереди`,
    progress: 0,
  };
}
