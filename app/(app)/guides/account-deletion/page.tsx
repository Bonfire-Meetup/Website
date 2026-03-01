import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { HowToPageShell } from "@/components/how-to/HowToPageShell";
import { ArrowRightIcon, MailIcon, TrashIcon } from "@/components/shared/Icons";
import { buildSimplePageMetadata } from "@/lib/metadata";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export default async function AccountDeletionGuidePage() {
  const t = await getTranslations("accountDeletionHowTo");
  const tHowToPage = await getTranslations("howToPage");

  return (
    <HowToPageShell
      allGuidesHref={PAGE_ROUTES.GUIDES}
      allGuidesLabel={tHowToPage("browseAllGuides")}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      heroLead={t("heroLead")}
      heroSublead={t("heroSublead")}
      heroWord="DELETE"
      subtitle={t("subtitle")}
      contentClassName="max-w-4xl"
    >
      <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/75 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="divide-y divide-neutral-200/80 dark:divide-white/10">
          <article className="px-5 py-7 sm:px-7 sm:py-8">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              <TrashIcon
                className="text-brand-600 dark:text-brand-300 h-5 w-5"
                aria-hidden="true"
              />
              {t("sections.flow.title")}
            </h2>
            <ol className="space-y-3">
              {(["one", "two", "three", "four"] as const).map((item, index) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                  <span className="border-brand-300/40 text-brand-700 dark:border-brand-300/25 dark:text-brand-300 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {t(`sections.flow.items.${item}`)}
                  </span>
                </li>
              ))}
            </ol>
          </article>

          <article className="px-5 py-7 sm:px-7 sm:py-8">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              <MailIcon className="text-brand-600 dark:text-brand-300 h-5 w-5" aria-hidden="true" />
              {t("sections.code.title")}
            </h2>
            <ol className="space-y-3">
              {(["one", "two", "three"] as const).map((item, index) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                  <span className="border-brand-300/40 text-brand-700 dark:border-brand-300/25 dark:text-brand-300 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {t(`sections.code.items.${item}`)}
                  </span>
                </li>
              ))}
            </ol>
          </article>

          <article className="px-5 py-7 sm:px-7 sm:py-8">
            <h2 className="mb-4 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {t("sections.warning.title")}
            </h2>
            <ol className="space-y-3">
              {(["one", "two", "three"] as const).map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500 dark:bg-rose-300" />
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {t(`sections.warning.items.${item}`)}
                  </span>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </div>

      <section className="mt-8 rounded-3xl border border-rose-300/40 bg-gradient-to-br from-white/80 via-rose-50/50 to-white px-5 py-6 sm:px-7 sm:py-7 dark:border-rose-300/20 dark:from-white/8 dark:via-rose-500/10 dark:to-white/5">
        <div className="mt-1 flex flex-wrap gap-3">
          <Link
            href={PAGE_ROUTES.ME}
            className="bg-brand-600 hover:bg-brand-500 focus-visible:ring-brand-400 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-neutral-950"
          >
            {t("cta.account")}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={PAGE_ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-neutral-950"
          >
            {t("cta.login")}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </HowToPageShell>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "accountDeletionHowTo" });
}
