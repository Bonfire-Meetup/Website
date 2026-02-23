import { Skeleton } from "@/components/shared/Skeleton";

export function RecordingsRailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-5 overflow-hidden pt-1 pb-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`rail-skeleton-${index}`}
            className="relative w-[75vw] shrink-0 overflow-hidden rounded-[24px] bg-white/90 sm:w-[45vw] lg:w-[280px] xl:w-[300px] dark:bg-neutral-950"
          >
            <Skeleton className="aspect-video w-full !rounded-none" />
            <div className="absolute top-3 left-3 h-5 w-20 rounded-full bg-neutral-200/80 dark:bg-white/15" />
            <div className="absolute top-3 right-3 h-5 w-14 rounded-full bg-neutral-200/70 dark:bg-white/10" />
            <div className="space-y-3 bg-white/85 px-4 pt-4 pb-5 dark:bg-black/75">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecordingsGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={`grid-skeleton-${index}`}
          className="relative overflow-hidden rounded-[28px] bg-white/90 dark:bg-neutral-950"
        >
          <Skeleton className="aspect-video w-full !rounded-none" />
          <div className="absolute top-2 left-2 h-5 w-20 rounded-full bg-neutral-200/80 dark:bg-white/15" />
          <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-neutral-200/80 dark:bg-white/15" />
          <div className="space-y-3 bg-white/85 px-5 pt-5 pb-6 dark:bg-black/75">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
