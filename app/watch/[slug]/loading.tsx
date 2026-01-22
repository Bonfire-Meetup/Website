function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800 ${className}`} />
  );
}

function RelatedCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px] bg-white/90 shadow-xl ring-1 shadow-black/5 ring-black/5 dark:bg-neutral-950 dark:shadow-black/10 dark:ring-white/10">
      <Skeleton className="aspect-video w-full !rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-4 flex justify-between border-t border-neutral-100 pt-3 dark:border-white/5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function WatchLoading() {
  return (
    <div className="gradient-bg min-h-screen">
      <div className="relative mx-auto max-w-[85rem] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <div className="min-w-0 space-y-8">
            <div className="overflow-hidden rounded-3xl bg-white/90 shadow-xl ring-1 shadow-black/5 ring-black/5 dark:bg-neutral-950 dark:shadow-black/10 dark:ring-white/10">
              <div className="hidden items-center justify-between border-b border-neutral-200/30 px-4 py-3 lg:flex dark:border-neutral-700/30">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-7 w-24 rounded-lg" />
              </div>

              <Skeleton className="aspect-video w-full !rounded-none" />

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/40 px-5 py-4 sm:px-6 dark:border-neutral-700/40">
                <Skeleton className="h-10 w-36 rounded-full" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>

              <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>

                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-24" />
                </div>

                <div className="space-y-3 border-t border-neutral-200/40 pt-5 dark:border-neutral-700/40">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <Skeleton className="h-6 w-16 rounded-md" />
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-6 w-14 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-4 lg:gap-3">
              <div className="h-px flex-1 bg-neutral-200/50 lg:hidden dark:bg-white/10" />
              <Skeleton className="h-7 w-36" />
              <div className="h-px flex-1 bg-neutral-200/50 lg:hidden dark:bg-white/10" />
            </div>

            <div className="overflow-hidden rounded-2xl bg-white/90 shadow-lg ring-1 shadow-black/5 ring-black/5 dark:bg-neutral-950 dark:shadow-black/10 dark:ring-white/10">
              <Skeleton className="aspect-video w-full !rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <RelatedCardSkeleton key={`related-skeleton-${i}`} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
