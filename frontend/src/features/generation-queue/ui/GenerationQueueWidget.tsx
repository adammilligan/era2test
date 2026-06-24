import { createPortal } from "react-dom";
import { MoveRight, PieChart } from "lucide-react";
import { Link, useLocation } from "@/shared/routing";
import { cn } from "@/shared/lib/utils";
import type { GenerationTask } from "@/entities/generation-task";
import { Progress } from "@/shared/ui/progress";
import { useQueue } from "../model/useQueue";
import {
  getAverageActiveProgress,
  getRunningTaskCount,
  getWidgetPreviewTasks,
} from "../model/selectors";
import { useWorkspaceInputStackOffset } from "../model/useWorkspaceInputStackOffset";
import { TaskTypeIcon } from "./TaskTypeIcon";

const hiddenOnPaths = ["/queue", "/auth"];

const workspacePaths = ["/text", "/design", "/video", "/audio", "/create"];

function formatRunningCount(count: number): string {
  if (count === 1) {
    return "1 активна";
  }

  return `${count} активны`;
}

function getWidgetHeader(tasks: GenerationTask[], runningCount: number) {
  if (runningCount > 0) {
    return {
      title: runningCount === 1 ? "Генерация идёт" : "Генерации идут",
      subtitle: `${formatRunningCount(runningCount)} · ${getAverageActiveProgress(tasks)}%`,
      progress: getAverageActiveProgress(tasks),
    };
  }

  const queuedCount = tasks.filter((task) => task.status === "queued").length;

  return {
    title: "Генерации в очереди",
    subtitle: queuedCount === 1 ? "1 в очереди" : `${queuedCount} в очереди`,
    progress: 0,
  };
}

function getMobileBottomStyle(pathname: string, inputStackOffset: number | null): string {
  if (workspacePaths.includes(pathname)) {
    if (inputStackOffset !== null) {
      return `${inputStackOffset}px`;
    }

    return "240px";
  }

  return "calc(env(safe-area-inset-bottom) + 8px)";
}

interface WidgetTaskItemProps {
  task: GenerationTask;
}

