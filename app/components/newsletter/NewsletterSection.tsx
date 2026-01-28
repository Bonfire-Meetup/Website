"use client";

import { useTranslations } from "next-intl";

import { SectionHeader } from "../ui/SectionHeader";

import { NewsletterSectionClient } from "./NewsletterSectionClient";

export function NewsletterSection() {
  const t = useTranslations("sections.newsletter");

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
