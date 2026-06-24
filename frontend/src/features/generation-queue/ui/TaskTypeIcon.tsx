import type { GenerationTask } from "@/entities/generation-task";
import { MessageCircleMore, Music, Play } from "lucide-react";

const typeIconClassName = "flex size-14 shrink-0 items-center justify-center rounded-[12px]";
const iconClassName = "size-5";
const accentColor = "#FF7A3D";
const mediaGradient = "linear-gradient(135deg, #3B1A0A 0%, #1A1614 70.72%)";
const accentSoftBackground = "var(--era-accent-soft, #3A1A0A)";

interface TaskTypeIconProps {
  type: GenerationTask["type"];
}

export function TaskTypeIcon({ type }: TaskTypeIconProps) {
  if (type === "image") {
    return (
      <div className={typeIconClassName} style={{ background: mediaGradient }}>
        <span className="text-[22px] leading-none" style={{ color: accentColor }} aria-hidden>
          ◐
        </span>
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className={typeIconClassName} style={{ background: mediaGradient }}>
        <Play className={iconClassName} style={{ color: accentColor }} fill={accentColor} />
      </div>
    );
  }

  if (type === "audio") {
    return (
      <div className={typeIconClassName} style={{ background: accentSoftBackground }}>
        <Music className={iconClassName} style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={typeIconClassName} style={{ background: accentSoftBackground }}>
      <MessageCircleMore className={iconClassName} style={{ color: accentColor }} />
    </div>
  );
}
