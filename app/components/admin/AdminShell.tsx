"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

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

export function AdminFrame({ activeHref, children }: { activeHref: string; children: ReactNode }) {
  const t = useTranslations("admin");

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-neutral-200 pb-5 lg:flex-row lg:items-end lg:justify-between dark:border-white/10">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.2em] text-orange-600 uppercase dark:text-orange-400">
            {t("eyebrow")}
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t("subtitle")}</p>
        </div>

        <nav
          aria-label={t("title")}
          className="flex w-full gap-1 overflow-x-auto rounded-xl bg-neutral-200/80 p-1 lg:w-auto dark:bg-white/8"
        >
          {TABS.map((tab) => {
            const isActive = activeHref === tab.href;

            return (
              <Link
                key={tab.key}
                href={tab.href}
                prefetch={false}
                aria-current={isActive ? "page" : undefined}
                className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-semibold whitespace-nowrap transition-colors lg:flex-none ${
                  isActive
                    ? "bg-white text-neutral-950 shadow-[0_1px_3px_rgba(15,23,42,0.16)] dark:bg-neutral-700 dark:text-white dark:shadow-none"
                    : "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                {t(`tabs.${tab.key}`)}
              </Link>
            );
          })}
        </nav>
      </header>

      {children}
    </>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
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
    <main className="relative min-h-screen bg-neutral-100 px-4 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl">
        {isAdmin ? (
          <AdminFrame activeHref={pathname}>{children}</AdminFrame>
        ) : (
          <div className="flex min-h-[400px] items-center justify-center">
            <LoadingSpinner size="lg" className="text-rose-600 dark:text-rose-400" />
          </div>
        )}
      </div>
    </main>
  );
}
