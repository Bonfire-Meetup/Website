import { Skeleton } from "@/components/shared/Skeletons";

export default function LibraryBrowseLoading() {
  return (
    <main className="gradient-bg min-h-screen pt-24">
      <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-2 sm:mb-6" />

          <div className="glass relative z-10 mb-8 rounded-2xl px-4 py-3">
            <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap lg:gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
                <Skeleton className="h-8 w-14 rounded-full" />
              </div>
              <Skeleton className="h-8 w-40 rounded-lg" />
              <Skeleton className="h-8 w-64 rounded-lg" />
              <Skeleton className="h-8 min-w-[220px] flex-1 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>

          <div className="section-divider mb-8" />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`grid-skeleton-${index}`} className="overflow-hidden rounded-[28px]">
                <Skeleton className="aspect-video w-full !rounded-none" />
                <div className="space-y-3 bg-white/85 px-5 pt-5 pb-6 dark:bg-black/75">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
