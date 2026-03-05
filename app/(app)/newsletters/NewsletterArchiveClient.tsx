"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

import { StaticPageHero } from "@/components/layout/StaticPageHero";
import { NewsletterSectionClient } from "@/components/newsletter/NewsletterSectionClient";
import { ArrowRightIcon } from "@/components/shared/Icons";
import { getValidAccessTokenAsync } from "@/lib/api/query-utils";
import { API_ROUTES } from "@/lib/api/routes";
import { USER_ROLES } from "@/lib/config/roles";
import type { ArchiveListItem } from "@/lib/data/newsletter-archive";
import { useIsRole } from "@/lib/redux/hooks/useIsRole";
import { createJsonAuthHeaders } from "@/lib/utils/http";
import { formatLongDateUTC } from "@/lib/utils/locale";
import { compressUuid } from "@/lib/utils/uuid-compress";

interface NewsletterArchiveClientProps {
  items: ArchiveListItem[];
}

function IssueRow({ item, issueNumber }: { item: ArchiveListItem; issueNumber?: number }) {
  const locale = useLocale();
  const t = useTranslations("sections.newsletterArchiveIndex");

  return (
    <Link
      href={`/newsletter/${compressUuid(item.id)}`}
      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50 sm:gap-5 sm:px-6 sm:py-5 dark:hover:bg-white/[0.03]"
    >
      <span className="w-7 shrink-0 font-mono text-xs font-bold text-neutral-300 tabular-nums dark:text-neutral-600">
        {issueNumber !== undefined ? String(issueNumber).padStart(2, "0") : "—"}
      </span>

      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.15em] text-neutral-400 uppercase dark:text-neutral-500">
          {formatLongDateUTC(item.sentAt, locale)}
          {item.testSend && (
            <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-bold tracking-normal text-amber-700 normal-case dark:bg-amber-500/20 dark:text-amber-400">
              {t("testBadge")}
            </span>
          )}
        </p>
        <h2 className="truncate text-sm font-bold tracking-tight text-neutral-900 transition-colors group-hover:text-rose-600 sm:text-base dark:text-white dark:group-hover:text-rose-400">
          {item.subject}
        </h2>
        {item.previewText && (
          <p className="mt-0.5 truncate text-xs text-neutral-500 sm:text-sm dark:text-neutral-400">
            {item.previewText}
          </p>
        )}
      </div>

      <ArrowRightIcon className="h-4 w-4 shrink-0 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-rose-500 dark:text-neutral-600 dark:group-hover:text-rose-400" />
    </Link>
  );
}

function IssueList({ items, total }: { items: ArchiveListItem[]; total: number }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {items.map((item, index) => (
          <IssueRow key={item.id} item={item} issueNumber={total - index} />
        ))}
      </div>
    </div>
  );
}

export function NewsletterArchiveClient({ items }: NewsletterArchiveClientProps) {
  const t = useTranslations("sections.newsletterArchiveIndex");
  const tNewsletter = useTranslations("sections.newsletter");
  const isEditor = useIsRole(USER_ROLES.EDITOR);
  const [testItems, setTestItems] = useState<ArchiveListItem[]>([]);

  useEffect(() => {
    if (!isEditor) {
      return;
    }
    const fetch_ = async () => {
      const token = await getValidAccessTokenAsync();
      if (!token) {
        return;
      }
      try {
        const res = await fetch(`${API_ROUTES.NEWSLETTER.LIST}?testSend=true`, {
          headers: createJsonAuthHeaders(token),
        });
        if (res.ok) {
          setTestItems((await res.json()) as ArchiveListItem[]);
        }
      } catch {
        // Ignore
      }
    };
    fetch_();
  }, [isEditor]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-1),transparent_60%)]" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,var(--color-rose-glow),transparent_60%)]" />
      </div>

      <StaticPageHero
        backgroundVariant="none"
        eyebrow={t("eyebrow")}
        eyebrowClassName="mb-4 flex items-center justify-center gap-3 text-xs font-bold tracking-[0.4em] text-rose-600 uppercase sm:text-sm sm:tracking-[0.5em] dark:text-rose-400"
        eyebrowLineClassName="to-rose-400"
        containerClassName="mx-auto max-w-3xl text-center"
        sectionPreset="compact"
        subtitle={t("subtitle")}
        subtitleClassName="mx-auto mt-4 max-w-lg text-neutral-500 dark:text-neutral-400"
        title={
          <h1 className="text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
            {t("title")}
          </h1>
        }
      />

      <section className="relative mx-auto max-w-2xl px-4 pb-24 sm:px-6">
        {items.length === 0 ? (
          <div className="glass-card no-hover-pop p-10 text-center">
            <p className="font-semibold text-neutral-900 dark:text-white">{t("empty")}</p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t("emptyHint")}</p>
          </div>
        ) : (
          <IssueList items={items} total={items.length} />
        )}

        {isEditor && testItems.length > 0 && (
          <div className="mt-8">
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold tracking-widest text-amber-700 uppercase dark:bg-amber-500/20 dark:text-amber-400">
                {t("testSendsLabel")}
              </span>
              <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            </div>
            <div className="overflow-hidden rounded-2xl ring-1 ring-amber-200 dark:ring-amber-500/20">
              <div className="divide-y divide-neutral-100 dark:divide-amber-500/10">
                {testItems.map((item) => (
                  <IssueRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-16">
          <div className="glass-card no-hover-pop overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-rose-600 via-orange-500 to-red-600" />
            <div className="p-8 text-center sm:p-10">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {tNewsletter("title")}
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                {tNewsletter("subtitle")}
              </p>
              <div className="mt-6">
                <NewsletterSectionClient />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
