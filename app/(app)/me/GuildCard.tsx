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
        <div className="relative flex flex-col gap-3 pr-16">
          <div className="inline-flex items-center gap-2">
            <span className={guild.classes.kicker}>{t("kicker")}</span>
            <span className={guild.classes.soonBadge}>{t("soon")}</span>
          </div>
          <div className={`text-xl font-black tracking-tight ${guild.classes.infoBoxTitle}`}>
            {t("title")}
          </div>
          <div className="text-sm leading-relaxed text-red-700 dark:text-red-200">{t("body")}</div>
          <ul className="mt-2 space-y-2">
            {perks.map((perk) => (
              <li
                key={perk}
                className="flex items-center gap-2 text-sm text-red-700 dark:text-red-200"
              >
                <CheckIcon className={guild.classes.checkmark} />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
          <div className="pt-1">
            <Link
              href={PAGE_ROUTES.GUILD}
              className="group inline-flex items-center gap-1.5 rounded-lg border border-red-300/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:border-red-400/80 hover:bg-white/90 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-300/40 dark:hover:bg-red-500/15"
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
