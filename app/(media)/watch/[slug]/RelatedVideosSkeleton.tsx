export function RelatedVideosSkeleton() {
  return (
    <section className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div className="animate-pulse rounded-2xl border border-black/10 bg-white/70 p-4 shadow-[0_20px_40px_-30px_rgba(17,24,39,0.45)] ring-1 ring-white/45 backdrop-blur-lg dark:border-white/10 dark:bg-neutral-950/70 dark:ring-white/10">
        <div className="flex items-center justify-between gap-3">
          <div className="h-6 w-32 rounded bg-neutral-200/70 dark:bg-white/10" />
          <div className="h-5 w-14 rounded-full bg-neutral-200/65 dark:bg-white/10" />
        </div>
      </div>

      <div className="animate-pulse overflow-hidden rounded-2xl border border-black/10 bg-[linear-gradient(165deg,rgba(255,255,255,0.95)_0%,rgba(255,247,237,0.92)_100%)] p-3 shadow-[0_20px_46px_-28px_rgba(17,24,39,0.5)] ring-1 ring-white/55 dark:border-white/12 dark:bg-[linear-gradient(165deg,rgba(24,24,27,0.98)_0%,rgba(10,10,12,0.98)_100%)] dark:ring-white/10">
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
            className="relative flex animate-pulse flex-col overflow-hidden rounded-2xl border border-black/10 bg-[linear-gradient(180deg,rgba(249,250,251,0.98)_0%,rgba(229,231,235,0.98)_100%)] shadow-[0_20px_38px_-22px_rgba(17,24,39,0.38)] ring-1 ring-white/45 dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:ring-white/10"
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
