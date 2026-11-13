import type { Metadata } from "next";

import { buildGuideMetadata, GuidePage } from "@/components/guides/GuidePage";

export default function ProfilePrivacyGuidePage() {
  return <GuidePage guide="profilePrivacy" />;
}

export function generateMetadata(): Promise<Metadata> {
  return buildGuideMetadata("profilePrivacy");
}
