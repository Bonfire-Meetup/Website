function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800 ${className}`} />
  );
}

function VideoCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px] bg-white/90 shadow-xl shadow-black/5 ring-1 ring-black/5 dark:bg-neutral-950 dark:shadow-black/10 dark:ring-white/10">
      <Skeleton className="aspect-video w-full !rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function LibraryLoading() {
  return (
    <div className="gradient-bg min-h-screen pt-24">
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <Skeleton className="mx-auto mb-4 h-4 w-32" />
          <Skeleton className="mx-auto mb-4 h-12 w-64 sm:w-96" />
          <Skeleton className="mx-auto h-6 w-full max-w-2xl" />
        </div>

        <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        <div className="mb-12 overflow-hidden rounded-[32px] bg-white/90 shadow-2xl shadow-black/10 ring-1 ring-black/5 dark:bg-neutral-950 dark:shadow-black/20 dark:ring-white/10">
          <div className="relative aspect-[16/7] w-full">
            <Skeleton className="absolute inset-0 !rounded-none" />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
