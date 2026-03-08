import { useTranslations } from "next-intl";

import { ArrowRightIcon, CheckIcon, GuildIcon } from "@/components/shared/Icons";
import { Link } from "@/i18n/navigation";
import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export function GuildCard() {
  const t = useTranslations("account.guild");
  const perks = t.raw("perks") as string[];
  const { guild } = ENGAGEMENT_BRANDING;

  return (
    <div className={guild.classes.card}>
      <div className="relative h-full overflow-hidden px-6 py-6">
        <div className={guild.classes.blurTopRight} />
        <div className={guild.classes.blurBottomLeft} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 overflow-hidden opacity-95">
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-amber-200/35 via-orange-200/12 to-transparent dark:from-amber-500/12 dark:via-orange-500/8 dark:to-transparent" />
          <div className="guild-fireplace-compact">
            <div className="guild-flame guild-flame-compact-4" />
            <div className="guild-flame guild-flame-compact-2" />
            <div className="guild-flame guild-flame-compact-1" />
            <div className="guild-flame guild-flame-compact-3" />
            <div className="guild-flame guild-flame-compact-5" />
            <div className="guild-flame guild-flame-compact-core" />
            <div className="guild-flame-tongue guild-flame-tongue-compact-1" />
            <div className="guild-flame-tongue guild-flame-tongue-compact-2" />
            <div className="guild-flame-tongue guild-flame-tongue-compact-3" />
          </div>
        </div>
        <div className={guild.classes.iconContainer}>
          <GuildIcon className={guild.classes.icon} />
        </div>
        <div className="relative z-[2] flex flex-col gap-4 pr-16">
          <div className="inline-flex flex-wrap items-center gap-2">
            <span className={guild.classes.kicker}>{t("kicker")}</span>
            <span className="rounded-full bg-gradient-to-r from-amber-300/95 via-orange-300/92 to-rose-300/88 px-2 py-0.5 text-[9px] font-bold tracking-wider text-neutral-900 uppercase shadow-sm ring-1 shadow-orange-500/15 ring-white/55">
              {t("soon")}
            </span>
          </div>
          <div className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
            {t("title")}
          </div>
          <div className="max-w-xl text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {t("body")}
          </div>
          <ul className="space-y-1.5">
            {perks.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-200/80 bg-white/60 text-amber-600 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300">
                  <CheckIcon className="h-3 w-3" />
                </span>
                <span className="leading-5">{perk}</span>
              </li>
            ))}
          </ul>
          <div className="pt-1">
            <Link
              href={PAGE_ROUTES.GUILD}
              className="group inline-flex items-center gap-1.5 rounded-xl border border-amber-300/70 bg-white/75 px-3.5 py-2 text-xs font-semibold text-amber-800 shadow-sm shadow-orange-100/50 transition hover:-translate-y-px hover:border-orange-400/80 hover:bg-white/90 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200 dark:shadow-none dark:hover:border-amber-300/40 dark:hover:bg-amber-500/15"
            >
              {t("learnMore")}
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
