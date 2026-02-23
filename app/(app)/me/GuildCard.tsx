import { useTranslations } from "next-intl";

import { CheckIcon, GuildIcon } from "@/components/shared/Icons";
import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";

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
                <CheckIcon className={guild.classes.checkmark} />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
