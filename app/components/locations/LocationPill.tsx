import type { LocationValue } from "@/lib/config/constants";
import type { ReactNode } from "react";

import { Pill } from "../ui/Pill";

interface LocationPillProps {
  location: LocationValue;
  className?: string;
  ariaLabel?: string;
  icon?: ReactNode;
  size?: "xxs" | "xs" | "sm" | "md";
}

export function LocationPill({
  location,
  className = "",
  ariaLabel,
  icon,
  size = "sm",
}: LocationPillProps) {
  return (
    <Pill
      size={size}
      className={`location-badge ${location.toLowerCase()} ${className}`}
      aria-label={ariaLabel}
    >
      {icon}
      {location}
    </Pill>
  );
}
