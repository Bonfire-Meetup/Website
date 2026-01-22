"use client";

type BoostedRecording = {
  shortId: string;
  title: string;
  speaker: string[];
  date: string;
  slug: string;
};

type BoostedVideosBlockProps = {
  title: string;
  emptyLabel: string;
  errorLabel: string;
  removeLabel: string;
  loading: boolean;
  error: string | null;
  items: BoostedRecording[];
  onRemove: (shortId: string) => void;
};

export function BoostedVideosBlock({
  title,
  emptyLabel,
  errorLabel,
  removeLabel,
  loading,
  error,
  items,
  onRemove,
}: BoostedVideosBlockProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
      <div className="border-b border-neutral-100 px-4 py-3 dark:border-white/5">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`boost-skeleton-${index}`}
                className="flex animate-pulse items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5 dark:bg-white/5"
              >
                <div className="space-y-1.5">
                  <div className="h-3 w-36 rounded bg-neutral-200/70 dark:bg-white/10" />
                  <div className="h-2.5 w-24 rounded bg-neutral-200/50 dark:bg-white/5" />
                </div>
                <div className="h-6 w-14 rounded bg-neutral-200/50 dark:bg-white/5" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {errorLabel}
          </div>
        ) : items.length === 0 ? (
          <div className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {emptyLabel}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((boost) => (
              <div
                key={boost.shortId}
                className="group flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2.5 transition hover:bg-neutral-100 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div className="min-w-0">
                  <a
                    href={`/watch/${boost.slug}`}
                    className="block truncate text-sm font-medium text-neutral-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-300"
                  >
                    {boost.title}
                  </a>
                  <div className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {boost.speaker.join(", ")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(boost.shortId)}
                  className="shrink-0 cursor-pointer rounded-lg px-2 py-1 text-xs text-neutral-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                >
                  {removeLabel}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
