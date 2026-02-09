import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { hasMembership } from "@/lib/config/membership";
import { getAuthUserById } from "@/lib/data/auth";
import {
  getUserBoosts,
  getUserBoostCount,
  getUserBoostsThisMonth,
  getUserBoostStreak,
} from "@/lib/data/boosts";
import { getUserCheckIns } from "@/lib/data/check-in";
import { decompressUuid, compressUuid } from "@/lib/utils/uuid-compress";

import { BoostedVideos } from "./BoostedVideos";
import { BoostedVideosSkeleton } from "./BoostedVideosSkeleton";
import { CheckedInEvents } from "./CheckedInEvents";
import { CheckedInEventsSkeleton } from "./CheckedInEventsSkeleton";
import { UpcomingRsvps } from "./UpcomingRsvps";
import { UpcomingRsvpsSkeleton } from "./UpcomingRsvpsSkeleton";
import { PrivateProfileContent, UserProfileContent } from "./UserProfileContent";

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

  if (!userId) {
    return { title: t("userProfileNotFound", { brandName: tCommon("brandName") }) };
  }

  const user = await getAuthUserById(userId);
  const brandName = tCommon("brandName");

  if (!user || !(user.preferences.publicProfile ?? false)) {
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
  }).format(new Date(user.createdAt));

  const name = user.name || t("communityMember");
  const values = { brandName, memberSince, name };

  const title = t("userProfileTitle", values);
  const description = t("userProfileDescription", values);

  return {
    description,
    openGraph: {
      description,
      title,
      type: "profile",
      username: user.name || undefined,
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

  const user = await getAuthUserById(userId);
  if (!user) {
    notFound();
  }

  if (!(user.preferences.publicProfile ?? false)) {
    return <PrivateProfileContent />;
  }

  const memberSince = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt));
  const isMember = hasMembership(user.membershipTier);
  const [boosts, checkIns, boostCount, boostsThisMonth, boostStreak] = await Promise.all([
    getUserBoosts(userId),
    getUserCheckIns(userId),
    getUserBoostCount(userId),
    getUserBoostsThisMonth(userId),
    getUserBoostStreak(userId),
  ]);

  return (
    <UserProfileContent
      user={{
        publicId: compressUuid(user.id),
        name: user.name,
        memberSince,
        roles: user.roles,
        membershipTier: user.membershipTier,
        isMember,
        boostCount,
        boostsThisMonth,
        boostStreak,
      }}
      stats={{
        lastBoostedAt: boosts[0]?.createdAt ?? null,
        lastCheckedInAt: checkIns[0]?.createdAt ?? null,
      }}
      upcomingRsvpsSlot={
        <Suspense fallback={<UpcomingRsvpsSkeleton />}>
          <UpcomingRsvps userId={userId} profileUserId={user.id} />
        </Suspense>
      }
      boostedVideosSlot={
        <Suspense fallback={<BoostedVideosSkeleton />}>
          <BoostedVideos userId={userId} profileUserId={user.id} />
        </Suspense>
      }
      checkedInEventsSlot={
        <Suspense fallback={<CheckedInEventsSkeleton />}>
          <CheckedInEvents userId={userId} profileUserId={user.id} />
        </Suspense>
      }
    />
  );
}
