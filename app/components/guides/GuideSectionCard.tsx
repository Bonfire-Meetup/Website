import type { ReactNode } from "react";

interface GuideSectionCardProps {
  children: ReactNode;
}

export function GuideSectionCard({ children }: GuideSectionCardProps) {
  return (
    <div className="surface overflow-hidden">
      <div className="divide-y divide-neutral-200/80 dark:divide-white/10">{children}</div>
    </div>
  );
}
