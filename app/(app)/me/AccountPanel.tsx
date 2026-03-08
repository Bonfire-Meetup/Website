"use client";

import type { ReactNode } from "react";

function joinClasses(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface AccountPanelProps {
  action?: ReactNode;
  children: ReactNode;
  title: ReactNode;
}

export function AccountPanel({ action, children, title }: AccountPanelProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-linear-to-br from-white via-white to-neutral-50/80 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)] dark:border-white/10 dark:from-white/8 dark:via-white/5 dark:to-white/[0.03] dark:shadow-none">
      <div className="flex min-h-14 items-center justify-between gap-3 border-b border-neutral-200/70 bg-white/75 px-4 py-3 backdrop-blur-sm dark:border-white/8 dark:bg-white/[0.03]">
        <div className="min-w-0 flex-1">{title}</div>
        {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

interface AccountPanelScrollAreaProps {
  children: ReactNode;
  className?: string;
}

export function AccountPanelScrollArea({ children, className }: AccountPanelScrollAreaProps) {
  return (
    <div
      className={joinClasses(
        "-mx-4 max-h-[240px] overflow-y-auto overscroll-contain px-4 py-1 sm:max-h-[280px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface AccountPanelRowProps {
  children: ReactNode;
  className?: string;
}

export function AccountPanelRow({ children, className }: AccountPanelRowProps) {
  return (
    <div
      className={joinClasses(
        "flex items-center justify-between gap-3 rounded-xl border border-neutral-200/70 bg-white/85 px-3 py-2.5 shadow-sm shadow-neutral-200/35 transition dark:border-white/8 dark:bg-white/6 dark:shadow-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
