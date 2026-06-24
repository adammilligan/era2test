import { describe, expect, it } from "vitest";

import {
  CANCELED_BY_USER_MESSAGE,
  formatDoneTaskMetaLabel,
  formatQueuedTaskMetaLabel,
  formatRunningTaskMetaLabel,
  getTaskSecondaryLabel,
} from "@/features/generation-queue/lib/task-meta";
import { createMockTask } from "../helpers/generation-task";

describe("task-meta", () => {
  it("formats running label in seconds", () => {
    expect(formatRunningTaskMetaLabel(30, 80)).toBe("≈ 30 сек · 80 cr");
  });

  it("formats running label in minutes", () => {
    expect(formatRunningTaskMetaLabel(120, 6)).toBe("≈ 2 мин · 6 cr");
  });

  it("formats done label", () => {
    expect(formatDoneTaskMetaLabel(12, 80)).toBe("Готово за 12 сек · 80 cr");
  });

  it("formats queued position label", () => {
    expect(formatQueuedTaskMetaLabel(3, 6)).toBe("Позиция 3 в очереди · 6 cr");
  });

  it("returns done label from estimatedSeconds", () => {
    const task = createMockTask({ status: "done", estimatedSeconds: 30, credits: 80 });

    expect(getTaskSecondaryLabel(task)).toBe("Готово за 30 сек · 80 cr");
  });

  it("returns running label from estimatedSeconds", () => {
    const task = createMockTask({ status: "running", estimatedSeconds: 30, credits: 80 });

    expect(getTaskSecondaryLabel(task)).toBe("≈ 30 сек · 80 cr");
  });

  it("returns queued position when position is provided", () => {
    const task = createMockTask({ status: "queued", credits: 6 });

    expect(getTaskSecondaryLabel(task, 3)).toBe("Позиция 3 в очереди · 6 cr");
  });

  it("returns cancel message", () => {
    const task = createMockTask({
      status: "canceled",
      errorMessage: CANCELED_BY_USER_MESSAGE,
    });

    expect(getTaskSecondaryLabel(task)).toBe("Отменено пользователем");
  });

  it("returns fail message", () => {
    const task = createMockTask({
      status: "failed",
      errorMessage: "Недостаточно кредитов",
    });

    expect(getTaskSecondaryLabel(task)).toBe("Недостаточно кредитов");
  });
});
