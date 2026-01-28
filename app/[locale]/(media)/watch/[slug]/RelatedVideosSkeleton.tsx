export function RelatedVideosSkeleton() {
  return (
    <section className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-center gap-4 lg:gap-3">
        <div className="h-px flex-1 bg-neutral-200/50 lg:hidden dark:bg-white/10" />
        <div className="h-6 w-32 animate-pulse rounded bg-neutral-200/70 dark:bg-white/10" />
        <div className="h-px flex-1 bg-neutral-200/50 lg:hidden dark:bg-white/10" />
      </div>

      <div className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/80 p-3 dark:border-white/10 dark:bg-neutral-950">
        <div className="flex items-center gap-4">
          <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-900" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-20 rounded bg-neutral-200/70 dark:bg-white/10" />
            <div className="h-4 w-full rounded bg-neutral-200/80 dark:bg-white/15" />
            <div className="h-4 w-3/4 rounded bg-neutral-200/80 dark:bg-white/15" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`related-video-skeleton-${index}`}
            className="relative flex animate-pulse flex-col overflow-hidden rounded-[24px] bg-white/90 dark:bg-neutral-950"
          >
            <div className="relative aspect-video w-full bg-neutral-900" />
            <div className="flex flex-1 flex-col p-4">
              <div className="h-4 w-full rounded bg-neutral-200/80 dark:bg-white/15" />
              <div className="mt-2 h-4 w-3/4 rounded bg-neutral-200/70 dark:bg-white/10" />
              <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-white/5">
                <div className="h-3 w-16 rounded bg-neutral-200/60 dark:bg-white/5" />
                <div className="h-5 w-12 rounded-full bg-neutral-200/60 dark:bg-white/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
