import { Skeleton } from "@/components/shared/Skeletons";

function FeaturedSkeleton() {
  return (
    <div className="relative mb-12 overflow-hidden rounded-[32px] bg-white/90 shadow-xl shadow-black/10 ring-1 ring-black/5 dark:bg-neutral-950 dark:shadow-black/20 dark:ring-white/10">
      <div className="relative aspect-[16/7] w-full">
        <Skeleton className="absolute inset-0 !rounded-none" />
      </div>
      <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
        <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-black/5 dark:bg-black/60 dark:ring-white/10 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LibraryLoading() {
  return (
    <div className="gradient-bg min-h-screen pt-24">
      <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-2 sm:mb-6" />
          <FeaturedSkeleton />

          <div className="flex justify-center">
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>

          <div className="mt-10 space-y-12">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="flex gap-5 overflow-hidden pb-4 pt-1">
                  {Array.from({ length: 4 }).map((_, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="w-[75vw] shrink-0 sm:w-[45vw] lg:w-[280px] xl:w-[300px]"
                    >
                      <Skeleton className="aspect-video w-full !rounded-none" />
                      <div className="space-y-3 bg-white/85 px-4 pb-5 pt-4 dark:bg-black/75">
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
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>

          <div className="mt-20 flex justify-center">
            <div className="glass-card no-hover-pop relative inline-flex items-center gap-4 px-6 py-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
