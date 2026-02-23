import { memo } from "react";

import { type LocationValue } from "@/lib/config/constants";
import { type RecordingAccessPolicy } from "@/lib/recordings/early-access";

import { RecordingDetailedCard } from "./RecordingDetailedCard";

interface VideoCardProps {
  shortId: string;
  slug: string;
  title: string;
  speaker: string[];
  date: string;
  thumbnail: string;
  location: LocationValue;
  locationLabel?: string;
  ariaLocationLabel?: string;
  locale?: string;
  likeCount?: number;
  boostCount?: number;
  access?: RecordingAccessPolicy;
}

export const VideoCard = memo(function VideoCard({
  shortId,
  slug,
  title,
  speaker,
  date,
  thumbnail,
  location,
  locationLabel,
  ariaLocationLabel,
  locale = "en-US",
  likeCount,
  boostCount,
  access,
}: VideoCardProps) {
  return (
    <RecordingDetailedCard
      variant="glass"
      shortId={shortId}
      slug={slug}
      title={title}
      speaker={speaker}
      date={date}
      thumbnail={thumbnail}
      location={location}
      access={access}
      locationLabel={locationLabel}
      ariaLocationLabel={ariaLocationLabel}
      locale={locale}
      likeCount={likeCount}
      boostCount={boostCount}
    />
  );
});
