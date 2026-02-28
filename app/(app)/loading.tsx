import { Skeleton } from "@/components/shared/Skeletons";

function GenericSectionSkeleton({ className = "" }: { className?: string }) {
  return (
    <section className={`relative px-4 py-20 sm:px-6 lg:px-8 ${className}`}>
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <Skeleton className="mx-auto mb-4 h-10 w-56" />
          <Skeleton className="mx-auto h-5 w-full max-w-xl" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((id) => (
            <div
              key={id}
              className="space-y-3 rounded-2xl border border-black/8 bg-white/55 p-5 dark:border-white/10 dark:bg-white/5"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AppSegmentLoading() {
  return (
    <main className="relative">
      <section className="relative px-4 pt-24 pb-10 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <Skeleton className="mx-auto mb-4 h-3 w-36" />
          <Skeleton className="mx-auto mb-3 h-12 w-64 sm:h-14 sm:w-80" />
          <Skeleton className="mx-auto h-5 w-full max-w-2xl" />
        </div>
      </section>

      <div className="section-divider mx-auto max-w-4xl" />
      <GenericSectionSkeleton />
      <div className="section-divider mx-auto max-w-4xl" />
      <GenericSectionSkeleton className="pt-12" />
    </main>
  );
}
