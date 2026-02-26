export function RelatedVideosSkeleton() {
  return (
    <section className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-center gap-4 lg:gap-3">
        <div className="h-px flex-1 bg-neutral-200/50 lg:hidden dark:bg-white/10" />
        <div className="h-6 w-32 animate-pulse rounded bg-neutral-200/70 dark:bg-white/10" />
        <div className="h-px flex-1 bg-neutral-200/50 lg:hidden dark:bg-white/10" />
      </div>

      <div className="animate-pulse overflow-hidden rounded-[16px] border border-black/10 bg-[linear-gradient(180deg,rgba(249,250,251,0.98)_0%,rgba(229,231,235,0.98)_100%)] p-3 shadow-[0_16px_30px_-20px_rgba(17,24,39,0.35)] dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:shadow-[0_18px_38px_-18px_rgba(0,0,0,0.9)]">
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
        {Array.from(
          { length: 3 },
          (_, skeletonIndex) => `related-video-skeleton-${skeletonIndex}`,
        ).map((skeletonId) => (
          <div
            key={skeletonId}
            className="relative flex animate-pulse flex-col overflow-hidden rounded-[16px] border border-black/10 bg-[linear-gradient(180deg,rgba(249,250,251,0.98)_0%,rgba(229,231,235,0.98)_100%)] shadow-[0_16px_30px_-20px_rgba(17,24,39,0.35)] dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:shadow-[0_18px_38px_-18px_rgba(0,0,0,0.9)]"
          >
            <div className="relative aspect-video w-full bg-neutral-900" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/54 via-black/22 to-transparent dark:from-black/62 dark:via-black/26" />
            <div className="absolute top-2 left-2 h-5 w-20 rounded-full bg-neutral-200/80 dark:bg-white/15" />
            <div className="absolute inset-0 flex items-end">
              <div className="w-full space-y-2 bg-gradient-to-t from-black/86 via-black/52 to-transparent px-4 pt-14 pb-4 dark:from-black/96 dark:via-black/68">
                <div className="h-4 w-full rounded bg-white/45 dark:bg-white/25" />
                <div className="h-4 w-3/4 rounded bg-white/40 dark:bg-white/22" />
                <div className="mt-2 space-y-1.5">
                  <div className="h-3 w-2/3 rounded bg-white/35 dark:bg-white/20" />
                  <div className="h-3 w-1/2 rounded bg-white/35 dark:bg-white/20" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="h-3 w-16 rounded bg-white/30 dark:bg-white/15" />
                  <div className="h-4 w-10 rounded-full bg-white/30 dark:bg-white/15" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
