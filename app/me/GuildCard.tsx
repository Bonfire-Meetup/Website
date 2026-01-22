import { useTranslations } from "next-intl";

export function GuildCard() {
  const t = useTranslations("account.guild");
  const perks = t.raw("perks") as string[];
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-violet-200/50 bg-gradient-to-br from-white via-white to-violet-50/80 shadow-lg shadow-violet-500/5 dark:border-violet-500/20 dark:from-neutral-900 dark:via-neutral-900/95 dark:to-violet-950/30 dark:shadow-violet-500/10">
      <div className="relative h-full overflow-hidden px-6 py-6">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br from-violet-400/20 via-purple-300/15 to-transparent blur-2xl transition-all duration-500 group-hover:scale-110 dark:from-violet-500/15 dark:via-purple-500/10" />
        <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-gradient-to-tr from-indigo-300/20 via-violet-200/15 to-transparent blur-2xl transition-all duration-500 group-hover:scale-110 dark:from-indigo-500/10 dark:via-violet-500/10" />
        <div className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 shadow-inner dark:from-violet-500/20 dark:to-purple-500/20">
          <svg
            className="h-6 w-6 text-violet-600 dark:text-violet-300"
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
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-600/90 dark:text-violet-300/90">
              {t("kicker")}
            </span>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
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
                  className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400"
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
