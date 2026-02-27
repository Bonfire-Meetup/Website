"use client";

import { useTranslations } from "next-intl";

export type AccessStatusKind = "public" | "earlyAccess" | "membersOnly";

interface AccessStatusPillProps {
  status: AccessStatusKind;
}

const ACCESS_STATUS_STYLES: Record<
  AccessStatusKind,
  { dotClassName: string; pillClassName: string }
> = {
  public: {
    dotClassName: "bg-emerald-500",
    pillClassName: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  earlyAccess: {
    dotClassName: "bg-orange-500",
    pillClassName: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  },
  membersOnly: {
    dotClassName: "bg-rose-500",
    pillClassName: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  },
};

export function AccessStatusPill({ status }: AccessStatusPillProps) {
  const t = useTranslations("recordings");
  const style = ACCESS_STATUS_STYLES[status];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase ${style.pillClassName}`}
    >
      <span className={`h-2 w-2 rounded-full ${style.dotClassName}`} />
      {t(status)}
    </div>
  );
}
