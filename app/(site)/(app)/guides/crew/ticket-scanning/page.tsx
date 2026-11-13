import type { Metadata } from "next";

import { buildGuideMetadata, GuidePage } from "@/components/guides/GuidePage";

export default function TicketScanningGuidePage() {
  return <GuidePage guide="ticketScanning" />;
}

export function generateMetadata(): Promise<Metadata> {
  return buildGuideMetadata("ticketScanning");
}
