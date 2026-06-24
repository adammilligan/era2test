import { useMemo, useState } from "react";

import {
  filterTasksByStatus,
  getQueuedTaskPositions,
  QueueStatsBar,
  QueueToolbar,
  sortTasks,
  TaskList,
  useQueue,
  type QueueStatusFilter,
  type SortOrder,
} from "@/features/generation-queue";

const QueuePage = () => {
  const { tasks, stats, cancelTask, retryTask } = useQueue();
  const [statusFilter, setStatusFilter] = useState<QueueStatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const queuePositions = useMemo(() => getQueuedTaskPositions(tasks), [tasks]);

  const filteredTasks = useMemo(
    () => sortTasks(filterTasksByStatus(tasks, statusFilter), sortOrder),
    [tasks, statusFilter, sortOrder],
  );

  return (
    <div className="min-h-[calc(100vh-var(--header-height,64px))]">
      <div className="max-w-[1200px] mx-auto px-4 pt-6 pb-4 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Очередь генераций</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Все ваши задачи в реальном времени
          </p>
        </div>

        <QueueStatsBar stats={stats} />

        <QueueToolbar
          value={statusFilter}
          onChange={setStatusFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          stats={stats}
          totalCount={tasks.length}
        />

        <TaskList
          tasks={filteredTasks}
          queuePositions={queuePositions}
          onCancel={cancelTask}
          onRetry={retryTask}
        />
      </div>
    </div>
  );
};

export default QueuePage;
