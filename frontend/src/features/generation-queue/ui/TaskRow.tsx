import type { GenerationTask, TaskStatus } from "@/entities/generation-task";
import { getTaskSecondaryLabel, metaSecondaryClassName } from "../lib/task-meta";
import {
  ArrowDownToLine,
  Ellipsis,
  RotateCw,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Progress } from "@/shared/ui/progress";
import { TaskTypeIcon } from "./TaskTypeIcon";

interface TaskRowProps {
  task: GenerationTask;
  queuePosition?: number;
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
}

const statusLabels: Record<TaskStatus, string> = {
  queued: "В очереди",
  running: "Идёт",
  done: "Готово",
  failed: "Ошибка",
  canceled: "Отменено",
};

const statusBadgeStyles: Record<TaskStatus, { backgroundColor: string; color: string }> = {
  running: { backgroundColor: "#3A1A0A", color: "#FF7A3D" },
  queued: { backgroundColor: "#1A1514", color: "#8A7F78" },
  done: { backgroundColor: "#10B98122", color: "#34D399" },
  failed: { backgroundColor: "#FF5A5A1F", color: "#FF6B6B" },
  canceled: { backgroundColor: "#FF5A5A1F", color: "#FF6B6B" },
};

const statusBadgeClassName =
  "inline-flex h-[26px] shrink-0 items-center justify-center rounded-[8px] px-[10px] py-[5px] font-sans text-xs font-medium leading-none tracking-normal";

const iconButtonClassName =
  "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-[#1A1514] bg-[#1A1514]";

interface TaskActionIcon {
  Icon: LucideIcon;
  color: string;
  label: string;
  onClick?: () => void;
}

function getTaskActionIcon(
  status: TaskStatus,
  onCancel: () => void,
  onRetry: () => void,
): TaskActionIcon {
  if (status === "done") {
    return {
      Icon: ArrowDownToLine,
      color: "#FF7A3D",
      label: "Скачать",
    };
  }

  if (status === "queued" || status === "running") {
    return {
      Icon: X,
      color: "#8A7F78",
      label: "Отменить",
      onClick: onCancel,
    };
  }

  return {
    Icon: RotateCw,
    color: "#FF7A3D",
    label: "Повторить",
    onClick: onRetry,
  };
}

interface TaskActionButtonsProps {
  actionIcon: TaskActionIcon;
}

function TaskActionButtons({ actionIcon }: TaskActionButtonsProps) {
  const ActionIcon = actionIcon.Icon;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        className={iconButtonClassName}
        aria-label={actionIcon.label}
        onClick={actionIcon.onClick}
      >
        <ActionIcon className="size-4" style={{ color: actionIcon.color }} />
      </button>

      <button
        type="button"
        className={iconButtonClassName}
        aria-label="Дополнительные действия"
      >
        <Ellipsis className="size-4 text-muted-foreground" />
      </button>
    </div>
  );
}

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return (
    <span className={statusBadgeClassName} style={statusBadgeStyles[status]}>
      {statusLabels[status]}
    </span>
  );
}

interface TaskModelMetaProps {
  modelLabel: string;
  secondaryLabel: string;
}

function TaskModelMeta({ modelLabel, secondaryLabel }: TaskModelMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#1A1514] px-2.5 py-1.5">
        <span className="size-1.5 shrink-0 rounded-full bg-[#E85420]" aria-hidden />
        <span className="truncate font-mono text-xs font-normal leading-none text-foreground/90">
          {modelLabel}
        </span>
      </div>
      <span className={metaSecondaryClassName}>{secondaryLabel}</span>
    </div>
  );
}

export function TaskRow({ task, queuePosition, onCancel, onRetry }: TaskRowProps) {
  const isRunning = task.status === "running";
  const secondaryLabel = getTaskSecondaryLabel(task, queuePosition);
  const actionIcon = getTaskActionIcon(
    task.status,
    () => onCancel(task.id),
    () => onRetry(task.id),
  );

  return (
    <li className="rounded-[16px] border border-[var(--era-generation-border)] bg-card p-4">
      {/* Mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-start gap-3">
          <TaskTypeIcon type={task.type} />
          <div className="min-w-0 flex-1 flex flex-col gap-2">
            <p className="line-clamp-2 text-[15px] font-medium leading-none text-foreground">
              {task.prompt}
            </p>
            <TaskModelMeta modelLabel={task.modelLabel} secondaryLabel={secondaryLabel} />
          </div>
        </div>

        {isRunning && <Progress value={task.progress} className="h-1.5" />}

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <TaskStatusBadge status={task.status} />
            {isRunning && (
              <span className="font-mono text-sm tabular-nums leading-none text-[#FF7A3D]">
                {task.progress}%
              </span>
            )}
          </div>
          <TaskActionButtons actionIcon={actionIcon} />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden items-center gap-3 md:flex">
        <TaskTypeIcon type={task.type} />

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[15px] font-medium leading-none text-foreground">
            {task.prompt}
          </p>

          <div className="mt-2">
            <TaskModelMeta modelLabel={task.modelLabel} secondaryLabel={secondaryLabel} />
          </div>

          {isRunning && (
            <div className="mt-3">
              <Progress value={task.progress} className="h-1.5" />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-center gap-3 self-center">
          {isRunning && (
            <span className="w-10 text-right font-mono text-sm tabular-nums text-[#FF7A3D]">
              {task.progress}%
            </span>
          )}

          <TaskStatusBadge status={task.status} />
          <TaskActionButtons actionIcon={actionIcon} />
        </div>
      </div>
    </li>
  );
}
