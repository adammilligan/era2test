import { useEffect, useState } from "react";

export const WORKSPACE_INPUT_STACK_SELECTOR = "[data-era-workspace-input-stack]";

const MOBILE_MAX_WIDTH_PX = 480;
const WIDGET_GAP_PX = 8;

export function useWorkspaceInputStackOffset(isEnabled: boolean, pathname: string): number | null {
  const [offset, setOffset] = useState<number | null>(null);

  useEffect(() => {
    if (!isEnabled || typeof window === "undefined") {
      setOffset(null);
      return;
    }

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`);

    const updateOffset = () => {
      if (!mediaQuery.matches) {
        setOffset(null);
        return;
      }

      const inputStack = document.querySelector(WORKSPACE_INPUT_STACK_SELECTOR);
      if (!inputStack) {
        setOffset(null);
        return;
      }

      const { height } = inputStack.getBoundingClientRect();
      setOffset(Math.ceil(height) + WIDGET_GAP_PX);
    };

    updateOffset();

    const inputStack = document.querySelector(WORKSPACE_INPUT_STACK_SELECTOR);
    const resizeObserver = inputStack ? new ResizeObserver(updateOffset) : null;

    if (inputStack && resizeObserver) {
      resizeObserver.observe(inputStack);
    }

    window.addEventListener("resize", updateOffset);
    mediaQuery.addEventListener("change", updateOffset);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateOffset);
      mediaQuery.removeEventListener("change", updateOffset);
    };
  }, [isEnabled, pathname]);

  return offset;
}
