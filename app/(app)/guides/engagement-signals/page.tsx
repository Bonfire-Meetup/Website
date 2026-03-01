import type { Metadata } from "next";

import { buildSimplePageMetadata } from "@/lib/metadata";

import { EngagementSignalsContent } from "./EngagementSignalsContent";

export default function EngagementSignalsGuidePage() {
  return <EngagementSignalsContent />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "engagementSignalsGuide" });
}
