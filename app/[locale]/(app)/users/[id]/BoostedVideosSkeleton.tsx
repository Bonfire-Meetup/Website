export function BoostedVideosSkeleton() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-emerald-500/5 to-transparent" />

      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/50 backdrop-blur-sm">
        <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-neutral-800" />
            <div className="space-y-2">
              <div className="h-6 w-36 animate-pulse rounded-lg bg-neutral-800" />
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-800/50" />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`boosted-video-skeleton-${index}`}
                className="overflow-hidden rounded-xl border border-white/5 bg-neutral-800/50"
              >
                <div className="aspect-video w-full animate-pulse bg-neutral-800" />
                <div className="space-y-3 p-4">
                  <div className="space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-neutral-700" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-700" />
                  </div>
                  <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
