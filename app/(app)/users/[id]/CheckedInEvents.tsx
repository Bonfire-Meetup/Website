import { getLocale, getTranslations } from "next-intl/server";

import { CalendarIcon, CheckCircleIcon, CheckIcon, MapPinIcon } from "@/components/shared/Icons";
import { Link } from "@/i18n/navigation";
import { getAuthUserById } from "@/lib/data/auth";
import { getAttendedEvents, type AttendedEvent } from "@/lib/data/profile-events";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatShortDateUTC } from "@/lib/utils/locale";

import { OwnerOnlyAction } from "./OwnerOnlyAction";

interface CheckedInEventsProps {
  userId: string;
  profileUserId: string;
}

export async function CheckedInEvents({ userId, profileUserId }: CheckedInEventsProps) {
  const t = await getTranslations("account.userProfile");
  const locale = await getLocale();

  let events: AttendedEvent[] = [];

  try {
    const user = await getAuthUserById(userId);
    if (!user || !(user.preferences.publicProfile ?? false)) {
      return null;
    }

    events = await getAttendedEvents(userId, new Date());
  } catch {
    events = [];
  }

  return (
    <section
      className="relative h-full"
      role="region"
      aria-labelledby="profile-checkedin-events-heading"
      aria-describedby="profile-checkedin-events-count"
    >
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-blue-500/5 to-transparent" />

      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-white/5 dark:bg-neutral-900/50">
        <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-blue-500/30 blur-lg" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg shadow-blue-500/25">
                <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>
            <div>
              <h2
                id="profile-checkedin-events-heading"
                className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl dark:text-white"
              >
                {t("checkedIn.title")}
              </h2>
              <p id="profile-checkedin-events-count" className="text-sm text-neutral-500">
                {t("checkedIn.count", { count: events.length })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6">
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event, index) => {
                const formattedDate =
                  event.date && event.date !== "TBA"
                    ? formatShortDateUTC(event.date, locale) || t("checkedIn.tba")
                    : t("checkedIn.tba");
                const formattedCheckedInAt = formatShortDateUTC(event.checkedInAt, locale) || null;
                const formattedRsvpedAt = formatShortDateUTC(event.rsvpedAt, locale) || null;
                let statusLabel = t("checkedIn.rsvpOn", { date: formattedRsvpedAt ?? "" });
                if (event.hasCheckIn && event.hasRsvp) {
                  statusLabel = t("checkedIn.statusBoth");
                } else if (event.hasCheckIn) {
                  statusLabel = t("checkedIn.checkedInOn", { date: formattedCheckedInAt ?? "" });
                }

                return (
                  <div
                    key={event.id}
                    className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-all duration-300 hover:border-blue-500/20 hover:bg-neutral-100 dark:border-white/5 dark:bg-neutral-800/30 dark:hover:bg-neutral-800/50"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <h3 className="text-sm leading-snug font-bold text-neutral-900 sm:text-base dark:text-white">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                          <span className="flex items-center gap-1.5">
                            <MapPinIcon className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
                            <span className="capitalize">{event.location}</span>
                          </span>
                          {event.date && (
                            <span className="flex items-center gap-1.5">
                              <CalendarIcon className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
                              {formattedDate}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <div className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                            <CheckCircleIcon className="h-3 w-3" />
                            {statusLabel}
                          </div>
                          {event.hasRsvp && formattedCheckedInAt && (
                            <div className="inline-flex items-center gap-1 rounded-md bg-neutral-200/60 px-1.5 py-0.5 text-[11px] font-medium text-neutral-700 dark:bg-white/10 dark:text-neutral-300">
                              {t("checkedIn.checkedInOn", { date: formattedCheckedInAt })}
                            </div>
                          )}
                          {event.hasCheckIn && formattedRsvpedAt && (
                            <div className="inline-flex items-center gap-1 rounded-md bg-neutral-200/60 px-1.5 py-0.5 text-[11px] font-medium text-neutral-700 dark:bg-white/10 dark:text-neutral-300">
                              {t("checkedIn.rsvpOn", { date: formattedRsvpedAt })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 ring-1 ring-blue-500/20">
                        <CheckIcon
                          className="h-5 w-5 text-blue-500 dark:text-blue-400"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-xl border border-dashed border-blue-500/25 bg-blue-500/5 p-5 text-sm"
              role="status"
              aria-live="polite"
            >
              <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                {t("checkedIn.empty")}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {t("checkedIn.emptyHint")}
              </p>
              <OwnerOnlyAction profileUserId={profileUserId}>
                <div className="mt-3">
                  <Link
                    href={PAGE_ROUTES.ME}
                    className="inline-flex items-center rounded-lg border border-blue-500/30 bg-white/80 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 focus-visible:outline-none dark:bg-neutral-900/60 dark:text-blue-300 dark:hover:bg-blue-500/10 dark:focus-visible:ring-offset-neutral-900"
                  >
                    {t("checkedIn.cta")}
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
