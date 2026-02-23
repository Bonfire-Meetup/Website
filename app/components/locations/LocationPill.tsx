import type { LocationValue } from "@/lib/config/constants";
import type { MouseEvent, ReactNode } from "react";

import { Pill } from "../ui/Pill";

interface LocationPillProps {
  location: LocationValue;
  className?: string;
  ariaLabel?: string;
  icon?: ReactNode;
  size?: "xxs" | "xs" | "sm" | "md";
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => void;
  title?: string;
}

export function LocationPill({
  location,
  className = "",
  ariaLabel,
  icon,
  size = "sm",
  href,
  onClick,
  title,
}: LocationPillProps) {
  return (
    <Pill
      href={href}
      onClick={onClick}
      size={size}
      className={`location-badge ${location.toLowerCase()} ${className}`}
      aria-label={ariaLabel}
      title={title}
    >
      {icon}
      {location}
    </Pill>
  );
}
