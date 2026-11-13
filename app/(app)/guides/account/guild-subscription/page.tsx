import type { Metadata } from "next";

import { buildGuideMetadata, GuidePage } from "@/components/guides/GuidePage";

export default function GuildSubscriptionGuidePage() {
  return <GuidePage guide="guildSubscription" />;
}

export function generateMetadata(): Promise<Metadata> {
  return buildGuideMetadata("guildSubscription");
}
