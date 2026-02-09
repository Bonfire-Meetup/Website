import { getLocale, getTranslations } from "next-intl/server";

import { CheckIcon } from "@/components/shared/Icons";
import { upcomingEvents } from "@/data/upcoming-events";
import { Link } from "@/i18n/navigation";
import { getAuthUserById } from "@/lib/data/auth";
import { getUserCheckIns } from "@/lib/data/check-in";
import { getEpisodeById } from "@/lib/recordings/episodes";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { OwnerOnlyAction } from "./OwnerOnlyAction";

interface CheckedInEventsProps {
  userId: string;
  profileUserId: string;
}

interface CheckInEvent {
  id: string;
  title: string;
  location: string;
  date: string | null;
  type: "upcoming" | "episode";
  checkedInAt?: string;
}

export async function CheckedInEvents({ userId, profileUserId }: CheckedInEventsProps) {
  const t = await getTranslations("account.userProfile");
  const locale = await getLocale();

  let events: CheckInEvent[] = [];

  try {
    const user = await getAuthUserById(userId);
    if (!user || !(user.preferences.publicProfile ?? false)) {
      return null;
    }

    const checkIns = await getUserCheckIns(userId);
    const checkInEventIds = new Set(checkIns.map((ci) => ci.eventId));

    for (const eventId of checkInEventIds) {
      const upcomingEvent = upcomingEvents.find((e) => e.id === eventId);
      if (upcomingEvent) {
        events.push({
          id: upcomingEvent.id,
          title: upcomingEvent.title,
          location: upcomingEvent.location,
          date: upcomingEvent.date,
          type: "upcoming",
          checkedInAt: checkIns.find((ci) => ci.eventId === eventId)?.createdAt,
        });
      } else {
        const episode = getEpisodeById(eventId);
        if (episode) {
          events.push({
            id: episode.id,
            title: `Bonfire@${episode.city === "prague" ? "Prague" : "Zlin"} #${episode.number} - ${episode.title}`,
            location: episode.city === "prague" ? "Prague" : "Zlin",
            date: episode.date,
            type: "episode",
            checkedInAt: checkIns.find((ci) => ci.eventId === eventId)?.createdAt,
          });
        }
      }
    }

    events.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
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
                let formattedDate = t("checkedIn.tba");
                if (event.date && event.date !== "TBA") {
                  const date = new Date(event.date);
                  if (!isNaN(date.getTime())) {
                    formattedDate = new Intl.DateTimeFormat(locale, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(date);
                  }
                }

                const formattedCheckedInAt = event.checkedInAt
                  ? new Intl.DateTimeFormat(locale, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(event.checkedInAt))
                  : null;

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
                            <svg
                              className="h-3 w-3 text-neutral-400 dark:text-neutral-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="capitalize">{event.location}</span>
                          </span>
                          {event.date && (
                            <span className="flex items-center gap-1.5">
                              <svg
                                className="h-3 w-3 text-neutral-400 dark:text-neutral-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {formattedDate}
                            </span>
                          )}
                        </div>
                        {formattedCheckedInAt && (
                          <div className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {t("checkedIn.verified", { date: formattedCheckedInAt })}
                          </div>
                        )}
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
