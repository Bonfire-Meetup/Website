import type { EventItem } from "@/lib/events/types";

import { parseEventDateTimeMs } from "./datetime";

const QUESTION_OPEN_OFFSET_MS = 2 * 24 * 60 * 60 * 1000;
const QUESTION_CLOSE_OFFSET_MS = 24 * 60 * 60 * 1000;

export interface EventQuestionWindow {
  opensAt: string;
  closesAt: string;
  isOpen: boolean;
}

export function getEventQuestionWindow(
  event: Pick<EventItem, "date" | "time">,
): EventQuestionWindow | null {
  const eventStartMs = parseEventDateTimeMs(event.date, event.time);

  if (eventStartMs === null) {
    return null;
  }

  const nowMs = Date.now();
  const opensAtMs = eventStartMs - QUESTION_OPEN_OFFSET_MS;
  const closesAtMs = eventStartMs + QUESTION_CLOSE_OFFSET_MS;

  return {
    opensAt: new Date(opensAtMs).toISOString(),
    closesAt: new Date(closesAtMs).toISOString(),
    isOpen: nowMs >= opensAtMs && nowMs <= closesAtMs,
  };
}
