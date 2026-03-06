import type { EventItem } from "@/lib/events/types";

import { parseEventDateTimeMs } from "./datetime";

const QUESTION_OPEN_OFFSET_MS = 2 * 24 * 60 * 60 * 1000;
const QUESTION_CLOSE_OFFSET_MS = 24 * 60 * 60 * 1000;

export interface EventQuestionWindow {
  closesAt: string;
  isOpen: boolean;
}

export function getEventQuestionWindow(
  event: Pick<EventItem, "announcementStatus" | "announcedAt" | "date" | "time">,
): EventQuestionWindow | null {
  const eventStartMs = parseEventDateTimeMs(event.date, event.time);

  if (eventStartMs === null) {
    return null;
  }

  const nowMs = Date.now();
  const announcedAtMs = event.announcedAt ? Date.parse(event.announcedAt) : Number.NaN;
  const opensAtMs =
    event.announcementStatus === "full" && Number.isFinite(announcedAtMs)
      ? announcedAtMs
      : eventStartMs - QUESTION_OPEN_OFFSET_MS;
  const closesAtMs = eventStartMs + QUESTION_CLOSE_OFFSET_MS;

  return {
    closesAt: new Date(closesAtMs).toISOString(),
    isOpen: nowMs >= opensAtMs && nowMs <= closesAtMs,
  };
}
