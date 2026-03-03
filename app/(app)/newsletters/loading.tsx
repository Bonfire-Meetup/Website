import { Skeleton } from "@/components/shared/Skeletons";

function IssueRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
      <Skeleton className="h-3.5 w-7 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-2.5 w-24 rounded-full" />
        <Skeleton className="h-4 w-4/5 rounded-full" />
        <Skeleton className="h-3.5 w-3/5 rounded-full" />
      </div>
      <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
    </div>
  );
}

export default function NewsletterArchiveLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Hero */}
      <section className="px-4 pt-32 pb-14 text-center sm:pt-36 sm:pb-16">
        <div className="mb-4 flex items-center justify-center gap-3">
          <Skeleton className="h-px w-10 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-px w-10 rounded-full" />
        </div>
        <Skeleton className="mx-auto mb-3 h-10 w-3/4 max-w-sm rounded-xl sm:h-12" />
        <Skeleton className="mx-auto h-5 w-2/3 max-w-xs rounded-full" />
      </section>

      {/* Issue list panel */}
      <section className="relative mx-auto max-w-2xl px-4 pb-24 sm:px-6">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {Array.from({ length: 5 }, (_, i) => (
              <IssueRowSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Subscribe CTA */}
        <div className="mt-16">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
            <Skeleton className="h-1 w-full rounded-none" />
            <div className="p-8 text-center sm:p-10">
              <Skeleton className="mx-auto mb-3 h-6 w-48 rounded-lg" />
              <Skeleton className="mx-auto mb-6 h-4 w-64 rounded-full" />
              <Skeleton className="mx-auto h-10 w-72 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
