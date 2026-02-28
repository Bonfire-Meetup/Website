import { RecordingsRailSkeleton } from "@/components/recordings/RecordingLoadingSkeletons";
import { Skeleton } from "@/components/shared/Skeletons";

function FeaturedSkeleton() {
  return (
    <div className="relative mb-12 min-h-[420px] overflow-hidden rounded-[32px] bg-white/90 shadow-xl ring-1 shadow-black/10 ring-black/5 sm:min-h-0 dark:bg-neutral-950 dark:shadow-black/20 dark:ring-white/10">
      <div className="absolute inset-0 z-0 sm:relative sm:aspect-[16/7] sm:w-full">
        <Skeleton className="absolute inset-0 !rounded-none" />
      </div>

      <div className="absolute top-4 right-6 left-6 z-10 flex gap-2">
        {[1, 2, 3].map((id) => (
          <div
            key={id}
            className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/35 dark:bg-white/20"
          >
            <Skeleton className="h-full w-full !rounded-none bg-white/65 dark:bg-white/35" />
          </div>
        ))}
      </div>

      <div className="absolute right-4 bottom-4 left-4 sm:right-6 sm:bottom-6 sm:left-6">
        <div className="rounded-3xl bg-black/60 p-4 text-white ring-1 ring-white/10 sm:bg-white/85 sm:p-5 sm:text-neutral-900 sm:ring-black/5 dark:sm:bg-black/60 dark:sm:text-white dark:sm:ring-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-4 w-20 rounded-full bg-white/28 sm:bg-neutral-200/85 dark:sm:bg-white/15" />
            <Skeleton className="h-4 w-24 bg-white/35 sm:bg-neutral-300/80 dark:sm:bg-white/20" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-7 w-4/5 bg-white/45 sm:bg-neutral-300/85 dark:sm:bg-white/25" />
            <Skeleton className="h-4 w-full bg-white/35 sm:bg-neutral-200/80 dark:sm:bg-white/20" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton className="h-4 w-16 rounded-full bg-white/25 sm:bg-neutral-200/85 dark:sm:bg-white/15" />
            <Skeleton className="h-4 w-20 rounded-full bg-white/25 sm:bg-neutral-200/85 dark:sm:bg-white/15" />
            <Skeleton className="h-4 w-14 rounded-full bg-white/25 sm:bg-neutral-200/85 dark:sm:bg-white/15" />
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
            {Array.from(
              { length: 3 },
              (_, skeletonIndex) => `section-skeleton-${skeletonIndex}`,
            ).map((skeletonId) => (
              <RecordingsRailSkeleton key={skeletonId} />
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
