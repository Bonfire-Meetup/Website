import { getLocale, getTranslations } from "next-intl/server";

import { CalendarIcon, MapPinIcon, SparklesIcon, TicketIcon } from "@/components/shared/Icons";
import { Link } from "@/i18n/navigation";
import { getAuthUserById } from "@/lib/data/auth";
import { getUpcomingRsvpEvents, type UpcomingRsvpEvent } from "@/lib/data/profile-events";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatShortDateUTC } from "@/lib/utils/locale";

import { OwnerOnlyAction } from "./OwnerOnlyAction";

interface UpcomingRsvpsProps {
  userId: string;
  profileUserId: string;
}

export async function UpcomingRsvps({ userId, profileUserId }: UpcomingRsvpsProps) {
  const t = await getTranslations("account.userProfile");
  const locale = await getLocale();

  let events: UpcomingRsvpEvent[] = [];

  try {
    const user = await getAuthUserById(userId);
    if (!user || !(user.preferences.publicProfile ?? false)) {
      return null;
    }

    events = await getUpcomingRsvpEvents(userId, new Date());
  } catch {
    events = [];
  }

  if (events.length === 0) {
    return (
      <OwnerOnlyAction profileUserId={profileUserId}>
        <section
          className="relative h-full"
          role="region"
          aria-labelledby="profile-upcoming-rsvps-heading"
        >
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-rose-500/5 to-transparent" />

          <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-white/5 dark:bg-neutral-900/50">
            <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />

            <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl bg-rose-500/30 blur-lg" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg shadow-rose-500/25">
                    <SparklesIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <h2
                    id="profile-upcoming-rsvps-heading"
                    className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl dark:text-white"
                  >
                    {t("goingTo.title")}
                  </h2>
                  <p className="text-sm text-neutral-500">{t("goingTo.count", { count: 0 })}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 sm:p-6">
              <div
                className="rounded-xl border border-dashed border-rose-500/25 bg-rose-500/5 p-5 text-sm"
                role="status"
                aria-live="polite"
              >
                <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                  {t("goingTo.empty")}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {t("goingTo.emptyHint")}
                </p>
                <div className="mt-3">
                  <Link
                    href={PAGE_ROUTES.EVENT_UPCOMING}
                    className="inline-flex items-center rounded-lg border border-rose-500/30 bg-white/80 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 focus-visible:outline-none dark:bg-neutral-900/60 dark:text-rose-300 dark:hover:bg-rose-500/10 dark:focus-visible:ring-offset-neutral-900"
                  >
                    {t("goingTo.cta")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </OwnerOnlyAction>
    );
  }

  return (
    <section
      className="relative h-full"
      role="region"
      aria-labelledby="profile-upcoming-rsvps-heading"
      aria-describedby="profile-upcoming-rsvps-count"
    >
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-rose-500/5 to-transparent" />

      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-white/5 dark:bg-neutral-900/50">
        <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />

        <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-rose-500/30 blur-lg" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg shadow-rose-500/25">
                <SparklesIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>
            <div>
              <h2
                id="profile-upcoming-rsvps-heading"
                className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl dark:text-white"
              >
                {t("goingTo.title")}
              </h2>
              <p id="profile-upcoming-rsvps-count" className="text-sm text-neutral-500">
                {t("goingTo.count", { count: events.length })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6">
          <div className="space-y-3">
            {events.map((event, index) => {
              const formattedDate =
                event.date && event.date.trim().toUpperCase() !== "TBA"
                  ? formatShortDateUTC(event.date, locale) || t("goingTo.tba")
                  : t("goingTo.tba");

              return (
                <Link
                  key={event.id}
                  href={PAGE_ROUTES.EVENT(event.id)}
                  prefetch={false}
                  className="group relative block overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-all duration-300 hover:border-rose-500/20 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-rose-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 focus-visible:outline-none dark:border-white/5 dark:bg-neutral-800/30 dark:hover:bg-neutral-800/50 dark:focus-visible:ring-offset-neutral-900"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-sm leading-snug font-bold text-neutral-900 transition-colors group-hover:text-rose-600 sm:text-base dark:text-white dark:group-hover:text-rose-300">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1.5">
                          <MapPinIcon className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
                          <span className="capitalize">{event.location}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400/20 to-rose-500/20 ring-1 ring-rose-500/20">
                      <TicketIcon
                        className="h-5 w-5 text-rose-500 dark:text-rose-400"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
