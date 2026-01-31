import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LegalPageContent } from "./LegalPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  const tCommon = await getTranslations("common");
  const brandName = tCommon("brandName");

  return {
    description: t("subtitle"),
    title: `${t("title")} | ${brandName}`,
  };
}

export default function LegalPage() {
  return <LegalPageContent />;
}
