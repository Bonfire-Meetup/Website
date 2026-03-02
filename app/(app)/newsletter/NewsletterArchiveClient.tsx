"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

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

const ACCENT = "bg-gradient-to-b from-rose-600 via-orange-500 to-red-600";

interface NewsletterArchiveClientProps {
  items: ArchiveListItem[];
}

function IssueCard({ item, label }: { item: ArchiveListItem; label: string }) {
  const locale = useLocale();
  const t = useTranslations("sections.newsletterArchiveIndex");

  return (
    <article className="glass-card no-hover-pop group flex overflow-hidden">
      <div className={`w-1 shrink-0 ${ACCENT}`} />
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-neutral-400 uppercase dark:text-neutral-500">
          <span>{label}</span>
          {item.testSend && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold tracking-widest text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
              {t("testBadge")}
            </span>
          )}
          <span className="mx-0.5 opacity-40">·</span>
          <span className="font-normal tracking-normal text-neutral-400 normal-case dark:text-neutral-500">
            {formatLongDateUTC(item.sentAt, locale)}
          </span>
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-neutral-900 sm:text-lg dark:text-white">
            {item.subject}
          </h2>
          {item.previewText && (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {item.previewText}
            </p>
          )}
        </div>

        <Link
          href={`/newsletter/${compressUuid(item.id)}`}
          className="flex w-fit items-center gap-1.5 text-sm font-semibold text-rose-600 transition-colors hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300"
        >
          {t("read")}
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

export function NewsletterArchiveClient({ items }: NewsletterArchiveClientProps) {
  const t = useTranslations("sections.newsletterArchiveIndex");
  const tNewsletter = useTranslations("sections.newsletter");
  const isEditor = useIsRole(USER_ROLES.EDITOR);
  const [testItems, setTestItems] = useState<ArchiveListItem[]>([]);
  const [hideTestSends, setHideTestSends] = useState(false);

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
        const res = await fetch(`${API_ROUTES.NEWSLETTER.ARCHIVE}?testSend=true`, {
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

      {/* Hero */}
      <section className="relative flex min-h-[44vh] items-center justify-center overflow-hidden px-4 pt-32 pb-12 sm:min-h-[50vh] sm:pb-16">
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none">
          <span className="text-outline block text-[22vw] leading-none font-black opacity-[0.03] sm:text-[16vw] dark:opacity-[0.02]">
            NEWS
          </span>
        </div>
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <p className="mb-4 flex items-center justify-center gap-3 text-xs font-bold tracking-[0.4em] text-rose-600 uppercase sm:text-sm sm:tracking-[0.5em] dark:text-rose-400">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-rose-400 sm:w-12" />
            {t("eyebrow")}
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-rose-400 sm:w-12" />
          </p>
          <h1 className="text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-neutral-500 dark:text-neutral-400">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="relative mx-auto max-w-2xl px-4 pb-24 sm:px-6">
        {items.length === 0 ? (
          <div className="glass-card no-hover-pop p-10 text-center">
            <p className="font-semibold text-neutral-900 dark:text-white">{t("empty")}</p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t("emptyHint")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <IssueCard
                key={item.id}
                item={item}
                label={t("updateLabel", { number: (items.length - index).toString() })}
              />
            ))}
          </div>
        )}

        {isEditor && testItems.length > 0 && (
          <div className="mt-10 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase dark:text-neutral-500">
                {t("testSendsLabel")}
              </p>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <input
                  type="checkbox"
                  checked={hideTestSends}
                  onChange={(e) => setHideTestSends(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-neutral-300 accent-rose-600 dark:border-neutral-600 dark:accent-rose-500"
                />
                {t("hideTestSends")}
              </label>
            </div>
            {!hideTestSends && (
              <div className="flex flex-col gap-3">
                {testItems.map((item, index) => (
                  <IssueCard
                    key={item.id}
                    item={item}
                    label={t("updateLabel", { number: (testItems.length - index).toString() })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Subscribe CTA */}
        <div className="mt-16">
          <div className="glass-card no-hover-pop overflow-hidden">
            <div className={`h-1 w-full ${ACCENT}`} />
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
