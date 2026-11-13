import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

import { getFormattedGuildTierPrices } from "@/lib/billing/pricing";
import { isGuildSubscriptionEnabled } from "@/lib/config/guild-subscription-feature";

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

export default async function GuildPage() {
  await headers();
  const isEnabled = isGuildSubscriptionEnabled();
  const prices = await getFormattedGuildTierPrices();

  return <GuildPageContent isEnabled={isEnabled} prices={prices} />;
}
