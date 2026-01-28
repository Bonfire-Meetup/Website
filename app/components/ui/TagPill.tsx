"use client";

import type { ReactNode } from "react";

import { Pill } from "./Pill";

interface TagPillProps {
  href: string;
  size?: "xxs" | "xs" | "sm" | "md";
  className?: string;
  children: ReactNode;
}

export function TagPill({ href, size, className, children }: TagPillProps) {
  return (
    <Pill
      href={href}
      size={size}
      className={className}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </Pill>
  );
}
