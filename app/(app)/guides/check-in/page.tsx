import type { Metadata } from "next";

import { buildSimplePageMetadata } from "@/lib/metadata";

import { CheckInContent } from "./CheckInContent";

export default function HowToCheckInPage() {
  return <CheckInContent />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "checkInHowTo" });
}
