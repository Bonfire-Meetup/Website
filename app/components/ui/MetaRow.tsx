import type { ReactNode } from "react";

interface MetaRowProps {
  icon: ReactNode;
  text: string;
  className?: string;
}

export function MetaRow({ icon, text, className = "" }: MetaRowProps) {
  return (
    <div
      className={`flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400 ${className}`}
    >
      <div className="meta-icon-container">{icon}</div>
      <span className="font-medium">{text}</span>
    </div>
  );
}
