import type { Metadata } from "next";

import { buildGuideMetadata, GuidePage } from "@/components/guides/GuidePage";

export default function SpeakingGuidePage() {
  return <GuidePage guide="speaking" />;
}

export function generateMetadata(): Promise<Metadata> {
  return buildGuideMetadata("speaking");
}
