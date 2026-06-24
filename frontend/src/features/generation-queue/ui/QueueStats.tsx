import type { QueueStats as QueueStatsData } from "../model/selectors";
import { cn } from "@/shared/lib/utils";

interface QueueStatsProps {
  stats: QueueStatsData;
}

const statItems: Array<{
  key: keyof QueueStatsData;
  label: string;
  dotColor: string;
}> = [
  { key: "queued", label: "В очереди", dotColor: "var(--queue-dot-queued)" },
  { key: "running", label: "Идёт", dotColor: "var(--queue-dot-running)" },
  { key: "done", label: "Готово", dotColor: "var(--queue-dot-done)" },
  { key: "failed", label: "Ошибка", dotColor: "var(--queue-dot-failed)" },
];

export function QueueStats({ stats }: QueueStatsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-[10px]",
        "md:grid-cols-4 md:gap-3",
      )}
    >
      {statItems.map((item) => (
        <div
          key={item.key}
          className={cn(
            "flex flex-col justify-center rounded-[16px] border border-border bg-card p-[14px] md:py-4 md:px-[18px]",
            "h-[82px] w-full max-w-[172px] justify-self-center",
            "md:h-[93px] md:w-[167px] md:max-w-none",
            "lg:w-[271px]",
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.dotColor }}
              aria-hidden="true"
            />
            <span className="text-[13px] leading-none text-muted-foreground">
              {item.label}
            </span>
          </div>
          <span
            className={cn(
              "mt-4 font-semibold tabular-nums leading-none text-foreground",
              "text-[24px]",
              "md:text-[28px]",
            )}
          >
            {stats[item.key]}
          </span>
        </div>
      ))}
    </div>
  );
}
