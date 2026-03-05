import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { allEvents, getEventById } from "@/data/events-calendar";
import { buildNotFoundTitleMetadata, getMetaTitleSuffix } from "@/lib/metadata";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { getShortPath } from "@/lib/routes/short-links";

import { EventDetailContent } from "./EventDetailContent";

export function generateStaticParams() {
  return allEvents.map((event) => ({
    id: event.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    return buildNotFoundTitleMetadata("eventNotFound");
  }

  const titleSuffix = await getMetaTitleSuffix();
  return {
    description: event.description,
    openGraph: {
      description: event.description,
      title: event.title,
      type: "website",
    },
    title: `${event.title}${titleSuffix}`,
    twitter: {
      card: "summary_large_image",
      description: event.description,
      title: event.title,
    },
  };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    notFound();
  }

  const shortPath = getShortPath(`/events/${id}`);
  const recordingsById = new Map(
    getAllRecordings().map((recording) => [
      recording.shortId,
      PAGE_ROUTES.WATCH(recording.slug, recording.shortId),
    ]),
  );
  const speakers = event.speakers.map((speaker) => ({
    ...speaker,
    recordingHref: speaker.recordingId ? recordingsById.get(speaker.recordingId) : undefined,
  }));

  return (
    <div className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <EventDetailContent
        id={event.id}
        title={event.title}
        episode={event.episode}
        location={event.location}
        date={event.date}
        time={event.time}
        venue={event.venue}
        description={event.description}
        speakers={speakers}
        links={event.links}
        shortPath={shortPath}
      />
    </div>
  );
}
