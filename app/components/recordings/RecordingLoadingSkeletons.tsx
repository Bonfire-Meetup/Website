import { Skeleton } from "@/components/shared/Skeleton";

export function RecordingsRailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-6 overflow-hidden py-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`rail-skeleton-${index}`}
            className="relative w-[88vw] shrink-0 overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,rgba(249,250,251,0.98)_0%,rgba(229,231,235,0.98)_100%)] shadow-[0_16px_30px_-20px_rgba(17,24,39,0.35)] ring-1 ring-black/10 sm:w-[70vw] lg:w-[calc((100%-3rem-1px)/3)] xl:w-[calc((100%-3rem-1px)/3)] dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:shadow-[0_18px_38px_-18px_rgba(0,0,0,0.9)] dark:ring-white/12"
          >
            <Skeleton className="aspect-video w-full !rounded-none" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/62 via-black/28 via-62% to-transparent dark:from-black/70 dark:via-black/34" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/18 to-transparent dark:from-white/6" />
            <div className="absolute top-2 left-2 h-5 w-20 rounded-full bg-neutral-200/80 dark:bg-white/15" />
            <div className="absolute top-3 right-3 h-5 w-14 rounded-full bg-neutral-200/70 dark:bg-white/10" />
            <div className="absolute inset-0 flex items-end">
              <div className="w-full space-y-2 bg-gradient-to-t from-black/68 via-black/30 to-transparent px-3.5 pt-12 pb-3.5 dark:from-black/82 dark:via-black/48">
                <Skeleton className="h-3 w-24 bg-white/35 dark:bg-white/20" />
                <Skeleton className="h-4 w-3/4 bg-white/45 dark:bg-white/25" />
                <Skeleton className="h-3 w-2/3 bg-white/35 dark:bg-white/20" />
                <div className="flex gap-1 pt-0.5">
                  <Skeleton className="h-4 w-12 rounded-full bg-white/30 dark:bg-white/15" />
                  <Skeleton className="h-4 w-10 rounded-full bg-white/30 dark:bg-white/15" />
                </div>
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
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={`grid-skeleton-${index}`}
          className="relative overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,rgba(249,250,251,0.98)_0%,rgba(229,231,235,0.98)_100%)] shadow-[0_16px_30px_-20px_rgba(17,24,39,0.35)] ring-1 ring-black/10 dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:shadow-[0_18px_38px_-18px_rgba(0,0,0,0.9)] dark:ring-white/12"
        >
          <Skeleton className="aspect-video w-full !rounded-none" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/62 via-black/28 via-62% to-transparent dark:from-black/70 dark:via-black/34" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/18 to-transparent dark:from-white/6" />
          <div className="absolute top-2 left-2 h-5 w-20 rounded-full bg-neutral-200/80 dark:bg-white/15" />
          <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-neutral-200/80 dark:bg-white/15" />
          <div className="absolute inset-0 flex items-end">
            <div className="w-full space-y-2 bg-gradient-to-t from-black/72 via-black/34 to-transparent px-4 pt-14 pb-4 dark:from-black/86 dark:via-black/52">
              <Skeleton className="h-3 w-24 bg-white/35 dark:bg-white/20" />
              <Skeleton className="h-4 w-3/4 bg-white/45 dark:bg-white/25" />
              <Skeleton className="h-3 w-2/3 bg-white/35 dark:bg-white/20" />
              <div className="flex gap-1 pt-0.5">
                <Skeleton className="h-4 w-12 rounded-full bg-white/30 dark:bg-white/15" />
                <Skeleton className="h-4 w-10 rounded-full bg-white/30 dark:bg-white/15" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
