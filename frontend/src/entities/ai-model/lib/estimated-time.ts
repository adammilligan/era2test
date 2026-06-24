export interface EstimatedTimeSource {
  estimatedMinutes?: number;
  time?: string;
}

export function parseTimeLabelToMinutes(timeLabel: string): number {
  const secondsMatch = timeLabel.match(/(\d+)\s*сек/u);
  if (secondsMatch) {
    return Math.max(1, Math.ceil(Number(secondsMatch[1]) / 60));
  }

  const minutesMatch = timeLabel.match(/(\d+)\s*мин/u);
  if (minutesMatch) {
    return Math.max(1, Number(minutesMatch[1]));
  }

  return 1;
}

export function resolveEstimatedMinutes(source: EstimatedTimeSource): number {
  if (source.estimatedMinutes !== undefined) {
    return source.estimatedMinutes;
  }

  if (source.time) {
    return parseTimeLabelToMinutes(source.time);
  }

  return 1;
}

export function resolveEstimatedSeconds(
  source: EstimatedTimeSource & { estimatedSeconds?: number },
): number {
  if (source.estimatedSeconds !== undefined) {
    return source.estimatedSeconds;
  }

  if (source.time) {
    const secondsMatch = source.time.match(/(\d+)\s*сек/u);
    if (secondsMatch) {
      return Math.max(1, Number(secondsMatch[1]));
    }
  }

  return Math.max(1, resolveEstimatedMinutes(source) * 60);
}

export function formatEstimatedSeconds(seconds: number): string {
  if (seconds < 60) {
    return `≈ ${seconds} сек`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `≈ ${minutes} мин`;
}

export function formatRunningTaskMetaLabel(estimatedSeconds: number, credits: number): string {
  return `${formatEstimatedSeconds(estimatedSeconds)} · ${credits} cr`;
}
