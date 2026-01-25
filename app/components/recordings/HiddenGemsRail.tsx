import type { HiddenGemRecording } from "./RecordingsCatalogTypes";

import { Rail } from "./Rail";
import { RailCard } from "./RailCard";

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  );
}

export function HiddenGemsRail({
  title,
  recordings,
  scrollLeftLabel,
  scrollRightLabel,
}: {
  title: string;
  recordings: HiddenGemRecording[];
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
}) {
  return (
    <Rail
      title={title}
      items={recordings}
      renderItem={(recording, index) => (
        <RailCard
          key={`hidden-gem-${recording.shortId}`}
          recording={recording}
          isFirst={index < 2}
        />
      )}
      headerIcon={<SparkleIcon className="h-5 w-5 text-purple-500" />}
      headerAccent={
        <div className="flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-purple-500 to-indigo-500" />
      }
      containerClassName="rounded-[28px] px-2 pt-2 pb-2"
      gradientFrom="from-purple-500/5"
      gradientTo="to-indigo-500/5"
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    />
  );
}
