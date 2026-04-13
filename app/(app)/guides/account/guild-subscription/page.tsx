import type { Metadata } from "next";

import { isGuildSubscriptionEnabled } from "@/lib/config/guild-subscription-feature";
import { buildSimplePageMetadata } from "@/lib/metadata";

import { GuildSubscriptionContent } from "./GuildSubscriptionContent";

export default function GuildSubscriptionGuidePage() {
  return <GuildSubscriptionContent subscriptionEnabled={isGuildSubscriptionEnabled()} />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "guildSubscriptionGuide" });
}
