import type { Metadata } from "next";

import { buildSimplePageMetadata } from "@/lib/metadata";

import { TicketScanningContent } from "./TicketScanningContent";

export default function TicketScanningGuidePage() {
  return <TicketScanningContent />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "ticketScanningGuide" });
}
