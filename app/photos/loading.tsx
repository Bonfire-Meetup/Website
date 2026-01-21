import { Skeleton } from "../components/Skeletons";

export default function Loading() {
  return (
    <main className="gradient-bg min-h-screen pb-24">
      <section className="relative">
        <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden sm:h-[80vh] sm:min-h-[600px]">
          <Skeleton className="absolute inset-0 z-0 !rounded-none" />
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="flex items-end gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-500 shadow-[0_0_12px_rgba(59,130,246,0.45)] animate-bounce motion-reduce:animate-none dark:bg-brand-400" />
              <span className="h-3 w-3 rounded-full bg-brand-500 shadow-[0_0_14px_rgba(59,130,246,0.5)] animate-bounce [animation-delay:150ms] motion-reduce:animate-none dark:bg-brand-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-500 shadow-[0_0_12px_rgba(59,130,246,0.45)] animate-bounce [animation-delay:300ms] motion-reduce:animate-none dark:bg-brand-400" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-32 sm:px-6 sm:pb-40 lg:px-8 lg:pb-48">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-3xl space-y-4">
                <Skeleton className="h-6 w-40 rounded-full" />
                <Skeleton className="h-12 w-72 sm:h-16 sm:w-96" />
                <Skeleton className="h-5 w-64" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative -mt-20 px-4 sm:-mt-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[3/4] rounded-2xl sm:rounded-3xl" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto mt-20 max-w-4xl" />

      <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-1 rounded-full" />
              <Skeleton className="h-8 w-52" />
            </div>
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10"
              >
                <Skeleton className="h-6 w-10" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
        <section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[24px] bg-white/80">
                <Skeleton className="aspect-[16/10] w-full !rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
