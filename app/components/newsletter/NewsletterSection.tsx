import { getTranslations } from "next-intl/server";

import { SectionHeader } from "../ui/SectionHeader";

import { NewsletterSectionClient } from "./NewsletterSectionClient";

export async function NewsletterSection() {
  const t = await getTranslations("sections.newsletter");

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
