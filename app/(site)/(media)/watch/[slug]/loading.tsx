function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800 ${className}`} />
  );
}

function RelatedRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3">
      <Skeleton className="h-20 w-16 shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
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
          <div className="min-w-0 space-y-4">
            <div className="hidden items-center justify-between lg:flex">
              <Skeleton className="h-9 w-40 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>

            <div className="surface shadow-floating dark:shadow-floating overflow-hidden">
              <div className="p-2 sm:p-3">
                <Skeleton className="mx-auto aspect-video w-full max-w-[max(18rem,calc((100dvh-8.5rem)*16/9))] rounded-xl md:max-w-[max(18rem,calc((100dvh-8rem)*16/9))]" />
              </div>

              <div className="space-y-4 px-5 pt-4 pb-5 sm:px-6 sm:pt-5">
                <Skeleton className="h-8 w-3/4" />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-7 w-32 rounded-full" />
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-28 rounded-full" />
                  </div>
                  <Skeleton className="h-7 w-36 rounded-full" />
                </div>
              </div>

              <div className="border-y border-neutral-200/40 px-4 pt-4 pb-12 sm:px-6 dark:border-neutral-700/40">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Skeleton className="h-10 w-56 rounded-full" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-5 py-5 sm:px-6">
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>

          <section className="lg:sticky lg:top-20 lg:self-start">
            <div className="surface shadow-floating dark:shadow-floating p-2.5">
              <Skeleton className="mt-2.5 mb-2 ml-3 h-3.5 w-32" />
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
                {Array.from({ length: 7 }, (_, index) => `related-skeleton-${index}`).map((id) => (
                  <RelatedRowSkeleton key={id} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
