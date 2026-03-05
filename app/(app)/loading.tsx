import { StaticPageHeroSkeleton } from "@/components/layout/StaticPageHeroSkeleton";
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
      <StaticPageHeroSkeleton
        containerClassName="mx-auto max-w-5xl text-center"
        titleClassName="mx-auto mb-3 h-12 w-64 sm:h-14 sm:w-80"
      />

      <div className="section-divider mx-auto max-w-4xl" />
      <GenericSectionSkeleton />
      <div className="section-divider mx-auto max-w-4xl" />
      <GenericSectionSkeleton className="pt-12" />
    </main>
  );
}
