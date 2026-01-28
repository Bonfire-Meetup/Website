import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getInitialLocale } from "@/lib/i18n/initial";

import { LegalPageContent } from "./LegalPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getInitialLocale();
  const t = await getTranslations({ locale, namespace: "legal" });

  return {
    description: t("subtitle"),
    title: t("title"),
  };
}

export default function LegalPage() {
  return <LegalPageContent />;
}
