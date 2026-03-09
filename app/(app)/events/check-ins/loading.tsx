import { InfoIcon, QrCodeIcon } from "@/components/shared/Icons";
import { Skeleton } from "@/components/shared/Skeletons";

function TicketQrSkeleton() {
  return (
    <div className="relative rounded-[1.75rem] border border-neutral-200/80 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(245,245,245,0.94)_58%,rgba(229,229,229,0.95)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(229,231,235,0.9),0_18px_45px_-28px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top,rgba(38,38,38,0.98),rgba(23,23,23,0.96)_58%,rgba(10,10,10,0.98)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(255,255,255,0.04),0_18px_45px_-28px_rgba(0,0,0,0.8)]">
      <div className="mb-3 flex items-center justify-between rounded-full border border-black/5 bg-white/70 px-3 py-1.5 dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(38,38,38,0.92)_0%,rgba(23,23,23,0.9)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <Skeleton className="h-2 w-10 rounded-full" />
        <QrCodeIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
      </div>
      <div className="relative h-64 w-64 overflow-hidden rounded-[1.25rem] border border-black/5 bg-neutral-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.98)_0%,rgba(9,9,11,0.98)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_50px_-36px_rgba(0,0,0,0.95)]">
        <div className="absolute inset-0 grid grid-cols-8 gap-2 p-3">
          {Array.from({ length: 64 }, (_, skeletonIndex) => skeletonIndex).map((skeletonIndex) => (
            <Skeleton
              key={`check-in-qr-${skeletonIndex}`}
              className="rounded-sm bg-neutral-300 dark:bg-neutral-600"
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-lg bg-white/80 p-3 backdrop-blur-sm dark:bg-neutral-900/80">
            <QrCodeIcon className="h-10 w-10 text-neutral-400 dark:text-neutral-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckInLoading() {
  return (
    <main className="gradient-bg-static min-h-screen px-4 pt-20 pb-20 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-md">
          <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white/85 shadow-[0_32px_90px_-38px_rgba(15,23,42,0.5)] ring-1 ring-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/85 dark:ring-white/10">
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.22),transparent_45%,rgba(255,255,255,0.08)_65%,transparent_78%)]" />
            <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,247,237,0.92)_100%)] dark:bg-[linear-gradient(180deg,rgba(23,23,23,0.98)_0%,rgba(10,10,10,0.98)_100%)]">
              <div className="relative h-30 bg-gradient-to-br from-rose-700 via-orange-500 to-red-600 sm:h-32">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.22),transparent_24%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.18)_35%,transparent_52%,rgba(255,255,255,0.08)_68%,transparent_100%)]" />
                <div className="absolute inset-x-0 bottom-0 h-px bg-white/30" />
                <div className="relative flex h-full flex-col justify-center px-5 py-4 sm:justify-between sm:px-6 sm:py-5">
                  <div className="hidden items-center justify-between sm:flex">
                    <Skeleton className="h-6 w-24 rounded-full bg-white/25 dark:bg-white/20" />
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-2 w-2 rounded-full bg-white/80 dark:bg-white/35" />
                      <Skeleton className="h-2 w-2 rounded-full bg-white/50 dark:bg-white/25" />
                      <Skeleton className="h-2 w-2 rounded-full bg-white/30 dark:bg-white/20" />
                    </div>
                  </div>

                  <div className="text-center sm:pt-1">
                    <Skeleton className="mx-auto mb-1 h-3 w-24 bg-white/25 sm:mb-3 sm:h-4 sm:w-28 dark:bg-white/20" />
                    <Skeleton className="mx-auto h-7 w-36 bg-white/30 sm:h-8 sm:w-40 dark:bg-white/20" />
                  </div>

                  <div className="mt-3 hidden items-center justify-between sm:flex">
                    <Skeleton className="h-3 w-16 bg-white/25 dark:bg-white/20" />
                    <Skeleton className="h-3 w-14 bg-white/25 dark:bg-white/20" />
                  </div>
                </div>
              </div>

              <div className="relative px-6 pt-6 pb-5">
                <div className="absolute top-0 left-0 h-24 w-24 rounded-full bg-orange-300/10 blur-3xl dark:bg-orange-500/10" />
                <div className="absolute right-0 bottom-0 h-20 w-20 rounded-full bg-rose-300/10 blur-3xl dark:bg-rose-500/10" />
                <div className="absolute top-1/2 -left-4 h-8 w-8 -translate-y-1/2 rounded-full border border-black/5 bg-neutral-50 shadow-inner dark:border-white/10 dark:bg-neutral-950" />
                <div className="absolute top-1/2 -right-4 h-8 w-8 -translate-y-1/2 rounded-full border border-black/5 bg-neutral-50 shadow-inner dark:border-white/10 dark:bg-neutral-950" />
                <div className="absolute inset-x-6 top-0 border-t border-dashed border-neutral-200 dark:border-neutral-700" />

                <div className="flex flex-col items-center">
                  <TicketQrSkeleton />
                </div>
              </div>

              <div className="space-y-4 px-6 pt-1 pb-6">
                <div className="rounded-2xl border border-black/5 bg-white/72 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-sm dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(32,32,36,0.92)_0%,rgba(18,18,20,0.92)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_40px_-34px_rgba(0,0,0,0.9)]">
                  <Skeleton className="h-5 w-40" />
                </div>

                <Skeleton className="h-12 w-full rounded-2xl bg-gradient-to-r from-rose-700/80 via-orange-500/80 to-red-600/80" />
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 shadow-sm dark:border-neutral-700/50 dark:bg-neutral-900/50">
            <div className="border-b border-neutral-200/70 px-4 py-3 dark:border-neutral-700/50">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="space-y-3 px-4 py-4">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={`tip-skeleton-${index}`} className="flex gap-3">
                  <span className="text-neutral-400 dark:text-neutral-600">•</span>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
