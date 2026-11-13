import { getLocale, getTranslations } from "next-intl/server";

import { RoleBadges } from "@/(site)/(app)/users/[id]/RoleBadges";
import { Button } from "@/components/ui/Button";
import { PROFILE_EYEBROW, PROFILE_SURFACE, PROFILE_TONE } from "@/components/ui/surface";
import { UserAvatar } from "@/components/user/UserAvatar";
import { hasMembership } from "@/lib/config/membership";
import { getPublicProfile } from "@/lib/data/public-profile";
import { getDevAccountFixture } from "@/lib/dev/local-fixtures";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { makeAvatarSeedFromPublicId } from "@/lib/utils/hash-rng";
import { decompressUuid } from "@/lib/utils/uuid-compress";

interface SpeakerCommunityCardProps {
  profileId: string;
}

async function loadCommunityMember(userId: string) {
  try {
    const result = await getPublicProfile(userId);

    if (result.status !== "ok") {
      return null;
    }

    const { profile } = result;

    return {
      attendedCount: profile.stats.eventsAttended,
      boostCount: profile.stats.boostCount,
      user: profile,
    };
  } catch {
    return null;
  }
}

export async function SpeakerCommunityCard({ profileId }: SpeakerCommunityCardProps) {
  const userId = decompressUuid(profileId);
  const fixture = getDevAccountFixture(profileId);
  const member = fixture
    ? { attendedCount: fixture.eventsAttended, boostCount: fixture.boostCount, user: fixture }
    : userId
      ? await loadCommunityMember(userId)
      : null;
  if (!member) {
    return null;
  }
  const { attendedCount, boostCount, user } = member;

  const [t, locale] = await Promise.all([getTranslations("speakerPage.community"), getLocale()]);
  const memberSince = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(user.createdAt),
  );

  return (
    <section
      aria-label={t("title")}
      className={`${PROFILE_SURFACE} ${PROFILE_TONE.community} mt-10 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-7`}
    >
      <UserAvatar
        avatarSeed={makeAvatarSeedFromPublicId(profileId)}
        size={72}
        name={user.name}
        animated={false}
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className={`${PROFILE_EYEBROW} text-rose-600 dark:text-rose-400`}>{t("title")}</p>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
          {t("memberSince", { date: memberSince })}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RoleBadges
            roles={user.roles}
            membershipTier={hasMembership(user.membershipTier) ? user.membershipTier : null}
          />
        </div>
      </div>
      <dl className="flex shrink-0 gap-6 text-center">
        <div>
          <dd className="text-2xl font-black text-neutral-900 dark:text-white">{attendedCount}</dd>
          <dt className="text-xs text-neutral-500 dark:text-neutral-400">{t("eventsAttended")}</dt>
        </div>
        <div>
          <dd className="text-2xl font-black text-neutral-900 dark:text-white">{boostCount}</dd>
          <dt className="text-xs text-neutral-500 dark:text-neutral-400">{t("boostsGiven")}</dt>
        </div>
      </dl>
      <Button href={PAGE_ROUTES.USER(profileId)} variant="secondary" size="sm" className="shrink-0">
        {t("viewProfile")}
      </Button>
    </section>
  );
}
