import type { Metadata } from "next";

import { buildGuideMetadata, GuidePage } from "@/components/guides/GuidePage";

export default function AccountDeletionGuidePage() {
  return <GuidePage guide="accountDeletion" />;
}

export function generateMetadata(): Promise<Metadata> {
  return buildGuideMetadata("accountDeletion");
}
