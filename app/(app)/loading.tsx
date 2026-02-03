import {
  EventsSectionSkeleton,
  HeroSkeleton,
  RecordingsSectionSkeleton,
  Skeleton,
} from "@/components/shared/Skeletons";

export default function HomeLoading() {
  return (
    <main id="top" className="relative">
      <HeroSkeleton />

      <EventsSectionSkeleton />

      <div className="section-divider mx-auto max-w-4xl" />

      <RecordingsSectionSkeleton />

      <div className="section-divider mx-auto max-w-4xl" />

      <section className="relative px-4 py-28 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <Skeleton className="mx-auto mb-4 h-10 w-48" />
            <Skeleton className="mx-auto h-6 w-full max-w-lg" />
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-4xl" />

      <section className="relative px-4 py-28 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <Skeleton className="mx-auto mb-4 h-10 w-48" />
            <Skeleton className="mx-auto h-6 w-full max-w-lg" />
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-4xl" />
    </main>
  );
}
