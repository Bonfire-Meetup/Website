import { Skeleton } from "@/components/shared/Skeleton";

const WATCH_LATER_HERO_PANEL_CLASS =
  "rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,248,240,0.72)_0%,rgba(255,244,232,0.56)_100%)] shadow-[0_28px_60px_-36px_rgba(15,23,42,0.34)] ring-1 ring-white/35 backdrop-blur-xl backdrop-saturate-150 dark:border-white/20 dark:bg-[linear-gradient(180deg,rgba(16,16,18,0.78)_0%,rgba(10,10,12,0.62)_100%)] dark:shadow-[0_20px_48px_-32px_rgba(0,0,0,0.7)] dark:ring-white/10";

export function RecordingsRailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-6 overflow-hidden py-3">
        {Array.from({ length: 4 }, (_, skeletonIndex) => `rail-skeleton-${skeletonIndex}`).map(
          (skeletonId) => (
            <div
              key={skeletonId}
              className="relative w-[88vw] shrink-0 overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,rgba(249,250,251,0.98)_0%,rgba(229,231,235,0.98)_100%)] shadow-[0_16px_30px_-20px_rgba(17,24,39,0.35)] ring-1 ring-black/10 sm:w-[70vw] lg:w-[calc((100%-3rem-1px)/3)] xl:w-[calc((100%-3rem-1px)/3)] dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:shadow-[0_18px_38px_-18px_rgba(0,0,0,0.9)] dark:ring-white/12"
            >
              <Skeleton className="aspect-video w-full !rounded-none" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/62 via-black/28 via-62% to-transparent dark:from-black/70 dark:via-black/34" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/18 to-transparent dark:from-white/6" />
              <div className="absolute top-2 left-2 h-5 w-20 rounded-full bg-neutral-200/80 dark:bg-white/15" />
              <div className="absolute top-3 right-3 h-5 w-14 rounded-full bg-neutral-200/70 dark:bg-white/10" />
              <div className="absolute inset-0 flex items-end">
                <div className="w-full space-y-2 bg-gradient-to-t from-black/68 via-black/30 to-transparent px-3.5 pt-12 pb-3.5 dark:from-black/82 dark:via-black/48">
                  <Skeleton className="h-3 w-24 bg-white/35 dark:bg-white/20" />
                  <Skeleton className="h-4 w-3/4 bg-white/45 dark:bg-white/25" />
                  <Skeleton className="h-3 w-2/3 bg-white/35 dark:bg-white/20" />
                  <div className="flex gap-1 pt-0.5">
                    <Skeleton className="h-4 w-12 rounded-full bg-white/30 dark:bg-white/15" />
                    <Skeleton className="h-4 w-10 rounded-full bg-white/30 dark:bg-white/15" />
                  </div>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export function RecordingsGridSkeleton() {
  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 8 }, (_, skeletonIndex) => `grid-skeleton-${skeletonIndex}`).map(
        (skeletonId) => (
          <div
            key={skeletonId}
            className="relative overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,rgba(249,250,251,0.98)_0%,rgba(229,231,235,0.98)_100%)] shadow-[0_16px_30px_-20px_rgba(17,24,39,0.35)] ring-1 ring-black/10 dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:shadow-[0_18px_38px_-18px_rgba(0,0,0,0.9)] dark:ring-white/12"
          >
            <Skeleton className="aspect-video w-full !rounded-none" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/62 via-black/28 via-62% to-transparent dark:from-black/70 dark:via-black/34" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/18 to-transparent dark:from-white/6" />
            <div className="absolute top-2 left-2 h-5 w-20 rounded-full bg-neutral-200/80 dark:bg-white/15" />
            <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-neutral-200/80 dark:bg-white/15" />
            <div className="absolute inset-0 flex items-end">
              <div className="w-full space-y-2 bg-gradient-to-t from-black/72 via-black/34 to-transparent px-4 pt-14 pb-4 dark:from-black/86 dark:via-black/52">
                <Skeleton className="h-3 w-24 bg-white/35 dark:bg-white/20" />
                <Skeleton className="h-4 w-3/4 bg-white/45 dark:bg-white/25" />
                <Skeleton className="h-3 w-2/3 bg-white/35 dark:bg-white/20" />
                <div className="flex gap-1 pt-0.5">
                  <Skeleton className="h-4 w-12 rounded-full bg-white/30 dark:bg-white/15" />
                  <Skeleton className="h-4 w-10 rounded-full bg-white/30 dark:bg-white/15" />
                </div>
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

export function WatchLaterLoadingSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-black/15 shadow-[0_28px_65px_-32px_rgba(15,23,42,0.65)] sm:rounded-[32px] dark:border-white/10 dark:shadow-[0_28px_70px_-30px_rgba(0,0,0,0.85)]">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(15,23,42,0.92)_0%,rgba(30,41,59,0.7)_50%,rgba(15,23,42,0.92)_100%)] dark:bg-[linear-gradient(110deg,rgba(0,0,0,0.82)_0%,rgba(22,22,24,0.64)_50%,rgba(0,0,0,0.82)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.14),transparent_36%),radial-gradient(circle_at_85%_16%,rgba(249,115,22,0.16),transparent_30%)] dark:bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.06),transparent_36%),radial-gradient(circle_at_85%_16%,rgba(249,115,22,0.12),transparent_30%)]" />

        <div className="relative z-10 flex min-h-[430px] flex-col px-4 py-4 sm:min-h-[520px] sm:px-8 sm:py-8 lg:px-10 lg:py-9">
          <div className="h-10 w-36 animate-pulse rounded-full border border-white/20 bg-white/10" />

          <div className="mt-auto grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-end">
            <div className={`${WATCH_LATER_HERO_PANEL_CLASS} min-w-0 p-5 sm:p-7`}>
              <div className="space-y-5">
                <div className="h-3 w-28 animate-pulse rounded-full bg-white/12" />
                <div className="h-12 max-w-md animate-pulse rounded-3xl bg-white/12" />
                <div className="h-5 max-w-xl animate-pulse rounded-full bg-white/12" />
                <div className="h-9 w-32 animate-pulse rounded-full bg-white/12" />
              </div>
            </div>

            <div className={`${WATCH_LATER_HERO_PANEL_CLASS} p-6`}>
              <div className="space-y-4">
                <div className="h-3 w-20 animate-pulse rounded-full bg-white/12" />
                <div className="h-10 animate-pulse rounded-3xl bg-white/12" />
                <div className="h-5 w-2/3 animate-pulse rounded-full bg-white/12" />
                <div className="space-y-2 pt-2">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/12" />
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/12" />
                </div>
                <div className="flex gap-3 pt-2">
                  <div className="h-11 flex-1 animate-pulse rounded-xl bg-white/12" />
                  <div className="h-11 w-28 animate-pulse rounded-xl bg-white/12" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded-full bg-neutral-200 dark:bg-white/10" />
          <div className="h-8 w-56 animate-pulse rounded-2xl bg-neutral-200 dark:bg-white/10" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
        </div>

        <RecordingsGridSkeleton />
      </div>
    </div>
  );
}
