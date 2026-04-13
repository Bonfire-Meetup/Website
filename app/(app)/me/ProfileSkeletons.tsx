export function ProfileSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-white/5">
        <div className="h-3 w-20 rounded bg-neutral-200/70 dark:bg-white/10" />
        <div className="h-8 w-8 rounded-full bg-neutral-200/50 dark:bg-white/5" />
      </div>
      <div className="space-y-4 p-5">
        <div>
          <div className="h-2.5 w-12 rounded bg-neutral-200/60 dark:bg-white/10" />
          <div className="mt-2 h-4 w-48 rounded bg-neutral-200/80 dark:bg-white/15" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-2.5 w-16 rounded bg-neutral-200/60 dark:bg-white/10" />
            <div className="mt-2 h-3.5 w-24 rounded bg-neutral-200/70 dark:bg-white/10" />
          </div>
          <div>
            <div className="h-2.5 w-14 rounded bg-neutral-200/60 dark:bg-white/10" />
            <div className="mt-2 h-3.5 w-28 rounded bg-neutral-200/70 dark:bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GuildSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-amber-200/70 bg-linear-to-br from-white via-amber-50/70 to-rose-50/80 shadow-[0_16px_40px_-28px_rgba(251,146,60,0.35)] dark:border-amber-400/20 dark:from-amber-500/10 dark:via-orange-500/8 dark:to-rose-500/8 dark:shadow-none">
      <div className="relative h-full overflow-hidden px-5 py-5">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-amber-200/30 via-orange-200/10 to-transparent dark:from-amber-500/10 dark:via-orange-500/6 dark:to-transparent" />

        <div className="relative flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="h-7 w-36 rounded-full border border-amber-200/70 bg-white/70 dark:border-amber-300/20 dark:bg-white/8" />
            <div className="h-6 w-14 rounded-full bg-amber-100/80 dark:bg-amber-500/10" />
          </div>

          <div className="space-y-3">
            <div className="h-7 w-56 rounded bg-neutral-200/80 dark:bg-white/12" />
            <div className="h-3.5 w-full max-w-[23rem] rounded bg-neutral-200/60 dark:bg-white/10" />
          </div>

          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full bg-amber-200/80 dark:bg-amber-400/20" />
                <div className="h-3.5 w-full rounded bg-neutral-200/60 dark:bg-white/10" />
              </div>
            ))}
          </div>

          <div className="flex-1" />

          <div className="border-t border-black/8 pt-3 dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="h-7 w-24 rounded-full bg-amber-100/85 dark:bg-amber-500/14" />
              <div className="h-8 w-24 rounded-lg bg-white/75 dark:bg-white/8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeaderButtonsSkeleton() {
  return (
    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
      <div className="h-9 w-32 animate-pulse rounded-lg border border-neutral-200/70 bg-white/60 dark:border-white/10 dark:bg-white/5" />
      <div className="h-9 w-32 animate-pulse rounded-lg border border-neutral-200/70 bg-white/60 dark:border-white/10 dark:bg-white/5" />
      <div className="h-9 w-24 animate-pulse rounded-lg border border-neutral-200/70 bg-white/60 dark:border-white/10 dark:bg-white/5" />
    </div>
  );
}

export function PreferencesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-32 animate-pulse rounded bg-neutral-200/60 dark:bg-white/10" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-neutral-200/60 dark:bg-white/10" />
                <div className="h-3 w-48 rounded bg-neutral-200/50 dark:bg-white/10" />
              </div>
              <div className="h-6 w-11 shrink-0 rounded-full bg-neutral-200/50 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SecuritySkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-32 animate-pulse rounded bg-neutral-200/60 dark:bg-white/10" />
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <div className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
            <div className="border-b border-neutral-100 px-4 py-3 dark:border-white/5">
              <div className="h-4 w-36 rounded bg-neutral-200/60 dark:bg-white/10" />
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="h-3 w-32 rounded bg-neutral-200/60 dark:bg-white/10" />
                    <div className="h-3 w-20 rounded bg-neutral-200/50 dark:bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
            <div className="border-b border-neutral-100 px-4 py-3 dark:border-white/5">
              <div className="h-4 w-28 rounded bg-neutral-200/60 dark:bg-white/10" />
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="h-3 w-36 rounded bg-neutral-200/60 dark:bg-white/10" />
                    <div className="h-6 w-6 rounded bg-neutral-200/50 dark:bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-32 animate-pulse rounded bg-neutral-200/60 dark:bg-white/10" />
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <div className="animate-pulse overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-teal-500/10">
            <div className="border-b border-emerald-100 px-4 py-3 dark:border-emerald-500/20">
              <div className="flex items-center justify-between gap-3">
                <div className="h-4 w-32 rounded bg-emerald-200/60 dark:bg-emerald-500/20" />
                <div className="h-3 w-24 rounded bg-emerald-200/50 dark:bg-emerald-500/15" />
              </div>
            </div>
            <div className="p-4">
              <div className="h-9 w-16 rounded bg-emerald-200/60 dark:bg-emerald-500/20" />
              <div className="mt-2 h-3 w-48 rounded bg-emerald-200/50 dark:bg-emerald-500/15" />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
            <div className="border-b border-neutral-100 px-4 py-3 dark:border-white/5">
              <div className="flex items-center justify-between gap-3">
                <div className="h-4 w-32 rounded bg-neutral-200/60 dark:bg-white/10" />
                <div className="h-8 w-8 rounded-full bg-neutral-200/50 dark:bg-white/5" />
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2 dark:bg-white/5"
                  >
                    <div className="space-y-1">
                      <div className="h-3 w-36 rounded bg-neutral-200/60 dark:bg-white/10" />
                      <div className="h-2.5 w-24 rounded bg-neutral-200/50 dark:bg-white/5" />
                    </div>
                    <div className="h-6 w-14 rounded-full bg-neutral-200/50 dark:bg-white/5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
