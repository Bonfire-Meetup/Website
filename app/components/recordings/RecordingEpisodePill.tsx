import { Pill } from "@/components/ui/Pill";

interface RecordingEpisodePillProps {
  episode?: string;
  episodeId?: string;
  episodeNumber?: number;
  epShortLabel: string;
  href?: string;
  size?: "xxs" | "xs" | "sm" | "md";
  className?: string;
  fallbackLabel?: string;
  showTitle?: boolean;
  asText?: boolean;
}

function getEpisodeLabel({
  episode,
  episodeId,
  episodeNumber,
  epShortLabel,
  fallbackLabel,
  showTitle,
}: Omit<RecordingEpisodePillProps, "href" | "size" | "className" | "asText">) {
  if (typeof episodeNumber === "number") {
    if (showTitle) {
      const title = episode ?? episodeId;
      return title
        ? `${epShortLabel} ${episodeNumber} · ${title}`
        : `${epShortLabel} ${episodeNumber}`;
    }

    return `${epShortLabel} ${episodeNumber}`;
  }

  return episode ?? episodeId ?? fallbackLabel ?? "";
}

export function RecordingEpisodePill({
  episode,
  episodeId,
  episodeNumber,
  epShortLabel,
  href,
  size = "xxs",
  className,
  fallbackLabel,
  showTitle = false,
  asText = false,
}: RecordingEpisodePillProps) {
  const label = getEpisodeLabel({
    episode,
    episodeId,
    episodeNumber,
    epShortLabel,
    fallbackLabel,
    showTitle,
  });

  if (!label) {
    return null;
  }

  if (asText) {
    return <span className={className}>{label}</span>;
  }

  return (
    <Pill href={href} size={size} className={className}>
      {label}
    </Pill>
  );
}