function WidgetTaskItem({ task }: WidgetTaskItemProps) {
  const isQueued = task.status === "queued";

  return (
    <div className="flex items-start gap-2.5">
      <TaskTypeIcon type={task.type} size="compact" />

      <div className="min-w-0 flex-1">
        <p className="mb-1.5 truncate font-sans text-xs font-normal leading-none text-[#C8BEB6]">
          {task.prompt}
        </p>

        <div className="flex items-center gap-2">
          <Progress
            value={isQueued ? 0 : task.progress}
            className="h-1 flex-1 bg-[#1A1514] [&>div]:bg-[#FF7A3D]"
          />

          {isQueued ? (
            <span className="shrink-0 font-mono text-[11px] font-medium leading-none text-[#8A7F78]">
              в очереди
            </span>
          ) : (
            <span className="shrink-0 font-mono text-[11px] font-medium leading-none tabular-nums text-[#FF7A3D]">
              {task.progress}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function WidgetOpenQueueFooter({ hasActiveTasks }: { hasActiveTasks: boolean }) {
  return (
    <Link
      to="/queue"
      className={cn(
        "flex w-full items-center justify-center gap-1.5 px-3 py-3",
        "cursor-pointer font-sans text-[13px] font-medium leading-none text-[#FF7A3D]",
        "transition-opacity hover:opacity-80",
        hasActiveTasks && "border-t border-[var(--era-generation-border)]",
      )}
    >
      Открыть очередь
      <MoveRight className="size-4" aria-hidden />
    </Link>
  );
}

function WidgetPieChartIcon() {
  return (
    <PieChart
      className="size-[18px] shrink-0"
      style={{ color: "#E85420" }}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

interface WidgetActiveHeaderProps {
  title: string;
  subtitle: string;
}

function WidgetActiveHeader({ title, subtitle }: WidgetActiveHeaderProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <WidgetPieChartIcon />

      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-[13px] font-semibold leading-none text-foreground">
          {title}
        </p>
        <p className="mt-1 truncate font-mono text-[11px] font-normal leading-none text-muted-foreground">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

interface WidgetActiveSectionProps {
  tasks: GenerationTask[];
}

function WidgetActiveSection({ tasks }: WidgetActiveSectionProps) {
  const runningCount = getRunningTaskCount(tasks);
  const previewTasks = getWidgetPreviewTasks(tasks);
  const header = getWidgetHeader(tasks, runningCount);

  return (
    <div className="space-y-3">
      <WidgetActiveHeader title={header.title} subtitle={header.subtitle} />

      {previewTasks.length > 0 && (
        <div className="space-y-3">
          {previewTasks.map((task) => (
            <WidgetTaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

interface WidgetQueueLinkProps {
  className?: string;
  ariaLabel?: string;
}

function WidgetQueueLink({ className, ariaLabel = "Открыть очередь" }: WidgetQueueLinkProps) {
  return (
    <Link
      to="/queue"
      aria-label={ariaLabel}
      className={cn(
        "flex shrink-0 cursor-pointer items-center justify-center text-[#FF7A3D] transition-opacity hover:opacity-80",
        className,
      )}
    >
      <MoveRight className="size-4" aria-hidden />
    </Link>
  );
}

interface GenerationQueueWidgetMobileProps {
  pathname: string;
  tasks: GenerationTask[];
  hasActiveTasks: boolean;
}

function GenerationQueueWidgetMobile({
  pathname,
  tasks,
  hasActiveTasks,
}: GenerationQueueWidgetMobileProps) {
  const isWorkspace = workspacePaths.includes(pathname);
  const inputStackOffset = useWorkspaceInputStackOffset(isWorkspace, pathname);
  const header = hasActiveTasks ? getWidgetHeader(tasks, getRunningTaskCount(tasks)) : null;

  return (
    <aside
      className={cn(
        "pointer-events-auto fixed z-[10000] max-[480px]:block min-[481px]:hidden",
        "left-3 right-3 px-0",
      )}
      style={{ bottom: getMobileBottomStyle(pathname, inputStackOffset) }}
      aria-label="Статус генераций"
    >
      <div
        className={cn(
          "mx-auto w-full max-w-[390px]",
          "rounded-[18px] border border-[var(--era-generation-border)] bg-card",
          "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]",
          "overflow-hidden",
        )}
      >
        {hasActiveTasks && header ? (
          <div className="flex items-start gap-2 px-3 py-2.5">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <WidgetActiveHeader title={header.title} subtitle={header.subtitle} />

              <Progress
                value={header.progress}
                className="h-1 bg-[#1A1514] [&>div]:bg-[#FF7A3D]"
              />
            </div>

            <WidgetQueueLink className="w-8 shrink-0 self-center" />
          </div>
        ) : (
          <WidgetOpenQueueFooter hasActiveTasks={false} />
        )}
      </div>
    </aside>
  );
}

interface GenerationQueueWidgetDesktopProps {
  tasks: GenerationTask[];
  hasActiveTasks: boolean;
}

function GenerationQueueWidgetDesktop({ tasks, hasActiveTasks }: GenerationQueueWidgetDesktopProps) {
  return (
    <aside
      className={cn(
        "pointer-events-auto fixed z-[10000] hidden min-[481px]:block",
        "bottom-[calc(env(safe-area-inset-bottom)+24px)] right-6 w-[332px]",
      )}
      aria-label="Статус генераций"
    >
      <div
        className={cn(
          "rounded-[18px] border border-[var(--era-generation-border)] bg-card",
          "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]",
          "overflow-hidden",
        )}
      >
        {hasActiveTasks && (
          <div className="p-4">
            <WidgetActiveSection tasks={tasks} />
          </div>
        )}

        <WidgetOpenQueueFooter hasActiveTasks={hasActiveTasks} />
      </div>
    </aside>
  );
}

export function GenerationQueueWidget() {
  const { pathname } = useLocation();
  const { tasks, activeCount, isInitializing } = useQueue();

  if (hiddenOnPaths.includes(pathname) || isInitializing) {
    return null;
  }

  const hasActiveTasks = activeCount > 0;

  const widget = (
    <>
      <GenerationQueueWidgetMobile
        pathname={pathname}
        tasks={tasks}
        hasActiveTasks={hasActiveTasks}
      />
      <GenerationQueueWidgetDesktop tasks={tasks} hasActiveTasks={hasActiveTasks} />
    </>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(widget, document.body);
}
