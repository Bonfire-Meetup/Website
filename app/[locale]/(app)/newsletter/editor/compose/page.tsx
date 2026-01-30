"use client";

import type { RootState } from "@/lib/redux/store";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AccentBar } from "@/components/ui/AccentBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { USER_ROLES } from "@/lib/config/roles";
import { useAppSelector } from "@/lib/redux/hooks";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { NewsletterWizard } from "./NewsletterWizard";

export default function NewsletterEditorPage() {
  const t = useTranslations("newsletterEditor");
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth) as RootState["auth"];
  const [mounted, setMounted] = useState(false);

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

  if (!mounted || !auth.hydrated) {
    return (
      <main className="gradient-bg-static relative min-h-screen overflow-hidden px-2 pt-24 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <LoadingSpinner size="lg" className="text-fuchsia-600 dark:text-fuchsia-400" />
          </div>
        </div>
      </main>
    );
  }

  if (!isEditor) {
    return null;
  }

  return (
    <main className="gradient-bg-static relative min-h-screen overflow-hidden px-2 pt-24 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
        <div className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,var(--color-fire-mid-glow),transparent_62%)] opacity-40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-10 text-center sm:mb-12">
          <p className="text-brand-600 dark:text-brand-300 mb-6 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.4em] uppercase sm:gap-3 sm:text-sm sm:tracking-[0.5em]">
            <span className="to-brand-400 h-px w-8 bg-gradient-to-r from-transparent sm:w-12" />
            {t("eyebrow")}
            <span className="to-brand-400 h-px w-8 bg-gradient-to-l from-transparent sm:w-12" />
          </p>
          <div className="flex items-center justify-center gap-4">
            <AccentBar />
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
              {t("title")}
            </h1>
          </div>
        </div>

        <NewsletterWizard
          onComplete={() => {
            router.push(PAGE_ROUTES.ME);
          }}
        />
      </div>
    </main>
  );
}
