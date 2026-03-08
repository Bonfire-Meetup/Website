"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { StaticPageHero } from "@/components/layout/StaticPageHero";
import { ArrowRightIcon, MailIcon, TrashIcon } from "@/components/shared/Icons";
import { BackLink } from "@/components/ui/BackLink";
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

function titleSizeClass(subject: string): string {
  const len = subject.length;
  if (len <= 22) {
    return "text-4xl sm:text-5xl";
  }
  if (len <= 33) {
    return "text-3xl sm:text-4xl";
  }
  return "text-2xl sm:text-3xl";
}

function SectionDivider() {
  return (
    <div className="my-16 flex items-center justify-center gap-3">
      <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
      <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
      <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
    </div>
  );
}

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
    const fail = () => {
      setDeleteError(t("deleteError"));
      setDeleting(false);
    };
    try {
      const token = await getValidAccessTokenAsync();
      if (!token) {
        fail();
        return;
      }
      const res = await fetch(API_ROUTES.NEWSLETTER.ITEM(slug), {
        method: "DELETE",
        headers: createJsonAuthHeaders(token),
      });
      if (res.ok) {
        router.push(PAGE_ROUTES.NEWSLETTER_ARCHIVE);
      } else {
        fail();
      }
    } catch (err) {
      logWarn("newsletter.delete_failed", { error: String(err) });
      fail();
    }
  };

  const sentDate = formatLongDateUTC(newsletter.sentAt, locale);

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 px-4 pt-28 pb-24 sm:pt-32 dark:bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-1),transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
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
          <div className="mb-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <BackLink href={PAGE_ROUTES.NEWSLETTER_ARCHIVE}>{t("backToArchive")}</BackLink>
            {isEditor && (
              <div className="flex items-center gap-4">
                <Link
                  href={PAGE_ROUTES.NEWSLETTER_EDITOR_WITH_RESEND(slug)}
                  className="flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400"
                >
                  <MailIcon className="h-3.5 w-3.5" />
                  {t("resend")}
                </Link>
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  {t("delete")}
                </button>
              </div>
            )}
          </div>
        )}

        {newsletter.testSend && (
          <div className="mb-5 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
              {t("testBannerTitle")}
            </span>
          </div>
        )}

        <StaticPageHero
          backgroundVariant="none"
          containerClassName="mx-auto max-w-2xl text-center"
          eyebrow={t("eyebrow")}
          eyebrowClassName="mb-5 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.4em] text-rose-600 uppercase sm:gap-3 sm:text-sm sm:tracking-[0.5em] dark:text-rose-400"
          eyebrowLineClassName="to-rose-400"
          sectionPreset="detail"
          subtitle={
            <>
              {newsletter.previewText ? (
                <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {newsletter.previewText}
                </p>
              ) : null}
              <p className="mt-5 text-sm text-neutral-400 dark:text-neutral-500">
                {t("sentOn", { sentDate })}
              </p>
            </>
          }
          subtitleClassName=""
          title={
            <h1
              className={`font-black tracking-tighter text-balance text-neutral-900 dark:text-white ${titleSizeClass(newsletter.subject)}`}
            >
              {newsletter.subject}
            </h1>
          }
        />

        <article>
          {newsletter.sections.map((section, index) => (
            <div key={section.id}>
              {index > 0 && <SectionDivider />}

              <section>
                {section.imageUrl && (
                  <img
                    src={section.imageUrl}
                    alt={section.title}
                    className="mb-10 w-full rounded-2xl shadow-md shadow-neutral-900/10 dark:shadow-neutral-950/40"
                  />
                )}

                {index > 0 && (
                  <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-rose-500/60 uppercase dark:text-rose-400/50">
                    {t("updateLabel", { number: String(index).padStart(2, "0") })}
                  </p>
                )}

                <h2
                  className={
                    index === 0
                      ? "mb-6 text-2xl font-black tracking-tighter text-neutral-900 sm:text-3xl dark:text-white"
                      : "mb-5 text-xl font-black tracking-tighter text-neutral-900 sm:text-2xl dark:text-white"
                  }
                >
                  {section.title}
                </h2>

                <div
                  className="text-[17px] leading-[1.8] text-pretty text-neutral-700 sm:text-lg dark:text-neutral-200 [&_a]:!text-rose-600 [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-colors [&_a]:hover:!text-rose-500 dark:[&_a]:!text-rose-400 [&_p]:!mb-5 [&_p:last-child]:!mb-0 [&_strong]:font-semibold [&_strong]:!text-neutral-900 dark:[&_strong]:!text-white"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(section.text) }}
                />

                {section.ctaHref && section.ctaLabel && (
                  <div className="mt-8">
                    <a
                      href={section.ctaHref}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-orange-500 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-rose-500/25 transition-opacity hover:opacity-90"
                    >
                      {section.ctaLabel}
                      <ArrowRightIcon className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </section>
            </div>
          ))}
        </article>
      </div>
    </main>
  );
}
