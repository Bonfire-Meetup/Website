import { RecordingSpeakerList } from "@/components/recordings/RecordingSpeakerList";

export function SpeakerList({ speakers }: { speakers: string[] }) {
  return (
    <RecordingSpeakerList
      speakers={speakers}
      dotClassName="bg-brand-500 dark:bg-brand-400 h-1 w-1 shrink-0 rounded-full shadow-[0_0_6px_var(--color-brand-glow-lighter)]"
    />
  );
}
