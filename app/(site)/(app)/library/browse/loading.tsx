import { RecordingsGridSkeleton } from "@/components/recordings/RecordingLoadingSkeletons";
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

          <RecordingsGridSkeleton />
        </div>
      </section>
    </main>
  );
}
