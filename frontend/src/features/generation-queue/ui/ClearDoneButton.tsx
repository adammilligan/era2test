import { cn } from "@/shared/lib/utils";

interface ClearDoneButtonProps {
  doneCount: number;
  onClear: () => void;
}

export function ClearDoneButton({ doneCount, onClear }: ClearDoneButtonProps) {
  const isDisabled = doneCount === 0;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClear}
      className={cn(
        "inline-flex h-10 w-[159px] shrink-0 items-center justify-center rounded-full border px-4",
        "font-sans text-sm font-medium leading-none transition-opacity",
        isDisabled
          ? "cursor-not-allowed border-border text-muted-foreground opacity-50"
          : "cursor-pointer border-border text-foreground hover:opacity-80",
      )}
    >
      Очистить готовые
    </button>
  );
}
