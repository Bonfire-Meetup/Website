import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getInitialLocale } from "@/lib/i18n/initial";

import { ThirdPartyPageContent } from "./ThirdPartyPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getInitialLocale();
  const t = await getTranslations({ locale, namespace: "attributions" });

  return {
    description: t("subtitle"),
    title: t("title"),
  };
}

export default function ThirdPartyPage() {
  return <ThirdPartyPageContent />;
}
