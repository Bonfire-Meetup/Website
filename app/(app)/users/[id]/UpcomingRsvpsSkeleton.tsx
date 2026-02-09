import { Skeleton } from "@/components/shared/Skeletons";

export function UpcomingRsvpsSkeleton() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-fuchsia-500/5 to-transparent" />

      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-white/5 dark:bg-neutral-900/50">
        <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />

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
              key={`upcoming-rsvp-skeleton-${i}`}
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-white/5 dark:bg-neutral-800/30"
            >
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
