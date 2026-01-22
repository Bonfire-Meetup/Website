import { AccentBar } from "./AccentBar";

interface SectionHeaderProps {
  id?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ id, title, subtitle, className = "" }: SectionHeaderProps) {
  return (
    <div id={id} className={`mb-16 scroll-mt-24 text-center ${className}`}>
      <div className="mb-4 flex items-center justify-center gap-4">
        <AccentBar />
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          {title}
        </h2>
      </div>
      {subtitle ? (
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
