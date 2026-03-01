import type { ReactNode } from "react";

interface GuideSectionCardProps {
  children: ReactNode;
}

export function GuideSectionCard({ children }: GuideSectionCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/75 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="divide-y divide-neutral-200/80 dark:divide-white/10">{children}</div>
    </div>
  );
}
