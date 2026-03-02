"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ArrowLeftIcon, ArrowRightIcon, TrashIcon } from "@/components/shared/Icons";
import { getValidAccessTokenAsync } from "@/lib/api/query-utils";
import { API_ROUTES } from "@/lib/api/routes";
import { USER_ROLES } from "@/lib/config/roles";
import { useIsRole } from "@/lib/redux/hooks/useIsRole";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import type { NewsletterSection } from "@/lib/types/newsletter";
import { createJsonAuthHeaders } from "@/lib/utils/http";
import { formatLongDateUTC } from "@/lib/utils/locale";
import { logWarn } from "@/lib/utils/log-client";
import { renderMarkdownToHtml } from "@/lib/utils/newsletter-markdown";

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

export function NewsletterArchiveContent({ newsletter, slug }: NewsletterArchiveContentProps) {
  const t = useTranslations("sections.newsletterArchive");
  const locale = useLocale();
  const router = useRouter();
  const isEditor = useIsRole(USER_ROLES.EDITOR);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = await getValidAccessTokenAsync();
      if (!token) {
        setDeleteError(t("deleteError"));
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
        setDeleteError(t("deleteError"));
        setDeleting(false);
      }
    } catch (err) {
      logWarn("newsletter.delete_failed", { error: String(err) });
      setDeleteError(t("deleteError"));
      setDeleting(false);
    }
  };

  const sentDate = formatLongDateUTC(newsletter.sentAt, locale);

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 px-4 pt-32 pb-24 dark:bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-1),transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        {/* Top bar */}
        {confirmingDelete ? (
          <div className="mb-10 rounded-xl bg-rose-50 p-4 ring-1 ring-rose-200 dark:bg-rose-950/30 dark:ring-rose-800">
            <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
              {t("deleteConfirmTitle")}
            </p>
            <p className="mt-1 text-xs text-rose-600/80 dark:text-rose-400">
              {t("deleteConfirmMessage")}
            </p>
            {deleteError && (
              <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                {deleteError}
              </p>
            )}
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => {
                  setConfirmingDelete(false);
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 disabled:opacity-50 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                {t("deleteCancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? t("deleting") : t("deleteConfirm")}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link
              href={PAGE_ROUTES.NEWSLETTER_ARCHIVE}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {t("backToArchive")}
            </Link>
            {isEditor && (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                {t("delete")}
              </button>
            )}
          </div>
        )}

        {/* Header */}
        <header className="mb-12">
          {newsletter.testSend && (
            <div className="mb-5 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                {t("testBannerTitle")}
              </span>
            </div>
          )}

          <p className="mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.4em] text-rose-600 uppercase sm:gap-3 sm:text-sm sm:tracking-[0.5em] dark:text-rose-400">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-rose-400 sm:w-10" />
            {t("eyebrow")}
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-rose-400 sm:w-10" />
          </p>

          <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
            {newsletter.subject}
          </h1>

          {newsletter.previewText && (
            <p className="mt-3 text-lg leading-relaxed text-neutral-500 dark:text-neutral-400">
              {newsletter.previewText}
            </p>
          )}

          <p className="mt-4 text-sm text-neutral-400 dark:text-neutral-500">
            {t("sentOn", { sentDate })}
          </p>
        </header>

        {/* Article body */}
        <article>
          {newsletter.sections.map((section, index) => (
            <section
              key={section.id}
              className={
                index > 0
                  ? "mt-12 border-t border-neutral-200 pt-12 dark:border-neutral-800"
                  : undefined
              }
            >
              {section.imageUrl && (
                <img
                  src={section.imageUrl}
                  alt={section.title}
                  className="mb-8 w-full rounded-2xl"
                />
              )}

              {index > 0 && (
                <p className="mb-2 text-[11px] font-bold tracking-[0.2em] text-neutral-400 uppercase dark:text-neutral-500">
                  {t("updateLabel", { number: String(index).padStart(2, "0") })}
                </p>
              )}

              <h2
                className={
                  index === 0
                    ? "mb-5 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
                    : "mb-4 text-xl font-black tracking-tight text-neutral-900 sm:text-2xl dark:text-white"
                }
              >
                {section.title}
              </h2>

              <div
                className="text-base leading-relaxed text-neutral-600 dark:text-neutral-300 [&_a]:!text-rose-600 [&_a]:underline [&_a]:transition-colors [&_a]:hover:!text-rose-500 dark:[&_a]:!text-rose-400 [&_p]:mb-4 [&_p:last-child]:mb-0"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(section.text) }}
              />

              {section.ctaHref && section.ctaLabel && (
                <div className="mt-6">
                  <a
                    href={section.ctaHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-orange-500 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-rose-500/20 transition-opacity hover:opacity-90"
                  >
                    {section.ctaLabel}
                    <ArrowRightIcon className="h-4 w-4" />
                  </a>
                </div>
              )}
            </section>
          ))}
        </article>

        {/* Bottom nav */}
        <div className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <Link
            href={PAGE_ROUTES.NEWSLETTER_ARCHIVE}
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {t("backToArchive")}
          </Link>
        </div>
      </div>
    </main>
  );
}
