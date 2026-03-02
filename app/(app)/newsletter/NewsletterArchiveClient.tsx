"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { NewsletterSectionClient } from "@/components/newsletter/NewsletterSectionClient";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
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

export function NewsletterArchiveClient({ items }: NewsletterArchiveClientProps) {
  const t = useTranslations("sections.newsletterArchiveIndex");
  const tNewsletter = useTranslations("sections.newsletter");
  const locale = useLocale();
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

  const renderItem = (item: ArchiveListItem, index: number, total: number) => {
    const updateNumber = total - index;
    return (
      <Card key={item.id} className="no-hover-pop p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
          <span>{t("updateLabel", { number: updateNumber.toString() })}</span>
          {item.testSend && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-widest text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
              {t("testBadge")}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl dark:text-white">
              {item.subject}
            </h2>
            {item.previewText && (
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {item.previewText}
              </p>
            )}
            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">
              {t("sentLabel", { date: formatLongDateUTC(item.sentAt, locale) })}
            </p>
          </div>

          <Button
            href={`/newsletter/${compressUuid(item.id)}`}
            size="sm"
            className="h-10 w-full shrink-0 bg-neutral-900 text-white hover:bg-neutral-800 sm:w-auto dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {t("read")}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <main className="gradient-bg min-h-screen px-4 pt-28 pb-24 sm:pt-32">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 sm:gap-12">
        <SectionHeader title={t("title")} subtitle={t("subtitle")} className="mb-0" />

        {items.length === 0 ? (
          <Card className="p-10 text-center">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{t("empty")}</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{t("emptyHint")}</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-5">
            {items.map((item, index) => renderItem(item, index, items.length))}
          </div>
        )}

        {isEditor && testItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold tracking-[0.2em] text-neutral-400 uppercase dark:text-neutral-500">
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
              <div className="grid gap-4 sm:gap-5">
                {testItems.map((item, index) => renderItem(item, index, testItems.length))}
              </div>
            )}
          </div>
        )}

        <div className="py-6 sm:py-10">
          <SectionHeader
            title={tNewsletter("title")}
            subtitle={tNewsletter("subtitle")}
            className="mb-8"
          />
          <div className="mx-auto max-w-3xl">
            <NewsletterSectionClient />
          </div>
        </div>
      </section>
    </main>
  );
}
