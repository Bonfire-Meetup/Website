import { Skeleton } from "../components/Skeletons";

export default function Loading() {
  return (
    <main className="gradient-bg min-h-screen pb-24">
      <section className="relative">
        <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden sm:h-[80vh] sm:min-h-[600px]">
          <Skeleton className="absolute inset-0 !rounded-none" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-32 sm:px-6 sm:pb-40 lg:px-8 lg:pb-48">
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

            <div className="mt-12 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur sm:mt-16 sm:p-8 lg:p-10 dark:border-white/10 dark:bg-neutral-950/70 dark:shadow-black/20">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end">
                <div className="space-y-3">
                  <Skeleton className="h-8 w-52" />
                  <Skeleton className="h-4 w-72" />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-2xl bg-white/80 px-5 py-4 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10"
                    >
                      <Skeleton className="h-10 w-20" />
                      <Skeleton className="mt-3 h-3 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
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
