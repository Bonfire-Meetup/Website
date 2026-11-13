import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { hasMembership } from "@/lib/config/membership";
import { getPublicProfile } from "@/lib/data/public-profile";
import { getDevAccountFixture } from "@/lib/dev/local-fixtures";
import { getSpeakerProfileByUserId, type SpeakerProfile } from "@/lib/events/speaker-profiles";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { decompressUuid } from "@/lib/utils/uuid-compress";

import { BoostedVideos } from "./BoostedVideos";
import { BoostedVideosSkeleton } from "./BoostedVideosSkeleton";
import { CheckedInEvents } from "./CheckedInEvents";
import { CheckedInEventsSkeleton } from "./CheckedInEventsSkeleton";
import { UpcomingRsvps } from "./UpcomingRsvps";
import { UpcomingRsvpsSkeleton } from "./UpcomingRsvpsSkeleton";
import { PrivateProfileContent, UserProfileContent } from "./UserProfileContent";

function toSpeakerSummary(profile: SpeakerProfile | undefined) {
  if (!profile || profile.talks.length === 0) {
    return undefined;
  }

  return {
    href: PAGE_ROUTES.SPEAKER(profile.slug),
    name: profile.name,
    photoUrl: profile.photoUrl,
    // Newest first, as on the speaker page.
    talks: profile.talks.map((talk) => ({
      date: talk.date,
      eventId: talk.eventId,
      eventTitle: talk.eventTitle,
      topic: talk.topic,
    })),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
  const userId = decompressUuid(id);
  const fixture = getDevAccountFixture(id);

  if (fixture) {
    return { title: fixture.name };
  }

  if (!userId) {
    return { title: t("userProfileNotFound", { brandName: tCommon("brandName") }) };
  }

  const result = await getPublicProfile(userId);
  const brandName = tCommon("brandName");

  if (result.status !== "ok") {
    const title = t("privateProfileTitle", { brandName });
    const description = t("privateProfileDescription", { brandName });
    return {
      description,
      openGraph: { description, title, type: "profile" },
      robots: { follow: false, index: false },
      title,
      twitter: { card: "summary", description, title },
    };
  }

  const memberSince = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(result.profile.createdAt));

  const name = result.profile.name || t("communityMember");
  const values = { brandName, memberSince, name };

  const title = t("userProfileTitle", values);
  const description = t("userProfileDescription", values);

  return {
    description,
    openGraph: {
      description,
      title,
      type: "profile",
      username: result.profile.name || undefined,
    },
    title,
    twitter: {
      card: "summary",
      description,
      title,
    },
  };
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const userId = decompressUuid(id);

  if (!userId) {
    notFound();
  }

  const fixture = getDevAccountFixture(id);
  if (fixture) {
    const speakerProfile = getSpeakerProfileByUserId(id);

    return (
      <UserProfileContent
        user={{
          publicId: id,
          name: fixture.name,
          memberSince: new Intl.DateTimeFormat(locale, {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(fixture.createdAt)),
          roles: fixture.roles,
          membershipTier: fixture.membershipTier,
          isMember: hasMembership(fixture.membershipTier),
          questionActivityLevel: null,
          boostCount: fixture.boostCount,
          boostsThisMonth: 0,
          boostStreak: 0,
        }}
        speaker={toSpeakerSummary(speakerProfile)}
        stats={{ lastBoostedAt: null, lastCheckedInAt: null }}
        upcomingRsvpsSlot={null}
        boostedVideosSlot={null}
        checkedInEventsSlot={null}
      />
    );
  }

  const result = await getPublicProfile(userId);

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "private") {
    return <PrivateProfileContent />;
  }

  const { profile } = result;
  const memberSince = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(profile.createdAt));

  return (
    <UserProfileContent
      user={{
        publicId: profile.publicId,
        name: profile.name,
        memberSince,
        roles: profile.roles,
        membershipTier: profile.membershipTier,
        isMember: profile.membershipTier !== null,
        questionActivityLevel: profile.questionActivityLevel,
        boostCount: profile.stats.boostCount,
        boostsThisMonth: profile.stats.boostsThisMonth,
        boostStreak: profile.stats.boostStreak,
      }}
      speaker={toSpeakerSummary(getSpeakerProfileByUserId(id))}
      stats={{
        lastBoostedAt: profile.stats.lastBoostedAt,
        lastCheckedInAt: profile.stats.lastCheckedInAt,
      }}
      upcomingRsvpsSlot={
        <Suspense fallback={<UpcomingRsvpsSkeleton />}>
          <UpcomingRsvps events={profile.upcomingRsvps} profileUserId={userId} />
        </Suspense>
      }
      boostedVideosSlot={
        <Suspense fallback={<BoostedVideosSkeleton />}>
          <BoostedVideos videos={profile.boostedVideos} profileUserId={userId} />
        </Suspense>
      }
      checkedInEventsSlot={
        <Suspense fallback={<CheckedInEventsSkeleton />}>
          <CheckedInEvents events={profile.attendedEvents} profileUserId={userId} />
        </Suspense>
      }
    />
  );
}
