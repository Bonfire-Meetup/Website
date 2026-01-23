export function BoostedVideosSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-neutral-200/50 bg-white/80 shadow-xl shadow-black/5 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80 dark:shadow-black/20">
      <div className="relative border-b border-neutral-200/50 px-6 py-5 dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="from-brand-400 to-brand-400 h-4 w-1 bg-gradient-to-b via-rose-400" />
            <div className="h-5 w-32 animate-pulse rounded bg-neutral-200/70 dark:bg-white/10" />
          </div>
          <div className="h-6 w-12 animate-pulse rounded-full bg-neutral-200/70 dark:bg-white/10" />
        </div>
      </div>
      <div className="relative p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`boosted-video-skeleton-${index}`}
              className="relative overflow-hidden rounded-xl border border-neutral-200/70 bg-white/50 dark:border-white/10 dark:bg-white/5"
            >
              <div className="relative aspect-video w-full animate-pulse bg-neutral-100 dark:bg-neutral-900" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200/70 dark:bg-white/10" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200/60 dark:bg-white/5" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200/60 dark:bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
