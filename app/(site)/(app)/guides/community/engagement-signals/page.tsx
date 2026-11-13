import type { Metadata } from "next";

import { buildGuideMetadata, GuidePage } from "@/components/guides/GuidePage";

export default function EngagementSignalsGuidePage() {
  return <GuidePage guide="engagementSignals" />;
}

export function generateMetadata(): Promise<Metadata> {
  return buildGuideMetadata("engagementSignals");
}
