import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import type { QueueStats, QueueStatusFilter, SortOrder } from "../model/selectors";

interface QueueToolbarProps {
  value: QueueStatusFilter;
  onChange: (value: QueueStatusFilter) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
  stats: QueueStats;
  totalCount: number;
}

const filterOptions: Array<{ value: QueueStatusFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "queued", label: "В очереди" },
  { value: "running", label: "Идёт" },
  { value: "done", label: "Готово" },
  { value: "failed", label: "Ошибка" },
];

const sortOptions: Array<{ value: SortOrder; label: string }> = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "progress", label: "По прогрессу" },
  { value: "status", label: "По статусу" },
];

function getFilterCount(
  filter: QueueStatusFilter,
  stats: QueueStats,
  totalCount: number,
): number {
  if (filter === "all") {
    return totalCount;
  }

  return stats[filter];
}

const sortTriggerClassName =
  "bg-secondary text-muted-foreground hover:text-foreground h-9 px-3.5 rounded-full text-sm font-medium border-0 shadow-none focus:ring-0 w-auto gap-1.5 transition-colors [&>svg]:opacity-60 [&>svg]:h-3.5 [&>svg]:w-3.5";

export function QueueToolbar({
  value,
  onChange,
  sortOrder,
  onSortOrderChange,
  stats,
  totalCount,
}: QueueToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-[34px]">
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map((option) => {
          const isActive = option.value === value;
          const count = getFilterCount(option.value, stats, totalCount);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={
                isActive
                  ? "gradient-accent text-white h-9 px-3.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 transition-all shadow-[0_8px_22px_-12px_rgba(232,84,32,0.55)]"
                  : "bg-secondary text-muted-foreground hover:text-foreground h-9 px-3.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
              }
            >
              {option.label}
              <span
                className={
                  isActive
                    ? "text-white/80 font-mono text-[11px]"
                    : "text-muted-foreground/70 font-mono text-[11px]"
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <Select value={sortOrder} onValueChange={onSortOrderChange}>
        <SelectTrigger className={sortTriggerClassName}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
