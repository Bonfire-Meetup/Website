import type { ReactNode } from "react";

import { LocationPill } from "@/components/locations/LocationPill";
import { type LocationValue } from "@/lib/config/constants";

interface RecordingHeaderMetaRowProps {
  location: LocationValue;
  formattedDate: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  className?: string;
  leftGroupClassName?: string;
  metaGroupClassName?: string;
  locationHref?: string;
  locationSize?: "xxs" | "xs" | "sm" | "md";
  locationIcon?: ReactNode;
  locationClassName?: string;
  separator?: ReactNode;
  dateNode?: ReactNode;
  dateClassName?: string;
}

export function RecordingHeaderMetaRow({
  location,
  formattedDate,
  leftContent,
  rightContent,
  className = "",
  leftGroupClassName = "flex flex-wrap items-center gap-2",
  metaGroupClassName = "flex flex-wrap items-center gap-2",
  locationHref,
  locationSize = "sm",
  locationIcon,
  locationClassName,
  separator,
  dateNode,
  dateClassName,
}: RecordingHeaderMetaRowProps) {
  return (
    <div className={className}>
      <div className={leftGroupClassName}>
        {leftContent}
        <div className={metaGroupClassName}>
          <LocationPill
            location={location}
            href={locationHref}
            size={locationSize}
            icon={locationIcon}
            className={locationClassName}
          />
          {separator}
          {dateNode ?? <span className={dateClassName}>{formattedDate}</span>}
        </div>
      </div>
      {rightContent}
    </div>
  );
}
