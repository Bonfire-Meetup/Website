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
        <div className={guild.classes.iconContainer}>
          <GuildIcon className={guild.classes.icon} />
        </div>
        <div className="relative flex flex-col gap-4 pr-16">
          <div className="inline-flex flex-wrap items-center gap-2">
            <span className={guild.classes.kicker}>{t("kicker")}</span>
            <span className={guild.classes.soonBadge}>{t("soon")}</span>
          </div>
          <div className={`text-xl font-black tracking-tight ${guild.classes.infoBoxTitle}`}>
            {t("title")}
          </div>
          <div className="max-w-xl text-sm leading-relaxed text-red-700/90 dark:text-red-200/90">
            {t("body")}
          </div>
          <ul className="space-y-1.5">
            {perks.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-2.5 text-sm text-red-700 dark:text-red-200"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-200/80 bg-white/55 text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
                  <CheckIcon className="h-3 w-3" />
                </span>
                <span className="leading-5">{perk}</span>
              </li>
            ))}
          </ul>
          <div className="pt-1">
            <Link
              href={PAGE_ROUTES.GUILD}
              className="group inline-flex items-center gap-1.5 rounded-xl border border-red-300/70 bg-white/75 px-3.5 py-2 text-xs font-semibold text-red-700 shadow-sm shadow-red-100/50 transition hover:-translate-y-px hover:border-red-400/80 hover:bg-white/90 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200 dark:shadow-none dark:hover:border-red-300/40 dark:hover:bg-red-500/15"
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
