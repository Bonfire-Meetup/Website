import { Skeleton } from "@/components/shared/Skeletons";

export default function NewsletterLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 px-4 pt-32 pb-24 dark:bg-neutral-950">
      <div className="relative z-10 mx-auto max-w-2xl">
        {/* Top bar */}
        <div className="mb-10 flex items-center justify-between">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>

        {/* Header */}
        <div className="mb-12">
          <Skeleton className="mx-auto mb-4 h-3 w-24 rounded-full" />
          <Skeleton className="mb-2 h-9 w-full rounded-lg" />
          <Skeleton className="mb-4 h-9 w-2/3 rounded-lg" />
          <Skeleton className="h-5 w-4/5 rounded-full" />
          <Skeleton className="mt-2 h-3.5 w-32 rounded-full" />
        </div>

        {/* First section — with image placeholder */}
        <div>
          <Skeleton className="mb-8 h-52 w-full rounded-2xl" />
          <Skeleton className="mb-5 h-8 w-4/5 rounded-lg" />
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-3/5 rounded-full" />
          </div>
        </div>

        {/* Second section */}
        <div className="mt-12 border-t border-neutral-200 pt-12 dark:border-neutral-800">
          <Skeleton className="mb-2 h-2.5 w-16 rounded-full" />
          <Skeleton className="mb-4 h-7 w-3/4 rounded-lg" />
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-2/3 rounded-full" />
          </div>
        </div>

        {/* Third section */}
        <div className="mt-12 border-t border-neutral-200 pt-12 dark:border-neutral-800">
          <Skeleton className="mb-2 h-2.5 w-16 rounded-full" />
          <Skeleton className="mb-4 h-7 w-1/2 rounded-lg" />
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-4/5 rounded-full" />
          </div>
        </div>

        {/* Bottom nav */}
        <div className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <Skeleton className="h-4 w-32 rounded-full" />
        </div>
      </div>
    </main>
  );
}
