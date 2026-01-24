import { useTranslations } from "next-intl";

export function GuildCard() {
  const t = useTranslations("account.guild");
  const perks = t.raw("perks") as string[];

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-red-300/60 bg-gradient-to-br from-red-50/60 via-white to-red-100/70 shadow-xl shadow-red-500/10 dark:border-red-500/20 dark:from-neutral-900 dark:via-neutral-900/95 dark:to-red-950/30 dark:shadow-red-500/10">
      <div className="relative h-full overflow-hidden px-6 py-6">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-gradient-to-br from-red-400/30 via-rose-300/25 to-transparent blur-2xl transition-all duration-500 group-hover:scale-110 dark:from-red-500/15 dark:via-rose-500/10" />
        <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-gradient-to-tr from-red-300/30 via-rose-200/25 to-transparent blur-2xl transition-all duration-500 group-hover:scale-110 dark:from-red-500/10 dark:via-rose-500/10" />
        <div className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-200 to-rose-200 shadow-md shadow-red-500/20 dark:from-red-500/20 dark:to-rose-500/20 dark:shadow-inner">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <div className="relative flex flex-col gap-3 pr-16">
          <div className="inline-flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.3em] text-red-600/90 uppercase dark:text-red-300/90">
              {t("kicker")}
            </span>
            <span className="rounded-full bg-red-200 px-2 py-0.5 text-[9px] font-bold tracking-wider text-red-800 uppercase dark:bg-red-500/20 dark:text-red-200">
              {t("soon")}
            </span>
          </div>
          <div className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
            {t("title")}
          </div>
          <div className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {t("body")}
          </div>
          <ul className="mt-2 space-y-2">
            {perks.map((perk) => (
              <li
                key={perk}
                className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400"
              >
                <svg
                  className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
