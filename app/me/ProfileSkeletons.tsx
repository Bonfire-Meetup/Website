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
    <div className="animate-pulse overflow-hidden rounded-3xl border border-neutral-200/70 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-20 rounded bg-neutral-200/60 dark:bg-white/10" />
            <div className="h-4 w-12 rounded-full bg-neutral-200/50 dark:bg-white/10" />
          </div>
          <div className="h-6 w-40 rounded bg-neutral-200/80 dark:bg-white/15" />
          <div className="h-3.5 w-64 rounded bg-neutral-200/60 dark:bg-white/10" />
        </div>
        <div className="h-12 w-12 rounded-2xl bg-neutral-200/50 dark:bg-white/10" />
      </div>
    </div>
  );
}

export function HeaderButtonsSkeleton() {
  return (
    <div className="flex gap-2">
      <div className="h-9 w-28 animate-pulse rounded-lg border border-neutral-200/70 bg-white/60 dark:border-white/10 dark:bg-white/5" />
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
