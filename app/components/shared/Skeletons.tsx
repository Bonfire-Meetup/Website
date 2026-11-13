import { HERO_VARIANT } from "@/components/layout/hero-variant";
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
            <div key={i} className="space-y-4 rounded-2xl bg-white/50 p-6 dark:bg-white/5">
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
              className="shadow-soft dark:shadow-raised relative overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,rgba(249,250,251,0.98)_0%,rgba(229,231,235,0.98)_100%)] ring-1 ring-black/10 dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:ring-white/12"
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

function HeroTalkSelectSkeleton() {
  return (
    <section className="relative overflow-clip bg-neutral-50 px-4 pt-[5.5rem] pb-14 sm:px-6 sm:pt-32 sm:pb-16 lg:px-8 lg:pt-[clamp(7.5rem,16vh,16rem)] lg:pb-[clamp(5rem,9vh,8rem)] dark:bg-neutral-950">
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <Skeleton className="mb-5 h-3 w-36" />
            <div className="flex flex-col items-start gap-2">
              <Skeleton className="h-12 w-44 sm:h-20 sm:w-72" />
              <Skeleton className="h-12 w-64 sm:h-20 sm:w-[28rem]" />
              <Skeleton className="h-12 w-40 sm:h-20 sm:w-60" />
            </div>
          </div>
          <div className="w-full lg:w-[27rem] lg:shrink-0 lg:pb-1.5">
            <Skeleton className="h-12 w-full max-w-lg lg:h-20" />
            <Skeleton className="mt-5 h-9 w-full rounded-2xl sm:w-80" />
            <div className="mt-6 flex gap-3">
              <Skeleton className="h-12 w-52 rounded-2xl" />
              <Skeleton className="h-12 w-32 rounded-2xl" />
            </div>
          </div>
        </div>
        <div className="mt-10 rounded-[30px] border border-black/10 bg-white/40 p-3 backdrop-blur-xl sm:p-4 lg:mt-[clamp(2.75rem,6vh,6.5rem)] dark:border-white/10 dark:bg-black/30">
          <Skeleton className="mb-3 ml-1 h-3.5 w-32" />
          <div className="flex gap-2.5 overflow-hidden pb-3 lg:h-[clamp(15rem,min(30vw,44vh),23rem)] lg:pb-0">
            <Skeleton className="aspect-video w-[86%] shrink-0 rounded-2xl sm:w-[64%] lg:aspect-auto lg:h-full lg:w-auto lg:flex-[0_1_calc(clamp(15rem,min(30vw,44vh),23rem)*16/9)]" />
            {Array.from({ length: 4 }, (_, i) => `hero-tile-skeleton-${i}`).map((id) => (
              <Skeleton
                key={id}
                className="aspect-video w-[86%] shrink-0 rounded-2xl sm:w-[64%] lg:aspect-auto lg:h-full lg:w-auto lg:flex-1"
              />
            ))}
          </div>
          <div className="surface mt-3 flex flex-col gap-4 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-6 w-64 sm:w-96" />
            </div>
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  if (HERO_VARIANT === "talk-select") {
    return <HeroTalkSelectSkeleton />;
  }

  return (
    <section className="relative overflow-hidden bg-neutral-50 px-4 pt-[4.9rem] pb-[4.8rem] sm:px-6 sm:pt-[11rem] sm:pb-[5.4rem] lg:px-8 lg:pt-[16.2rem] lg:pb-[8.8rem] dark:bg-neutral-950">
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-[2.9rem] lg:grid-cols-[0.95fr_1.05fr] lg:gap-[3.4rem]">
          <div className="relative min-w-0">
            <div className="mx-auto w-full max-w-2xl min-w-0 lg:mx-0">
              <Skeleton className="mb-5 h-3 w-36" />
              <div className="mb-7 flex flex-col items-center gap-1 lg:items-start">
                <Skeleton className="h-12 w-48 sm:h-16 sm:w-64" />
                <Skeleton className="h-14 w-64 sm:h-20 sm:w-88" />
                <Skeleton className="h-12 w-44 sm:h-16 sm:w-60" />
              </div>
              <Skeleton className="mb-8 h-5 w-full max-w-xl" />
              <div className="mb-8 grid grid-cols-3 gap-2.5 sm:gap-3.5">
                {[1, 2, 3].map((id) => (
                  <div key={id} className="surface px-3 py-2.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="mt-2 h-6 w-10" />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Skeleton className="h-12 w-44 rounded-2xl" />
                <Skeleton className="h-12 w-32 rounded-2xl" />
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="relative min-w-0 overflow-hidden rounded-[30px] border border-black/10 bg-white/40 p-3 backdrop-blur-xl sm:p-4 dark:border-white/10 dark:bg-black/30">
              <div className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-black/12 dark:border-white/12">
                  <Skeleton className="aspect-[16/9] w-full !rounded-none" />
                  <div className="border-t border-black/10 bg-white/66 px-3 py-2.5 sm:px-4 dark:border-white/10 dark:bg-black/28">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-8 w-24 rounded-full" />
                      <div className="flex gap-1">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="surface p-2.5">
                  <Skeleton className="mx-auto h-3 w-24" />
                  <Skeleton className="mx-auto mt-1 h-3 w-28 sm:hidden" />
                  <div className="no-scrollbar mt-2 flex w-full min-w-0 gap-2 overflow-x-auto pb-1 lg:overflow-visible">
                    {Array.from({ length: 3 }, (_, i) => `hero-queue-skeleton-${i}`).map((id) => (
                      <div
                        key={id}
                        className="flex min-w-[13.5rem] basis-[13.5rem] items-center gap-2 rounded-xl border border-black/10 bg-white/60 p-2 sm:min-w-[14.5rem] sm:basis-[14.5rem] lg:min-w-0 lg:flex-1 lg:basis-0 dark:border-white/10 dark:bg-black/24"
                      >
                        <Skeleton className="h-14 w-20 rounded-lg" />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3.5 w-full" />
                          <Skeleton className="h-3.5 w-5/6" />
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
            <div key={i} className="space-y-4 rounded-2xl bg-white/50 p-8 dark:bg-white/5">
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
