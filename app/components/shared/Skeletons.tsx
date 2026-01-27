export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800 ${className}`} />
  );
}

export function TrendingRailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-5 overflow-hidden pt-1 pb-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`rail-skeleton-${index}`}
            className="w-[75vw] shrink-0 sm:w-[45vw] lg:w-[280px] xl:w-[300px]"
          >
            <Skeleton className="aspect-video w-full !rounded-none" />
            <div className="space-y-3 bg-white/85 px-4 pt-4 pb-5 dark:bg-black/75">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
            <div key={i} className="overflow-hidden rounded-3xl bg-white/50 dark:bg-white/5">
              <Skeleton className="aspect-video w-full !rounded-none" />
              <div className="space-y-3 p-6">
                <Skeleton className="h-5 w-3/4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
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
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-neutral-50 px-4 pt-16 pb-20 sm:min-h-[110vh] sm:pt-20 sm:pb-0 dark:bg-neutral-950">
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="relative z-10 flex flex-col items-center text-center">
          <Skeleton className="mb-4 h-4 w-40 sm:mb-8" />
          <div className="mb-6 flex flex-col items-center gap-2 sm:mb-10">
            <Skeleton className="h-12 w-48 sm:h-20 sm:w-72" />
            <Skeleton className="h-14 w-64 sm:h-24 sm:w-96" />
            <Skeleton className="h-12 w-40 sm:h-20 sm:w-64" />
          </div>
          <Skeleton className="mb-8 h-6 w-full max-w-md sm:mb-12" />
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
            <Skeleton className="h-14 w-44 rounded-2xl" />
            <Skeleton className="h-14 w-44 rounded-2xl" />
          </div>
          <div className="mt-10 grid w-full max-w-xl grid-cols-3 gap-4 border-t border-neutral-200 pt-8 sm:mt-20 sm:gap-20 sm:pt-12 dark:border-white/5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-8 w-12 sm:h-12 sm:w-16" />
                <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
              </div>
            ))}
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
