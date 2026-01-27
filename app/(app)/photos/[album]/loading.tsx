import { Skeleton } from "@/components/shared/Skeletons";

export default function AlbumLoading() {
  return (
    <main className="gradient-bg min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="hidden items-center lg:flex">
          <Skeleton className="h-8 w-36 rounded-full" />
        </div>
        <div className="glass-card no-hover-pop overflow-hidden">
          <Skeleton className="aspect-[16/9] w-full !rounded-none" />
          <div className="space-y-4 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`album-skeleton-${index}`} className="aspect-[4/3] w-full" />
          ))}
        </div>
      </div>
    </main>
  );
}
