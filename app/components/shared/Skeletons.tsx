import { RecordingsRailSkeleton } from "@/components/recordings/RecordingLoadingSkeletons";
import { Skeleton } from "@/components/shared/Skeleton";
export { Skeleton };

export function TrendingRailSkeleton() {
  return <RecordingsRailSkeleton />;
}

export function EventsSectionSkeleton() {
  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <Skeleton className="mx-auto mb-4 h-10 w-64" />
          <Skeleton className="mx-auto h-6 w-full max-w-lg" />
        </div>
        <div className="mb-12 flex justify-center gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4 rounded-3xl bg-white/50 p-6 dark:bg-white/5">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RecordingsSectionSkeleton() {
  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <Skeleton className="mx-auto mb-4 h-10 w-48" />
          <Skeleton className="mx-auto h-6 w-full max-w-lg" />
        </div>
        <div className="mb-10 flex justify-center">
          <div className="flex gap-2 rounded-2xl bg-white/50 p-1.5 dark:bg-white/5">
            <Skeleton className="h-10 w-16 rounded-xl" />
            <Skeleton className="h-10 w-20 rounded-xl" />
            <Skeleton className="h-10 w-16 rounded-xl" />
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,rgba(249,250,251,0.98)_0%,rgba(229,231,235,0.98)_100%)] shadow-[0_16px_30px_-20px_rgba(17,24,39,0.35)] ring-1 ring-black/10 dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:shadow-[0_18px_38px_-18px_rgba(0,0,0,0.9)] dark:ring-white/12"
            >
              <Skeleton className="aspect-video w-full !rounded-none" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/54 via-black/22 to-transparent dark:from-black/62 dark:via-black/26" />
              <div className="absolute top-2 left-2 h-5 w-20 rounded-full bg-neutral-200/80 dark:bg-white/15" />
              <div className="absolute inset-0 flex items-end">
                <div className="w-full space-y-2 bg-gradient-to-t from-black/86 via-black/52 to-transparent px-4 pt-14 pb-4 dark:from-black/96 dark:via-black/68">
                  <Skeleton className="h-3 w-24 bg-white/35 dark:bg-white/20" />
                  <Skeleton className="h-4 w-full bg-white/45 dark:bg-white/25" />
                  <Skeleton className="h-4 w-3/4 bg-white/45 dark:bg-white/25" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-2/3 bg-white/35 dark:bg-white/20" />
                    <Skeleton className="h-3 w-1/2 bg-white/35 dark:bg-white/20" />
                  </div>
                  <div className="flex gap-1 pt-0.5">
                    <Skeleton className="h-4 w-12 rounded-full bg-white/30 dark:bg-white/15" />
                    <Skeleton className="h-4 w-10 rounded-full bg-white/30 dark:bg-white/15" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 flex justify-center">
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-neutral-50 px-4 pt-28 pb-12 sm:min-h-svh sm:pt-32 sm:pb-14 dark:bg-neutral-950">
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1">
          <div className="relative z-10 flex flex-col items-center pt-4 text-center sm:pt-8">
            <div className="mb-10 flex flex-col items-center gap-2 sm:mb-14">
              <Skeleton className="h-12 w-48 sm:h-20 sm:w-72" />
              <Skeleton className="h-14 w-64 sm:h-24 sm:w-96" />
              <Skeleton className="h-12 w-40 sm:h-20 sm:w-64" />
            </div>
            <Skeleton className="mb-10 h-6 w-full max-w-md sm:mb-14" />
            <Skeleton className="h-14 w-44 rounded-2xl" />
          </div>

          <div className="relative mt-12 w-full md:mt-16 md:translate-y-5">
            <div className="mx-auto w-full max-w-[54rem]">
              <div className="p-2 sm:p-2.5 md:opacity-72">
                <div className="flex flex-col gap-3">
                  <div className="mx-auto w-full max-w-[41rem]">
                    <Skeleton className="aspect-[16/9] w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="mx-auto h-3 w-36" />
                    <div className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 md:mx-0 md:justify-center md:overflow-visible md:px-0">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={`hero-queue-skeleton-${index}`}
                          className="min-w-[11rem] rounded-xl border border-white/10 bg-white/5 p-1.5 sm:min-w-[12rem] md:min-w-[12.5rem]"
                        >
                          <Skeleton className="aspect-[16/9] w-full rounded-lg" />
                          <div className="space-y-2 px-1 pt-2 pb-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LocationsSectionSkeleton() {
  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <Skeleton className="mx-auto mb-4 h-10 w-48" />
          <Skeleton className="mx-auto h-6 w-full max-w-lg" />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4 rounded-3xl bg-white/50 p-8 dark:bg-white/5">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
