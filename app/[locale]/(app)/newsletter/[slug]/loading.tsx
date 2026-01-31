import { Skeleton } from "@/components/shared/Skeletons";

export default function NewsletterLoading() {
  return (
    <main className="gradient-bg-static relative min-h-screen overflow-hidden px-4 pt-32 pb-24">
      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <Skeleton className="mx-auto mb-6 h-4 w-32 rounded-full" />
          <Skeleton className="mx-auto mb-4 h-10 w-3/4 max-w-md" />
          <Skeleton className="mx-auto h-5 w-48" />
        </div>

        <div className="space-y-10">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`section-skeleton-${index}`} className="space-y-4">
              <Skeleton className="h-7 w-2/3" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
