function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800 ${className}`} />
  );
}

function RelatedCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[16px] border border-black/10 bg-[linear-gradient(180deg,rgba(249,250,251,0.98)_0%,rgba(229,231,235,0.98)_100%)] shadow-[0_16px_30px_-20px_rgba(17,24,39,0.35)] ring-1 ring-black/5 dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:shadow-[0_18px_38px_-18px_rgba(0,0,0,0.9)] dark:ring-white/10">
      <Skeleton className="aspect-video w-full !rounded-none" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/54 via-black/22 to-transparent dark:from-black/62 dark:via-black/26" />
      <div className="absolute inset-0 flex items-end">
        <div className="w-full space-y-2 bg-gradient-to-t from-black/86 via-black/52 to-transparent px-4 pt-14 pb-4 dark:from-black/96 dark:via-black/68">
          <Skeleton className="h-4 w-3/4 bg-white/45 dark:bg-white/25" />
          <Skeleton className="h-3 w-1/2 bg-white/35 dark:bg-white/20" />
          <div className="mt-2 flex justify-between">
            <Skeleton className="h-3 w-12 bg-white/30 dark:bg-white/15" />
            <Skeleton className="h-4 w-10 rounded-full bg-white/30 dark:bg-white/15" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchLoading() {
  return (
    <div className="gradient-bg min-h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-8rem] right-[-10rem] h-[26rem] w-[26rem] rounded-full bg-orange-500/16 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[-8rem] h-[24rem] w-[24rem] rounded-full bg-orange-400/12 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-[85rem] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <div className="min-w-0 space-y-8">
            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/80 shadow-[0_28px_70px_-34px_rgba(17,24,39,0.45)] ring-1 ring-white/50 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/85 dark:shadow-[0_34px_84px_-34px_rgba(0,0,0,0.8)] dark:ring-white/10">
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

            <div className="overflow-hidden rounded-[16px] border border-black/10 bg-[linear-gradient(180deg,rgba(249,250,251,0.98)_0%,rgba(229,231,235,0.98)_100%)] p-3 shadow-[0_16px_30px_-20px_rgba(17,24,39,0.35)] dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:shadow-[0_18px_38px_-18px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-4">
                <Skeleton className="aspect-video w-28 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {Array.from(
                { length: 3 },
                (_, skeletonIndex) => `related-skeleton-${skeletonIndex}`,
              ).map((skeletonId) => (
                <RelatedCardSkeleton key={skeletonId} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
