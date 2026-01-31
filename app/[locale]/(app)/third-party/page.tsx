import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ThirdPartyPageContent } from "./ThirdPartyPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("attributions");
  const tCommon = await getTranslations("common");
  const brandName = tCommon("brandName");

  return {
    description: t("subtitle"),
    title: `${t("title")} | ${brandName}`,
  };
}

export default function ThirdPartyPage() {
  return <ThirdPartyPageContent />;
}
