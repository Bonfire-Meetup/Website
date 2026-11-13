"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { StaticPageHero } from "@/components/layout/StaticPageHero";
import { AccentBar } from "@/components/ui/AccentBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { USER_ROLES } from "@/lib/config/roles";
import { useAppSelector } from "@/lib/redux/hooks";
import { useIsRole } from "@/lib/redux/hooks/useIsRole";
import { selectAuthRoles } from "@/lib/redux/selectors/authSelectors";
import { PAGE_ROUTES } from "@/lib/routes/pages";

const TABS = [
  { href: PAGE_ROUTES.ADMIN_SURVEY_RESPONSES, key: "surveys" },
  { href: PAGE_ROUTES.ADMIN_TALK_PROPOSALS, key: "talkProposals" },
  { href: PAGE_ROUTES.ADMIN_CONTACT_SUBMISSIONS, key: "contact" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const hasAdminRole = useAppSelector(selectAuthRoles).includes(USER_ROLES.ADMIN);
  const isAdmin = useIsRole(USER_ROLES.ADMIN);

  useEffect(() => {
    if (hydrated && !hasAdminRole) {
      router.replace(PAGE_ROUTES.ME);
    }
  }, [hydrated, hasAdminRole, router]);

  return (
    <main className="gradient-bg-static relative min-h-screen overflow-hidden px-2 pt-28 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {isAdmin ? (
          <>
            <StaticPageHero
              backgroundVariant="none"
              containerClassName="mx-auto max-w-6xl text-center"
              eyebrow={t("eyebrow")}
              sectionPreset="inline"
              subtitle={t("subtitle")}
              title={
                <div className="flex items-center justify-center gap-4">
                  <AccentBar />
                  <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
                    {t("title")}
                  </h1>
                </div>
              }
            />

            <nav
              aria-label={t("title")}
              className="surface mx-auto mb-8 flex w-full max-w-xl gap-1 overflow-x-auto p-1"
            >
              {TABS.map((tab) => {
                const isActive = pathname === tab.href;

                return (
                  <Link
                    key={tab.key}
                    href={tab.href}
                    prefetch={false}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex-1 rounded-xl px-3 py-2 text-center text-sm font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-sm"
                        : "text-neutral-600 hover:bg-rose-100/60 hover:text-rose-700 dark:text-neutral-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                    }`}
                  >
                    {t(`tabs.${tab.key}`)}
                  </Link>
                );
              })}
            </nav>

            {children}
          </>
        ) : (
          <div className="flex min-h-[400px] items-center justify-center">
            <LoadingSpinner size="lg" className="text-rose-600 dark:text-rose-400" />
          </div>
        )}
      </div>
    </main>
  );
}
