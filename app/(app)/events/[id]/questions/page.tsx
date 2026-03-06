import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { StaticPageHero } from "@/components/layout/StaticPageHero";
import { CommunityQuestionsPanel } from "@/components/questions/CommunityQuestionsPanel";
import { BackLink } from "@/components/ui/BackLink";
import { allEvents, getEventById } from "@/data/events-calendar";
import { buildNotFoundTitleMetadata, getMetaTitleSuffix } from "@/lib/metadata";
import { PAGE_ROUTES } from "@/lib/routes/pages";

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

  const t = await getTranslations("events");
  const titleSuffix = await getMetaTitleSuffix();

  return {
    description: t("questionsPage.description"),
    openGraph: {
      description: t("questionsPage.description"),
      title: `${event.title} Q&A`,
      type: "website",
    },
    title: `${event.title} Q&A${titleSuffix}`,
    twitter: {
      card: "summary_large_image",
      description: t("questionsPage.description"),
      title: `${event.title} Q&A`,
    },
  };
}

export default async function EventQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    notFound();
  }

  const t = await getTranslations("events");
  const talkOptions = event.speakers.map((speaker, index) => ({
    key: `${speaker.topic}-${index}`,
    topic: speaker.topic,
  }));

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <StaticPageHero
        backgroundVariant="events"
        eyebrow={t("questionsPage.eyebrow")}
        heroWord="Q&A"
        heroWordSize="md"
        sectionPreset="compact"
        subtitle={t("questionsPage.title")}
        subtitleClassName="mx-auto mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400"
        title={
          <h1 className="text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
            {event.title}
          </h1>
        }
      >
        <div className="absolute top-24 left-1/2 z-20 flex w-full max-w-5xl -translate-x-1/2 px-4 sm:top-28 sm:px-6">
          <BackLink href={PAGE_ROUTES.EVENT(id)}>{t("questionsPage.backToEvent")}</BackLink>
        </div>
      </StaticPageHero>

      <section className="relative mx-auto max-w-5xl px-4 pb-10 sm:px-6 sm:pb-12">
        <CommunityQuestionsPanel
          eventId={event.id}
          talkOptions={talkOptions}
          showAutoRefreshToggle
          defaultAutoRefresh
          mode="live"
        />
      </section>
    </main>
  );
}
