import type { Metadata } from "next";

import { buildSimplePageMetadata } from "@/lib/metadata";

import { EventRsvpContent } from "./EventRsvpContent";

export default function EventRsvpGuidePage() {
  return <EventRsvpContent />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "eventRsvpGuide" });
}
