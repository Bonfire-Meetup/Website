"use client";

import type { RootState } from "@/lib/redux/store";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      <main className="gradient-bg-static min-h-screen px-2 pt-24 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
        <div className="mx-auto max-w-3xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-violet-600" />
          </div>
        </div>
      </main>
    );
  }

  if (!isEditor) {
    return null;
  }

  return (
    <main className="gradient-bg-static min-h-screen px-2 pt-24 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            {t("title")}
          </h1>
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
