import type { Metadata } from "next";

import { allEvents } from "@/data/events-calendar";
import { buildSpeakerMedia } from "@/lib/events/speaker-media";
import { buildMetaPageMetadata } from "@/lib/metadata";

import { UpcomingEventsPageContent } from "./UpcomingEventsPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("upcomingEvents");
}

export default function UpcomingEventsPage() {
  return (
    <UpcomingEventsPageContent events={allEvents} speakerMedia={buildSpeakerMedia(allEvents)} />
  );
}
