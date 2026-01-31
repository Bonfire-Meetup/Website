import type { Metadata } from "next";

import { buildMetaPageMetadata } from "@/lib/metadata";

import { UpcomingEventsPageContent } from "./UpcomingEventsPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("upcomingEvents");
}

export default function UpcomingEventsPage() {
  return <UpcomingEventsPageContent />;
}
