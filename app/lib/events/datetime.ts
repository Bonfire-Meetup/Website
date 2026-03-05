export function isTbaDate(date: string | null | undefined): boolean {
  if (!date) {
    return false;
  }

  return date.trim().toUpperCase() === "TBA";
}

export function parseEventDateTimeParts(date: string, time: string) {
  if (isTbaDate(date)) {
    return null;
  }

  const [year, month, day] = date.split("-").map((part) => Number(part));
  if (!year || !month || !day) {
    return null;
  }

  const [hour, minute] = time.split(":").map((part) => Number(part));
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return { year, month, day, hour, minute };
}

export function parseEventDateTimeMs(date: string, time: string): number | null {
  const parts = parseEventDateTimeParts(date, time);
  if (!parts) {
    return null;
  }

  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
}
