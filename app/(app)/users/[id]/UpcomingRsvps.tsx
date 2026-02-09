import { getLocale, getTranslations } from "next-intl/server";

import { SparklesIcon, TicketIcon } from "@/components/shared/Icons";
import { upcomingEvents } from "@/data/upcoming-events";
import { Link } from "@/i18n/navigation";
import { getAuthUserById } from "@/lib/data/auth";
import { getUserRsvps } from "@/lib/data/rsvps";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { OwnerOnlyAction } from "./OwnerOnlyAction";

interface UpcomingRsvpsProps {
  userId: string;
  profileUserId: string;
}

interface RsvpEvent {
  id: string;
  title: string;
  location: string;
  date: string | null;
  rsvpedAt?: string;
}

export async function UpcomingRsvps({ userId, profileUserId }: UpcomingRsvpsProps) {
  const t = await getTranslations("account.userProfile");
  const locale = await getLocale();

  let events: RsvpEvent[] = [];

  try {
    const user = await getAuthUserById(userId);
    if (!user || !(user.preferences.publicProfile ?? false)) {
      return null;
    }

    const rsvps = await getUserRsvps(userId);
    const rsvpEventIds = new Set(rsvps.map((r) => r.eventId));
    const now = new Date();

    for (const eventId of rsvpEventIds) {
      const upcomingEvent = upcomingEvents.find((e) => e.id === eventId);
      if (upcomingEvent) {
        const isFuture =
          upcomingEvent.date.trim().toUpperCase() === "TBA" || new Date(upcomingEvent.date) >= now;

        if (isFuture) {
          events.push({
            id: upcomingEvent.id,
            title: upcomingEvent.title,
            location: upcomingEvent.location,
            date: upcomingEvent.date,
            rsvpedAt: rsvps.find((r) => r.eventId === eventId)?.createdAt,
          });
        }
      }
    }

    events.sort((a, b) => {
      const dateA =
        a.date && a.date !== "TBA" ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
      const dateB =
        b.date && b.date !== "TBA" ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
      return dateA - dateB;
    });
  } catch {
    events = [];
  }

  // When empty, only the profile owner sees the empty-state nudge
  if (events.length === 0) {
    return (
      <OwnerOnlyAction profileUserId={profileUserId}>
        <section
          className="relative h-full"
          role="region"
          aria-labelledby="profile-upcoming-rsvps-heading"
        >
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-fuchsia-500/5 to-transparent" />

          <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-white/5 dark:bg-neutral-900/50">
            <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />

            <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl bg-fuchsia-500/30 blur-lg" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-400 to-rose-600 shadow-lg shadow-fuchsia-500/25">
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
                className="rounded-xl border border-dashed border-fuchsia-500/25 bg-fuchsia-500/5 p-5 text-sm"
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
                    className="inline-flex items-center rounded-lg border border-fuchsia-500/30 bg-white/80 px-3 py-1.5 text-xs font-semibold text-fuchsia-700 transition-colors hover:bg-fuchsia-50 focus-visible:ring-2 focus-visible:ring-fuchsia-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 focus-visible:outline-none dark:bg-neutral-900/60 dark:text-fuchsia-300 dark:hover:bg-fuchsia-500/10 dark:focus-visible:ring-offset-neutral-900"
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

  // When populated, everyone can see which events the user is going to
  return (
    <section
      className="relative h-full"
      role="region"
      aria-labelledby="profile-upcoming-rsvps-heading"
      aria-describedby="profile-upcoming-rsvps-count"
    >
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-fuchsia-500/5 to-transparent" />

      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-white/5 dark:bg-neutral-900/50">
        <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />

        <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-fuchsia-500/30 blur-lg" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-400 to-rose-600 shadow-lg shadow-fuchsia-500/25">
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
              let formattedDate = t("goingTo.tba");
              if (event.date && event.date.trim().toUpperCase() !== "TBA") {
                const date = new Date(event.date);
                if (!isNaN(date.getTime())) {
                  formattedDate = new Intl.DateTimeFormat(locale, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(date);
                }
              }

              return (
                <Link
                  key={event.id}
                  href={PAGE_ROUTES.EVENT(event.id)}
                  prefetch={false}
                  className="group relative block overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-all duration-300 hover:border-fuchsia-500/20 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-fuchsia-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 focus-visible:outline-none dark:border-white/5 dark:bg-neutral-800/30 dark:hover:bg-neutral-800/50 dark:focus-visible:ring-offset-neutral-900"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-sm leading-snug font-bold text-neutral-900 transition-colors group-hover:text-fuchsia-600 sm:text-base dark:text-white dark:group-hover:text-fuchsia-300">
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
                      </div>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-400/20 to-rose-500/20 ring-1 ring-fuchsia-500/20">
                      <TicketIcon
                        className="h-5 w-5 text-fuchsia-500 dark:text-fuchsia-400"
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
