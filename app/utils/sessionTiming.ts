/**
 * Utility functions for session durations and detecting ongoing sessions in F1
 */

export function getSessionDurationMs(sessionName: string): number {
  const l = sessionName.toLowerCase();
  if (l === "race") return 2 * 60 * 60 * 1000; // 2 hours
  if (l.includes("qualifying")) return 1.5 * 60 * 60 * 1000; // 90 minutes
  if (l.includes("sprint")) return 1 * 60 * 60 * 1000; // 60 minutes
  if (l.includes("practice")) return 1.25 * 60 * 60 * 1000; // 75 minutes
  return 2 * 60 * 60 * 1000; // default 2 hours
}

export interface SessionStatusCheck {
  isOngoing: boolean;
  isPast: boolean;
  isUpcoming: boolean;
  startTime: Date;
  endTime: Date;
}

export function checkSessionTiming(
  dateStr: string,
  sessionName: string,
  currentTime: Date = new Date()
): SessionStatusCheck {
  const startTime = new Date(dateStr);
  const durationMs = getSessionDurationMs(sessionName);
  const endTime = new Date(startTime.getTime() + durationMs);
  const currentMs = currentTime.getTime();

  const isOngoing = currentMs >= startTime.getTime() && currentMs <= endTime.getTime();
  const isPast = !isOngoing && currentMs > endTime.getTime();
  const isUpcoming = currentMs < startTime.getTime();

  return {
    isOngoing,
    isPast,
    isUpcoming,
    startTime,
    endTime,
  };
}
