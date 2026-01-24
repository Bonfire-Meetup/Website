export function SpeakerList({ speakers }: { speakers: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {speakers.map((name) => (
        <div key={name} className="flex items-center gap-2">
          <span className="bg-brand-500 dark:bg-brand-400 h-1 w-1 shrink-0 rounded-full shadow-[0_0_6px_var(--color-brand-glow-lighter)]" />
          <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}
