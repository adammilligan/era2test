export const WORKSPACE_PATHS = ["/text", "/design", "/video", "/audio", "/create"] as const;

const MOBILE_WIDGET_FALLBACK_OFFSET_PX = 240;
const MOBILE_WIDGET_DEFAULT_OFFSET = "calc(env(safe-area-inset-bottom) + 8px)";

export function getMobileBottomStyle(pathname: string, inputStackOffset: number | null): string {
  if (WORKSPACE_PATHS.includes(pathname as (typeof WORKSPACE_PATHS)[number])) {
    if (inputStackOffset !== null) {
      return `${inputStackOffset}px`;
    }

    return `${MOBILE_WIDGET_FALLBACK_OFFSET_PX}px`;
  }

  return MOBILE_WIDGET_DEFAULT_OFFSET;
}
