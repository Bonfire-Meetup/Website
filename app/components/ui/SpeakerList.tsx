import { RecordingSpeakerList } from "@/components/recordings/RecordingSpeakerList";

export function SpeakerList({ speakers }: { speakers: string[] }) {
  return (
    <RecordingSpeakerList
      speakers={speakers}
      className="flex flex-col gap-1.5"
      itemClassName="flex items-center gap-1.5"
      dotClassName="h-1 w-1 shrink-0 rounded-full bg-brand-400 shadow-[0_0_6px_var(--color-brand-glow-lighter)]"
      textClassName="line-clamp-1 text-xs font-medium text-white/85"
    />
  );
}
