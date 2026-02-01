import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { upcomingEvents } from "@/data/upcoming-events";
import { buildNotFoundTitleMetadata, getMetaTitleSuffix } from "@/lib/metadata";

import { EventDetailClient } from "./EventDetailClient";

export function generateStaticParams() {
  return upcomingEvents.map((event) => ({
    id: event.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = upcomingEvents.find((e) => e.id === id);

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
  const event = upcomingEvents.find((e) => e.id === id);

  if (!event) {
    notFound();
  }

  return (
    <div className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <EventDetailClient
        id={event.id}
        title={event.title}
        episode={event.episode}
        location={event.location}
        date={event.date}
        time={event.time}
        venue={event.venue}
        description={event.description}
        speakers={event.speakers}
        links={event.links}
      />
    </div>
  );
}
