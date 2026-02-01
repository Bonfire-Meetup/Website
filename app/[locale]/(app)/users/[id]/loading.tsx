import { Skeleton } from "@/components/shared/Skeletons";

export default function UserProfileLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <div className="relative px-4 pt-24 pb-20 sm:px-6 sm:pt-32 lg:px-8 lg:pt-40">
        <div className="mx-auto max-w-5xl">
          <div className="relative mb-12 sm:mb-16">
            <div className="flex flex-col items-center lg:flex-row lg:items-start lg:gap-12">
              <div className="relative mb-8 lg:mb-0">
                <Skeleton className="h-[180px] w-[180px] rounded-full" />
              </div>
              <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
                <Skeleton className="mb-2 h-8 w-48" />
                <Skeleton className="mb-4 h-4 w-32" />
                <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                  <Skeleton className="h-10 w-28 rounded-xl" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/50">
              <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={`boosted-skeleton-${i}`}
                      className="overflow-hidden rounded-xl bg-neutral-800/50"
                    >
                      <Skeleton className="aspect-video w-full !rounded-none" />
                      <div className="space-y-3 p-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 dark:border-white/5 dark:bg-neutral-900/50">
              <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
              <div className="space-y-3 p-4 sm:p-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={`event-skeleton-${i}`}
                    className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-white/5 dark:bg-neutral-800/30"
                  >
                    <Skeleton className="mb-2 h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
