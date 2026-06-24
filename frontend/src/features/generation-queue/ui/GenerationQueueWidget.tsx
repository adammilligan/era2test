import { Layers, MoveRight } from "lucide-react";
import { Link, useLocation } from "@/shared/routing";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const hiddenOnPaths = ["/queue", "/auth"];

export function GenerationQueueWidget() {
  const { pathname } = useLocation();

  if (hiddenOnPaths.includes(pathname)) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed z-50",
        "bottom-[calc(env(safe-area-inset-bottom)+12px)] left-3 right-3",
        "min-[481px]:bottom-[calc(env(safe-area-inset-bottom)+24px)] min-[481px]:left-auto min-[481px]:right-6 min-[481px]:w-[332px]",
      )}
      aria-label="Статус генераций"
    >
      <div
        className={cn(
          "rounded-2xl border border-border bg-card",
          "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]",
          "p-4",
        )}
      >
        <Button variant="default" size="default" className="w-full" asChild>
          <Link to="/queue">
            <Layers className="size-4" />
            Открыть очередь
            <MoveRight className="size-4" />
          </Link>
        </Button>
      </div>
    </aside>
  );
}
