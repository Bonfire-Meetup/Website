import { InfoIcon, QrCodeIcon } from "@/components/shared/Icons";
import { Skeleton } from "@/components/shared/Skeletons";

const TICKET_HEADER_PANEL_CLASS =
  "mx-auto w-full max-w-[14rem] rounded-[1.15rem] border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_18px_40px_-28px_rgba(120,53,15,0.45)] backdrop-blur-md sm:max-w-[17rem] sm:rounded-[1.5rem] sm:px-5 sm:py-4 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_-28px_rgba(0,0,0,0.5)]";

function TicketQrSkeleton() {
  return (
    <div className="relative rounded-[1.75rem] border border-white/45 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.78),rgba(255,255,255,0.56)_34%,rgba(255,244,238,0.44)_62%,rgba(255,255,255,0.28)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.42),0_24px_55px_-34px_rgba(15,23,42,0.38)] backdrop-blur-xl dark:border-white/12 dark:bg-[radial-gradient(circle_at_top,rgba(80,80,88,0.34),rgba(34,34,38,0.3)_38%,rgba(14,14,18,0.22)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(255,255,255,0.03),0_24px_55px_-34px_rgba(0,0,0,0.55)]">
      <div className="mb-3 flex items-center justify-between rounded-full border border-white/45 bg-white/36 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl dark:border-white/10 dark:bg-white/8 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <Skeleton className="h-2 w-10 rounded-full" />
        <QrCodeIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
      </div>
      <div className="relative h-80 w-80 overflow-hidden rounded-[1.25rem] border border-white/45 bg-white/56 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_20px_44px_-34px_rgba(15,23,42,0.22)] backdrop-blur-md dark:border-white/10 dark:bg-white/7 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_44px_-34px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 grid grid-cols-8 gap-2 p-3">
          {Array.from({ length: 64 }, (_, skeletonIndex) => skeletonIndex).map((skeletonIndex) => (
            <Skeleton
              key={`check-in-qr-${skeletonIndex}`}
              className="rounded-sm bg-neutral-300 dark:bg-neutral-600"
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-8 top-3 h-8 rounded-full bg-white/35 blur-xl dark:bg-white/8" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-lg border border-white/40 bg-white/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md dark:border-white/10 dark:bg-white/8 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
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
          <div className="relative overflow-hidden rounded-[2rem] border border-white/45 bg-white/28 shadow-[0_40px_120px_-52px_rgba(15,23,42,0.58)] ring-1 ring-white/55 backdrop-blur-2xl dark:border-white/8 dark:bg-neutral-950/24 dark:ring-white/8">
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.72),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.3),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.24),transparent_46%,rgba(255,255,255,0.08)_68%,transparent_82%)] dark:bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.08),transparent_26%),radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.04),transparent_18%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_44%,rgba(255,255,255,0.015)_70%,transparent_84%)]" />
            <div className="pointer-events-none absolute inset-[1px] rounded-[calc(2rem-1px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.26),transparent_18%,transparent_78%,rgba(255,255,255,0.12)_100%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_18%,transparent_82%,rgba(255,255,255,0.02)_100%)]" />
            <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,248,240,0.34)_45%,rgba(255,255,255,0.22)_100%)] backdrop-blur-2xl dark:bg-[linear-gradient(180deg,rgba(24,24,28,0.3)_0%,rgba(12,12,14,0.2)_48%,rgba(6,6,8,0.14)_100%)]">
              <div className="relative h-30 bg-gradient-to-br from-rose-700 via-orange-500 to-red-600 sm:h-32">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.22),transparent_24%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.18)_35%,transparent_52%,rgba(255,255,255,0.08)_68%,transparent_100%)]" />
                <div className="absolute inset-x-0 bottom-0 h-px bg-white/30" />
                <div className="absolute -top-4 right-5 h-14 w-14 rounded-full bg-white/16 blur-2xl sm:-top-6 sm:right-6 sm:h-20 sm:w-20 dark:bg-white/6" />
                <div className="absolute bottom-3 left-6 h-10 w-16 rounded-full bg-amber-200/18 blur-2xl sm:bottom-2 sm:left-8 sm:h-14 sm:w-24 dark:bg-orange-300/8" />
                <div className="relative flex h-full flex-col justify-center px-4 py-3 sm:px-6 sm:py-5">
                  <div className={TICKET_HEADER_PANEL_CLASS}>
                    <div className="mb-1.5 flex items-center justify-center gap-2 sm:mb-2">
                      <Skeleton className="h-px w-4 bg-white/35 sm:w-6 dark:bg-white/15" />
                      <Skeleton className="h-2.5 w-20 bg-white/25 sm:h-4 sm:w-28 dark:bg-white/20" />
                      <Skeleton className="h-px w-4 bg-white/35 sm:w-6 dark:bg-white/15" />
                    </div>
                    <Skeleton className="mx-auto h-6 w-30 bg-white/30 sm:h-8 sm:w-40 dark:bg-white/20" />
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
                <div className="rounded-2xl border border-white/40 bg-white/34 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_18px_38px_-34px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-white/7 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_38px_-34px_rgba(0,0,0,0.45)]">
                  <Skeleton className="h-5 w-40" />
                </div>

                <div className="rounded-2xl border border-white/38 bg-white/24 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_18px_38px_-34px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-white/6 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_38px_-34px_rgba(0,0,0,0.42)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Skeleton className="mb-2 h-3 w-20" />
                      <Skeleton className="h-5 w-44" />
                      <Skeleton className="mt-2 h-3 w-40" />
                    </div>
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-[1.35rem] border border-white/28 bg-white/18 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] backdrop-blur-xl dark:border-white/10 dark:bg-white/4 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-14" />
                </div>
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
