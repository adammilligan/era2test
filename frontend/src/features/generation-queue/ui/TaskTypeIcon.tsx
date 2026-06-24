import type { GenerationTask } from "@/entities/generation-task";
import { MessageCircleMore, Music, Play } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const accentColor = "#FF7A3D";
const mediaGradient = "linear-gradient(135deg, #3B1A0A 0%, #1A1614 70.72%)";
const accentSoftBackground = "var(--era-accent-soft, #3A1A0A)";

type TaskTypeIconSize = "default" | "compact";

const sizeStyles: Record<
  TaskTypeIconSize,
  { container: string; icon: string; imageGlyph: string }
> = {
  default: {
    container: "size-14 rounded-[12px]",
    icon: "size-5",
    imageGlyph: "text-[22px]",
  },
  compact: {
    container: "size-7 rounded-[6px]",
    icon: "size-3.5",
    imageGlyph: "text-[11px]",
  },
};

interface TaskTypeIconProps {
  type: GenerationTask["type"];
  size?: TaskTypeIconSize;
}

export function TaskTypeIcon({ type, size = "default" }: TaskTypeIconProps) {
  const styles = sizeStyles[size];
  const typeIconClassName = cn(
    "flex shrink-0 items-center justify-center",
    styles.container,
  );

  if (type === "image") {
    return (
      <div className={typeIconClassName} style={{ background: mediaGradient }}>
        <span className={cn("leading-none", styles.imageGlyph)} style={{ color: accentColor }} aria-hidden>
          ◐
        </span>
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className={typeIconClassName} style={{ background: mediaGradient }}>
        <Play className={styles.icon} style={{ color: accentColor }} fill={accentColor} />
      </div>
    );
  }

  if (type === "audio") {
    return (
      <div className={typeIconClassName} style={{ background: accentSoftBackground }}>
        <Music className={styles.icon} style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={typeIconClassName} style={{ background: accentSoftBackground }}>
      <MessageCircleMore className={styles.icon} style={{ color: accentColor }} />
    </div>
  );
}
