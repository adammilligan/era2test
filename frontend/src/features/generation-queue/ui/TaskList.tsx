import type { GenerationTask } from "@/entities/generation-task";
import { TaskRow } from "./TaskRow";

interface TaskListProps {
  tasks: GenerationTask[];
  queuePositions?: Record<string, number>;
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
}

export function TaskList({ tasks, queuePositions, onCancel, onRetry }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
        <p className="text-sm font-medium text-foreground">Нет задач</p>
        <p className="mt-1 text-sm text-muted-foreground">
          По выбранному фильтру генерации не найдены
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          queuePosition={queuePositions?.[task.id]}
          onCancel={onCancel}
          onRetry={onRetry}
        />
      ))}
    </ul>
  );
}
