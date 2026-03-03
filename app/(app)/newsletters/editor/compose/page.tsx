"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { AccentBar } from "@/components/ui/AccentBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getValidAccessTokenAsync } from "@/lib/api/query-utils";
import { API_ROUTES } from "@/lib/api/routes";
import { USER_ROLES } from "@/lib/config/roles";
import { useAppSelector } from "@/lib/redux/hooks";
import type { RootState } from "@/lib/redux/store";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { createJsonAuthHeaders } from "@/lib/utils/http";

import { NewsletterWizard } from "./NewsletterWizard";
import type { NewsletterSection, NewsletterWizardData } from "./types";

function NewsletterEditorInner() {
  const t = useTranslations("newsletterEditor");
  const router = useRouter();
  const searchParams = useSearchParams();
  const resendSlug = searchParams.get("resend") ?? undefined;

  const auth = useAppSelector((state) => state.auth) as RootState["auth"];
  const [mounted, setMounted] = useState(false);
  const [resendData, setResendData] = useState<NewsletterWizardData | null>(null);
  const [resendError, setResendError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRoles = auth.user?.decodedToken?.rol ?? [];
  const isEditor = userRoles.includes(USER_ROLES.EDITOR);

  useEffect(() => {
    if (mounted && auth.hydrated && !isEditor) {
      router.replace(PAGE_ROUTES.ME);
    }
  }, [mounted, auth.hydrated, isEditor, router]);

  useEffect(() => {
    if (!resendSlug || !mounted || !auth.hydrated || !isEditor) {
      return;
    }

    (async () => {
      const token = await getValidAccessTokenAsync();
      if (!token) {
        setResendError(true);
        return;
      }

      const res = await fetch(API_ROUTES.NEWSLETTER.ITEM(resendSlug), {
        headers: createJsonAuthHeaders(token),
      });

      if (!res.ok) {
        setResendError(true);
        return;
      }

      const body = (await res.json()) as {
        subject: string;
        previewText: string;
        data: { sections?: unknown[] };
      };

      const rawSections = Array.isArray(body.data?.sections) ? body.data.sections : [];
      const sections = rawSections.filter(
        (s): s is NewsletterSection =>
          typeof s === "object" && s !== null && "id" in s && "title" in s && "text" in s,
      );
      const [primary, ...secondary] = sections;

      setResendData({
        subject: body.subject,
        previewText: body.previewText ?? "",
        primaryNews: primary ?? { id: "primary", title: "", text: "" },
        secondaryNews: secondary,
        audience: { type: "all", manualEmails: [] },
      });
    })();
  }, [resendSlug, mounted, auth.hydrated, isEditor]);

  // Show spinner while auth is initialising, or while resend data is being loaded.
  // Use `resendData === null && !resendError` so the wizard only mounts once data is ready
  // (avoids a race where mounted+hydrated flip true before the fetch effect fires).
  const isLoading =
    !mounted || !auth.hydrated || (Boolean(resendSlug) && resendData === null && !resendError);

  if (isLoading) {
    return (
      <main className="gradient-bg-static relative min-h-screen overflow-hidden px-2 pt-24 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
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
      <main className="gradient-bg-static relative min-h-screen overflow-hidden px-2 pt-24 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
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
    <main className="gradient-bg-static relative min-h-screen overflow-hidden px-2 pt-24 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
        <div className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,var(--color-fire-mid-glow),transparent_62%)] opacity-40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-10 text-center sm:mb-12">
          <p className="text-brand-600 dark:text-brand-300 mb-6 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.4em] uppercase sm:gap-3 sm:text-sm sm:tracking-[0.5em]">
            <span className="to-brand-400 h-px w-8 bg-gradient-to-r from-transparent sm:w-12" />
            {t("eyebrow")}
            <span className="to-brand-400 h-px w-8 bg-gradient-to-l from-transparent sm:w-12" />
          </p>
          <div className="flex items-center justify-center gap-4">
            <AccentBar />
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
              {resendSlug ? t("resendTitle") : t("title")}
            </h1>
          </div>
        </div>

        <NewsletterWizard resendSlug={resendSlug} resendData={resendData ?? undefined} />
      </div>
    </main>
  );
}

export default function NewsletterEditorPage() {
  return (
    <Suspense>
      <NewsletterEditorInner />
    </Suspense>
  );
}
