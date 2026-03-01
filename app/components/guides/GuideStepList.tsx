interface GuideStepListProps {
  items: string[];
  variant?: "numbered" | "bullet" | "dot" | "rose-dot" | "emerald-dot";
}

export function GuideStepList({ items, variant = "numbered" }: GuideStepListProps) {
  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3 text-sm leading-relaxed sm:text-base">
          {variant === "numbered" ? (
            <span className="border-brand-300/40 text-brand-700 dark:border-brand-300/25 dark:text-brand-300 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
              {index + 1}
            </span>
          ) : variant === "bullet" ? (
            <span className="border-brand-300/40 text-brand-700 dark:border-brand-300/25 dark:text-brand-300 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
              •
            </span>
          ) : variant === "rose-dot" ? (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500 dark:bg-rose-300" />
          ) : variant === "emerald-dot" ? (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-300" />
          ) : (
            <span className="bg-brand-500 dark:bg-brand-300 mt-1.5 h-2 w-2 shrink-0 rounded-full" />
          )}
          <span className="text-neutral-700 dark:text-neutral-300">{item}</span>
        </li>
      ))}
    </ol>
  );
}
