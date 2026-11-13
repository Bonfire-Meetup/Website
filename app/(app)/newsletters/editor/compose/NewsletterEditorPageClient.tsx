"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useEffect, useState } from "react";

import { StaticPageHero } from "@/components/layout/StaticPageHero";
import { AccentBar } from "@/components/ui/AccentBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useNewsletterDetail } from "@/lib/api/newsletters";
import { USER_ROLES } from "@/lib/config/roles";
import type { NewsletterDetail } from "@/lib/data/newsletter-archive";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectAuthRoles } from "@/lib/redux/selectors/authSelectors";
import type { RootState } from "@/lib/redux/store";
import { newsletterEditorQueryParsers } from "@/lib/routes/app-search-params-client";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { NewsletterWizard } from "./NewsletterWizard";
import type { NewsletterWizardData } from "./types";

function toWizardData(detail: NewsletterDetail): NewsletterWizardData {
  const [primary, ...secondary] = detail.sections;

  return {
    audience: { manualEmails: [], type: "all" },
    previewText: detail.previewText,
    primaryNews: primary ?? { id: "primary", text: "", title: "" },
    secondaryNews: secondary,
    subject: detail.subject,
  };
}

export function NewsletterEditorPageClient() {
  const t = useTranslations("newsletterEditor");
  const router = useRouter();
  const [{ resend }] = useQueryStates(newsletterEditorQueryParsers);
  const resendSlug = resend ?? undefined;

  const auth = useAppSelector((state) => state.auth) as RootState["auth"];
  const userRoles = useAppSelector(selectAuthRoles);
  const [mounted, setMounted] = useState(false);
  const resendQuery = useNewsletterDetail(resendSlug);
  const resendError = Boolean(resendSlug) && resendQuery.isError;
  const resendData = resendQuery.data ? toWizardData(resendQuery.data) : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEditor = userRoles.includes(USER_ROLES.EDITOR);

  useEffect(() => {
    if (mounted && auth.hydrated && !isEditor) {
      router.replace(PAGE_ROUTES.ME);
    }
  }, [mounted, auth.hydrated, isEditor, router]);

  const isLoading =
    !mounted || !auth.hydrated || (Boolean(resendSlug) && resendData === null && !resendError);

  if (isLoading) {
    return (
      <main className="gradient-bg-static relative min-h-screen overflow-hidden px-2 pt-28 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <LoadingSpinner size="lg" className="text-rose-600 dark:text-rose-400" />
          </div>
        </div>
      </main>
    );
  }

  if (!isEditor) {
    return null;
  }

  if (resendError) {
    return (
      <main className="gradient-bg-static relative min-h-screen overflow-hidden px-2 pt-28 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">{t("resendLoadError")}</p>
            <Link
              href={
                resendSlug ? PAGE_ROUTES.NEWSLETTER(resendSlug) : PAGE_ROUTES.NEWSLETTER_ARCHIVE
              }
              className="text-sm font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300"
            >
              {t("resendLoadErrorBack")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="gradient-bg-static relative min-h-screen overflow-hidden px-2 pt-28 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
        <div className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,var(--color-fire-mid-glow),transparent_62%)] opacity-40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <StaticPageHero
          backgroundVariant="none"
          containerClassName="mx-auto max-w-5xl text-center"
          eyebrow={t("eyebrow")}
          sectionPreset="inline"
          title={
            <div className="flex items-center justify-center gap-4">
              <AccentBar />
              <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
                {resendSlug ? t("resendTitle") : t("title")}
              </h1>
            </div>
          }
        />

        <NewsletterWizard resendSlug={resendSlug} resendData={resendData ?? undefined} />
      </div>
    </main>
  );
}
