import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { getAllSpeakerProfiles, getSpeakerProfile } from "@/lib/events/speaker-profiles";
import { buildNotFoundTitleMetadata, getMetaTitleSuffix } from "@/lib/metadata";

import { SpeakerSocialsContent } from "./SpeakerSocialsContent";

interface PageProps {
  params: Promise<{ eventId: string; slug: string }>;
}

function findTalk(slug: string, eventId: string) {
  const profile = getSpeakerProfile(slug);
  const talk = profile?.talks.find((item) => item.eventId === eventId && item.socials.length > 0);
  return profile && talk ? { profile, talk } : undefined;
}

export function generateStaticParams() {
  return getAllSpeakerProfiles().flatMap((profile) =>
    profile.talks
      .filter((talk) => talk.socials.length > 0)
      .map((talk) => ({ eventId: talk.eventId, slug: profile.slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId, slug } = await params;
  const found = findTalk(slug, eventId);

  if (!found) {
    return buildNotFoundTitleMetadata("speakerNotFound");
  }

  const [t, titleSuffix] = await Promise.all([
    getTranslations("speakerPage.socials"),
    getMetaTitleSuffix(),
  ]);

  // A toolbox for the speaker and the crew, reached from the speaker page; not a landing page.
  return {
    description: t("metaDescription", { name: found.profile.name, topic: found.talk.topic }),
    robots: { follow: false, index: false },
    title: `${t("title")}: ${found.talk.topic}${titleSuffix}`,
  };
}

export default async function SpeakerSocialsPage({ params }: PageProps) {
  const { eventId, slug } = await params;
  const found = findTalk(slug, eventId);

  if (!found) {
    notFound();
  }

  return (
    <SpeakerSocialsContent
      speaker={{ name: found.profile.name, slug: found.profile.slug }}
      talk={found.talk}
    />
  );
}
