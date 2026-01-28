"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import {
  DiscordIcon,
  FacebookIcon,
  GitHubIcon,
  MailIcon,
  YouTubeIcon,
} from "@/components/shared/icons";
import { WEBSITE_URLS } from "@/lib/config/constants";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export function Footer() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");

  return (
    <footer className="glass relative mt-auto overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <p className="text-lg font-bold text-neutral-900 dark:text-white">
              {t("brandName", { brandName: tCommon("brandName") })}
            </p>
            <p className="text-center text-xs text-neutral-500 md:text-left dark:text-neutral-400">
              {t("vibes")}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 md:items-end">
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${WEBSITE_URLS.CONTACT_EMAIL}`}
                className="hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-500/15 dark:hover:text-brand-300 flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100/80 text-neutral-500 transition-all duration-300 hover:scale-105 dark:bg-white/5"
                aria-label={t("emailLabel")}
              >
                <MailIcon className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/playlist?list=PL5JjhpXFzfZp51YDuRgc9w6JVJUM9EQaN"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100/80 text-neutral-500 transition-all duration-300 hover:scale-105 hover:bg-red-100 hover:text-red-600 dark:bg-white/5 dark:hover:bg-red-500/15 dark:hover:text-red-400"
                aria-label={t("youtubeLabel")}
              >
                <YouTubeIcon className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/bonfire.meetup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100/80 text-neutral-500 transition-all duration-300 hover:scale-105 hover:bg-blue-100 hover:text-blue-600 dark:bg-white/5 dark:hover:bg-blue-500/15 dark:hover:text-blue-400"
                aria-label={t("facebookLabel")}
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="https://discord.com/invite/8Tqm7vAd4h"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100/80 text-neutral-500 transition-all duration-300 hover:scale-105 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-white/5 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-400"
                aria-label={t("discordLabel")}
              >
                <DiscordIcon className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/Bonfire-Meetup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100/80 text-neutral-500 transition-all duration-300 hover:scale-105 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={t("githubLabel")}
              >
                <GitHubIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-4 text-center text-xs text-neutral-500 sm:flex-row sm:text-left dark:border-white/10 dark:text-neutral-500">
          <p>
            {t("copyright", {
              brandName: tCommon("brandName"),
              year: new Date().getFullYear(),
            })}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={PAGE_ROUTES.TIMELINE}
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-300"
            >
              {t("timelineLabel")}
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <Link
              href={PAGE_ROUTES.FAQ}
              prefetch={false}
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-300"
            >
              {t("faqLabel")}
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <Link
              href={PAGE_ROUTES.PRESS}
              prefetch={false}
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-300"
            >
              {t("pressLabel")}
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <Link
              href={PAGE_ROUTES.LEGAL}
              prefetch={false}
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-300"
            >
              {t("legalLabel")}
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <Link
              href={PAGE_ROUTES.THIRD_PARTY}
              prefetch={false}
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-300"
            >
              {t("attributionsLabel")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
