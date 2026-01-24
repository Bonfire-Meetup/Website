export function BoostedVideosSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white/90 shadow-2xl shadow-black/5 backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-black/25">
      {/* Header skeleton */}
      <div className="relative border-b border-neutral-200/60 px-6 py-6 sm:px-8 sm:py-7 dark:border-white/10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-neutral-200/70 dark:bg-white/10" />
            <div className="h-6 w-36 animate-pulse rounded-lg bg-neutral-200/70 dark:bg-white/10" />
          </div>
          <div className="h-9 w-12 animate-pulse rounded-full bg-neutral-200/70 dark:bg-white/10" />
        </div>
      </div>

      {/* Videos grid skeleton */}
      <div className="relative p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`boosted-video-skeleton-${index}`}
              className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-white/10 dark:bg-neutral-800/50"
            >
              {/* Thumbnail skeleton */}
              <div className="relative aspect-video w-full animate-pulse bg-neutral-100 dark:bg-neutral-900" />

              {/* Content skeleton */}
              <div className="space-y-3 p-5">
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-neutral-200/70 dark:bg-white/10" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200/70 dark:bg-white/10" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-200/60 dark:bg-white/5" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200/60 dark:bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
