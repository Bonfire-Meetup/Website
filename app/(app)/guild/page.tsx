import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { GuildPageContent } from "./GuildPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const [t, tCommon] = await Promise.all([getTranslations("guildPage"), getTranslations("common")]);
  const brandName = tCommon("brandName");

  return {
    title: `${t("meta.title")} | ${brandName}`,
    description: t("meta.description"),
    openGraph: {
      title: `${t("meta.title")} | ${brandName}`,
      description: t("meta.description"),
    },
  };
}

export default function GuildPage() {
  return <GuildPageContent />;
}
