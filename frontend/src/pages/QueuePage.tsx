import { useEffect } from "react";
import { useQueue } from "@/features/generation-queue";

const QueuePage = () => {
  const { tasks, stats, isInitializing } = useQueue();

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    console.log("[QueuePage] tasks:", tasks);
    console.log("[QueuePage] stats:", stats);
  }, [tasks, stats, isInitializing]);

  return (
    <div className="min-h-[calc(100vh-var(--header-height,64px))]">
      <div className="max-w-[1200px] mx-auto px-4 pt-6 pb-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Очередь генераций</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Все ваши задачи в реальном времени
        </p>
      </div>
    </div>
  );
};

export default QueuePage;
