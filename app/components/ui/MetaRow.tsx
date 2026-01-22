import type { ReactNode } from "react";

type MetaRowProps = {
  icon: ReactNode;
  text: string;
  className?: string;
};

export function MetaRow({ icon, text, className = "" }: MetaRowProps) {
  return (
    <div
      className={`flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400 ${className}`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100/80 dark:bg-brand-500/10">
        {icon}
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}
