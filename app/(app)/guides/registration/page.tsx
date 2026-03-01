import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { HowToPageShell } from "@/components/how-to/HowToPageShell";
import {
  ArrowRightIcon,
  FingerprintIcon,
  MailIcon,
  ShieldIcon,
  UserIcon,
} from "@/components/shared/Icons";
import { buildSimplePageMetadata } from "@/lib/metadata";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export default async function RegistrationHowToPage() {
  const t = await getTranslations("registrationHowTo");
  const tHowToPage = await getTranslations("howToPage");

  return (
    <HowToPageShell
      allGuidesHref={PAGE_ROUTES.GUIDES}
      allGuidesLabel={tHowToPage("browseAllGuides")}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      heroLead={t("heroLead")}
      heroSublead={t("heroSublead")}
      heroWord="SIGN-IN"
      subtitle={t("subtitle")}
      contentClassName="max-w-4xl"
    >
      <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/75 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="divide-y divide-neutral-200/80 dark:divide-white/10">
          <article className="px-5 py-7 sm:px-7 sm:py-8">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              <MailIcon className="text-brand-600 dark:text-brand-300 h-5 w-5" aria-hidden="true" />
              {t("sections.emailCode.title")}
            </h2>
            <ol className="space-y-3">
              {(["one", "two", "three", "four"] as const).map((item, index) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                  <span className="border-brand-300/40 text-brand-700 dark:border-brand-300/25 dark:text-brand-300 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {t(`sections.emailCode.items.${item}`)}
                  </span>
                </li>
              ))}
            </ol>
          </article>

          <article className="px-5 py-7 sm:px-7 sm:py-8">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              <UserIcon className="text-brand-600 dark:text-brand-300 h-5 w-5" aria-hidden="true" />
              {t("sections.registration.title")}
            </h2>
            <ol className="space-y-3">
              {(["one", "two", "three"] as const).map((item, index) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                  <span className="border-brand-300/40 text-brand-700 dark:border-brand-300/25 dark:text-brand-300 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {t(`sections.registration.items.${item}`)}
                  </span>
                </li>
              ))}
            </ol>
          </article>

          <article className="px-5 py-7 sm:px-7 sm:py-8">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              <FingerprintIcon
                className="text-brand-600 dark:text-brand-300 h-5 w-5"
                aria-hidden="true"
              />
              {t("sections.passkeys.title")}
            </h2>
            <ol className="space-y-3">
              {(["one", "two", "three"] as const).map((item, index) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                  <span className="border-brand-300/40 text-brand-700 dark:border-brand-300/25 dark:text-brand-300 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {t(`sections.passkeys.items.${item}`)}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-2xl border border-emerald-300/35 bg-emerald-50/70 p-4 dark:border-emerald-300/20 dark:bg-emerald-500/10">
              <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                <ShieldIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                {t("sections.passkeys.safety.title")}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {t("sections.passkeys.safety.description")}
              </p>
              <ul className="mt-3 space-y-2">
                {(["one", "two", "three"] as const).map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-300" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {t(`sections.passkeys.safety.items.${item}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>

      <section className="to-brand-100/30 dark:to-brand-500/10 mt-8 rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-white/85 via-white/65 px-5 py-6 sm:px-7 sm:py-7 dark:border-white/10 dark:from-white/8 dark:via-white/5">
        <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
          {t("notes.title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
          {t("notes.description")}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={PAGE_ROUTES.LOGIN}
            className="bg-brand-600 hover:bg-brand-500 focus-visible:ring-brand-400 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-neutral-950"
          >
            {t("cta.login")}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={PAGE_ROUTES.ME}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-neutral-950"
          >
            {t("cta.account")}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </HowToPageShell>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "registrationHowTo" });
}
