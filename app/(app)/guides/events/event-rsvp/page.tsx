import type { Metadata } from "next";

import { buildGuideMetadata, GuidePage } from "@/components/guides/GuidePage";

export default function EventRsvpGuidePage() {
  return <GuidePage guide="eventRsvp" />;
}

export function generateMetadata(): Promise<Metadata> {
  return buildGuideMetadata("eventRsvp");
}
