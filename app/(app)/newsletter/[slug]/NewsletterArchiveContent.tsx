"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { NewsletterSectionCard } from "@/components/newsletter/NewsletterSectionCard";
import { AccentBar } from "@/components/ui/AccentBar";
import { Button } from "@/components/ui/Button";
import { getValidAccessTokenAsync } from "@/lib/api/query-utils";
import { API_ROUTES } from "@/lib/api/routes";
import { USER_ROLES } from "@/lib/config/roles";
import { useIsRole } from "@/lib/redux/hooks/useIsRole";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import type { NewsletterSection } from "@/lib/types/newsletter";
import { createJsonAuthHeaders } from "@/lib/utils/http";
import { formatLongDateUTC } from "@/lib/utils/locale";
import { logWarn } from "@/lib/utils/log-client";

export type { NewsletterSection };

export interface NewsletterArchiveData {
  subject: string;
  previewText: string | null;
  testSend: boolean;
  sentAt: string;
  sections: NewsletterSection[];
}

interface NewsletterArchiveContentProps {
  newsletter: NewsletterArchiveData;
  slug: string;
}

function DeleteButton({ slug }: { slug: string }) {
  const t = useTranslations("sections.newsletterArchive");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const token = await getValidAccessTokenAsync();
      if (!token) {
        setError(t("deleteError"));
        setDeleting(false);
        return;
      }
      const res = await fetch(API_ROUTES.NEWSLETTER.ARCHIVE_ITEM(slug), {
        method: "DELETE",
        headers: createJsonAuthHeaders(token),
      });
      if (res.ok) {
        router.push(PAGE_ROUTES.NEWSLETTER_ARCHIVE);
      } else {
        setError(t("deleteError"));
        setDeleting(false);
      }
    } catch (err) {
      logWarn("newsletter.delete_failed", { error: String(err) });
      setError(t("deleteError"));
      setDeleting(false);
    }
  };

  if (confirming) {
    return (
      <div className="rounded-2xl border-2 border-rose-400 bg-rose-50 p-6 dark:border-rose-600 dark:bg-rose-950/30">
        <p className="font-semibold text-rose-800 dark:text-rose-200">{t("deleteConfirmTitle")}</p>
        <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">{t("deleteConfirmMessage")}</p>
        {error && (
          <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>
        )}
        <div className="mt-4 flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(false)}
            disabled={deleting}
          >
            {t("deleteCancel")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="bg-rose-700 hover:bg-rose-800"
          >
            {deleting ? t("deleting") : t("deleteConfirm")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <Button variant="glass-secondary" size="sm" onClick={() => setConfirming(true)}>
        {t("delete")}
      </Button>
    </div>
  );
}

export function NewsletterArchiveContent({ newsletter, slug }: NewsletterArchiveContentProps) {
  const t = useTranslations("sections.newsletterArchive");
  const locale = useLocale();
  const sentDate = formatLongDateUTC(newsletter.sentAt, locale);
  const isEditor = useIsRole(USER_ROLES.EDITOR);

  return (
    <main className="gradient-bg-static relative min-h-screen overflow-hidden px-4 pt-32 pb-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
        <div className="absolute top-1/2 left-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,var(--color-fire-glow-light-mid),transparent_62%)] opacity-30 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        {newsletter.testSend && (
          <div className="mb-8 rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 text-center dark:border-amber-600 dark:bg-amber-950/30">
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              {t("testBannerTitle")}
            </p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              {t("testBannerMessage")}
            </p>
          </div>
        )}

        {isEditor && (
          <div className="mb-8">
            <DeleteButton slug={slug} />
          </div>
        )}

        <div className="mb-12 text-center">
          <p className="text-brand-600 dark:text-brand-300 mb-6 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.4em] uppercase sm:gap-3 sm:text-sm sm:tracking-[0.5em]">
            <span className="to-brand-400 h-px w-8 bg-gradient-to-r from-transparent sm:w-12" />
            {t("eyebrow")}
            <span className="to-brand-400 h-px w-8 bg-gradient-to-l from-transparent sm:w-12" />
          </p>
          <div className="mb-4 flex items-center justify-center gap-4">
            <AccentBar />
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
              {newsletter.subject}
            </h1>
          </div>
          {newsletter.previewText && (
            <p className="mx-auto max-w-xl text-neutral-600 dark:text-neutral-400">
              {newsletter.previewText}
            </p>
          )}
        </div>

        <div className="space-y-8">
          {newsletter.sections.map((section, index) => (
            <NewsletterSectionCard
              key={section.id}
              section={section}
              secondaryLabel={
                index > 0 ? t("updateLabel", { number: String(index).padStart(2, "0") }) : undefined
              }
              variant="display"
            />
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t("sentOn", { sentDate })}
          </p>
          <Button href={PAGE_ROUTES.NEWSLETTER_ARCHIVE} variant="glass-secondary" size="sm">
            {t("backToArchive")}
          </Button>
        </div>
      </div>
    </main>
  );
}
