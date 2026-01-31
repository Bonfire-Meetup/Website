import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { hasMembership } from "@/lib/config/membership";
import { getAuthUserById } from "@/lib/data/auth";
import { decompressUuid, compressUuid } from "@/lib/utils/uuid-compress";

import { BoostedVideos } from "./BoostedVideos";
import { BoostedVideosSkeleton } from "./BoostedVideosSkeleton";
import { CheckedInEvents } from "./CheckedInEvents";
import { CheckedInEventsSkeleton } from "./CheckedInEventsSkeleton";
import { PrivateProfileContent, UserProfileContent } from "./UserProfileContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
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

  const memberSince = new Intl.DateTimeFormat("en-US", {
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

  const memberSince = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt));
  const isMember = hasMembership(user.membershipTier);

  return (
    <UserProfileContent
      user={{
        publicId: compressUuid(user.id),
        name: user.name,
        memberSince,
        roles: user.roles,
        membershipTier: user.membershipTier,
        isMember,
      }}
      boostedVideosSlot={
        <Suspense fallback={<BoostedVideosSkeleton />}>
          <BoostedVideos userId={userId} />
        </Suspense>
      }
      checkedInEventsSlot={
        <Suspense fallback={<CheckedInEventsSkeleton />}>
          <CheckedInEvents userId={userId} />
        </Suspense>
      }
    />
  );
}
