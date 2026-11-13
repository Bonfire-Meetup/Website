import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

import { getFormattedGuildTierPrices } from "@/lib/billing/pricing";
import { isGuildSubscriptionEnabled } from "@/lib/config/guild-subscription-feature";

import { GuildJoinPage } from "./GuildJoinPage";

export async function generateMetadata(): Promise<Metadata> {
  const [t, tCommon] = await Promise.all([
    getTranslations("account.guild"),
    getTranslations("common"),
  ]);
  const brandName = tCommon("brandName");

  return {
    title: `${t("join.title")} | ${brandName}`,
  };
}

export default async function MeGuildPage() {
  await headers();
  const isEnabled = isGuildSubscriptionEnabled();
  const prices = await getFormattedGuildTierPrices();

  return <GuildJoinPage isEnabled={isEnabled} prices={prices} />;
}
