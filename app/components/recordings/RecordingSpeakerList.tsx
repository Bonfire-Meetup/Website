interface RecordingSpeakerListProps {
  speakers: string[];
  className?: string;
  itemClassName?: string;
  dotClassName?: string;
  textClassName?: string;
}

export function RecordingSpeakerList({
  speakers,
  className = "flex flex-col gap-1.5",
  itemClassName = "flex items-center gap-2",
  dotClassName = "speaker-dot",
  textClassName = "text-[11px] font-medium text-neutral-700 dark:text-neutral-300",
}: RecordingSpeakerListProps) {
  return (
    <div className={className}>
      {speakers.map((name) => (
        <div key={name} className={itemClassName}>
          <span className={dotClassName} />
          <span className={textClassName}>{name}</span>
        </div>
      ))}
    </div>
  );
}
