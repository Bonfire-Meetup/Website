import type { LocationValue } from "@/lib/config/constants";
import { getEventLocationTheme } from "@/lib/events/theme";

interface DateTileProps {
  /** Small line under the day, e.g. the year or "Jul 2026". */
  bottom?: string;
  className?: string;
  date?: string;
  day: string;
  location: LocationValue;
  /** Small line above the day, e.g. the month or the weekday. */
  top?: string;
  /** `solid` fills with the chapter colour; `plain` is a quiet tile with a colour dot. */
  variant?: "plain" | "solid";
}

export function DateTile({
  bottom,
  className = "",
  date,
  day,
  location,
  top,
  variant = "solid",
}: DateTileProps) {
  const theme = getEventLocationTheme(location);
  const isSolid = variant === "solid";

  return (
    <time
      dateTime={date}
      className={`relative flex h-fit flex-col items-center gap-1 rounded-2xl px-3.5 py-3 text-center ${
        isSolid ? `text-white shadow-lg ${theme.tile}` : "surface"
      } ${className}`}
    >
      {!isSolid && (
        <span
          aria-hidden="true"
          className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: theme.color }}
        />
      )}
      {top && (
        <span
          className={`text-2xs leading-none font-bold tracking-wider uppercase ${
            isSolid ? "" : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {top}
        </span>
      )}
      <span
        className={`leading-none font-black ${
          isSolid ? "text-3xl" : "text-2xl text-neutral-900 dark:text-white"
        }`}
      >
        {day}
      </span>
      {bottom && (
        <span
          className={`text-2xs leading-none font-medium ${
            isSolid ? "opacity-80" : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {bottom}
        </span>
      )}
    </time>
  );
}
