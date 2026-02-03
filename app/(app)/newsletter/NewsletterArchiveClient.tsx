"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { NewsletterSectionClient } from "@/components/newsletter/NewsletterSectionClient";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatLongDateUTC } from "@/lib/utils/locale";
import { compressUuid } from "@/lib/utils/uuid-compress";

interface NewsletterArchiveItem {
  id: string;
  subject: string;
  previewText: string | null;
  sentAt: string;
}

interface NewsletterArchiveClientProps {
  items: NewsletterArchiveItem[];
}

export function NewsletterArchiveClient({ items }: NewsletterArchiveClientProps) {
  const t = useTranslations("sections.newsletterArchiveIndex");
  const tNewsletter = useTranslations("sections.newsletter");
  const locale = useLocale();

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
            {items.map((item, index) => {
              const updateNumber = items.length - index;
              return (
                <Card key={item.id} className="no-hover-pop p-5 sm:p-7">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
                    <span>{t("updateLabel", { number: updateNumber.toString() })}</span>
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
                      asChild
                      size="sm"
                      className="h-10 w-full shrink-0 bg-neutral-900 text-white hover:bg-neutral-800 sm:w-auto dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                      <Link href={`/newsletter/${compressUuid(item.id)}`}>{t("read")}</Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
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
