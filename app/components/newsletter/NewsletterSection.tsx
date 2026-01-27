import type { Locale } from "@/lib/i18n/locales";
import { getTranslations } from "next-intl/server";

import { getRequestLocale } from "@/lib/i18n/request-locale";

import { SectionHeader } from "../ui/SectionHeader";

import { NewsletterSectionClient } from "./NewsletterSectionClient";

export async function NewsletterSection({ locale: localeProp }: { locale?: Locale } = {}) {
  const locale = localeProp ?? (await getRequestLocale());
  const t = await getTranslations({ locale, namespace: "sections.newsletter" });

  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          id="newsletter"
          title={t("title")}
          subtitle={t("subtitle")}
          className="mb-8"
        />
        <NewsletterSectionClient />
      </div>
    </section>
  );
}
