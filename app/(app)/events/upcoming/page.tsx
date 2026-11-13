import type { Metadata } from "next";

import { getUpcomingPageEvents } from "@/lib/events/event-views";
import { buildSpeakerMedia } from "@/lib/events/speaker-media";
import { buildMetaPageMetadata } from "@/lib/metadata";

import { UpcomingEventsPageContent } from "./UpcomingEventsPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("upcomingEvents");
}

export default async function UpcomingEventsPage() {
  const { recentPast, upcoming } = await getUpcomingPageEvents();

  return (
    <UpcomingEventsPageContent
      recentPast={recentPast}
      speakerMedia={buildSpeakerMedia(upcoming)}
      upcoming={upcoming}
    />
  );
}
