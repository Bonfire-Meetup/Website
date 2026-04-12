import { getLocale, getTranslations } from "next-intl/server";

import { BoltIcon } from "@/components/shared/Icons";
import { Link } from "@/i18n/navigation";
import { getUserBoosts } from "@/lib/data/boosts";
import type { CatalogRecording } from "@/lib/recordings/catalog-types";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { BoostedVideosList } from "./BoostedVideosList";
import { OwnerOnlyAction } from "./OwnerOnlyAction";

interface BoostedVideosProps {
  userId: string;
  profileUserId: string;
}

export async function BoostedVideos({ userId, profileUserId }: BoostedVideosProps) {
  const t = await getTranslations("account.userProfile");
  const locale = await getLocale();

  let recordings: CatalogRecording[];

  try {
    const boosts = await getUserBoosts(userId);
    const allRecordings = getAllRecordings();
    const recordingMap = new Map(allRecordings.map((r) => [r.shortId, r]));

    recordings = boosts
      .map((boost) => recordingMap.get(boost.videoId))
      .filter((r): r is (typeof allRecordings)[number] => r !== undefined);
  } catch {
    recordings = [];
  }

  return (
    <section
      className="relative"
      role="region"
      aria-labelledby="profile-boosted-videos-heading"
      aria-describedby="profile-boosted-videos-count"
    >
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-emerald-500/5 to-transparent" />

      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-white/5 dark:bg-neutral-900/50">
        <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/30 blur-lg" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
                <BoltIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>
            <div>
              <h2
                id="profile-boosted-videos-heading"
                className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl dark:text-white"
              >
                {t("boosted.title")}
              </h2>
              <p id="profile-boosted-videos-count" className="text-sm text-neutral-500">
                {t("boosted.count", { count: recordings.length })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {recordings.length > 0 ? (
            <BoostedVideosList
              recordings={recordings}
              locale={locale}
              badgeLabel={t("boosted.badge")}
            />
          ) : (
            <div
              className="rounded-xl border border-dashed border-emerald-500/25 bg-emerald-500/5 p-5 text-sm"
              role="status"
              aria-live="polite"
            >
              <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                {t("boosted.empty")}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {t("boosted.emptyHint")}
              </p>
              <OwnerOnlyAction profileUserId={profileUserId}>
                <div className="mt-3">
                  <Link
                    href={PAGE_ROUTES.LIBRARY_BROWSE}
                    className="inline-flex items-center rounded-lg border border-emerald-500/30 bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 focus-visible:outline-none dark:bg-neutral-900/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10 dark:focus-visible:ring-offset-neutral-900"
                  >
                    {t("boosted.cta")}
                  </Link>
                </div>
              </OwnerOnlyAction>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
