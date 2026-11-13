import type { Metadata } from "next";

import { buildGuideMetadata, GuidePage } from "@/components/guides/GuidePage";

export default function RegistrationGuidePage() {
  return <GuidePage guide="registration" />;
}

export function generateMetadata(): Promise<Metadata> {
  return buildGuideMetadata("registration");
}
