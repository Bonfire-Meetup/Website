import type { Metadata } from "next";

import { buildSimplePageMetadata } from "@/lib/metadata";

import { CheckInContent } from "./CheckInContent";

export default function CheckInGuidePage() {
  return <CheckInContent />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "checkInGuide" });
}
