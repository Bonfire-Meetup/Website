export function SpeakerList({ speakers }: { speakers: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {speakers.map((name) => (
        <div key={name} className="flex items-center gap-2">
          <span className="h-1 w-1 shrink-0 rounded-full bg-brand-500 shadow-[0_0_6px_rgba(59,130,246,0.4)] dark:bg-brand-400" />
          <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}
