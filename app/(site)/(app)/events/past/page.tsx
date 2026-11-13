import type { Metadata } from "next";

import { getPastPageEvents } from "@/lib/events/event-views";
import { buildMetaPageMetadata } from "@/lib/metadata";

import { PastEventsPageContent } from "./PastEventsPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("pastEvents");
}

export default async function PastEventsPage() {
  return <PastEventsPageContent events={await getPastPageEvents()} />;
}
