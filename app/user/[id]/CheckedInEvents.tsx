import { getTranslations } from "next-intl/server";

import { CheckIcon } from "@/components/shared/icons";
import { upcomingEvents } from "@/data/upcoming-events";
import { getAuthUserById } from "@/lib/data/auth";
import { getUserCheckIns } from "@/lib/data/check-in";
import { getEpisodeById } from "@/lib/recordings/episodes";

interface CheckedInEventsProps {
  userId: string;
}

interface CheckInEvent {
  id: string;
  title: string;
  location: string;
  date: string | null;
  type: "upcoming" | "episode";
  checkedInAt?: Date;
}

export async function CheckedInEvents({ userId }: CheckedInEventsProps) {
  const t = await getTranslations("account.userProfile");

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
    <div className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/95">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />

      <div className="relative px-6 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                {t("checkedIn.title")}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {events.length} {events.length === 1 ? "event" : "events"}
              </p>
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-8 text-center dark:border-white/10 dark:bg-white/5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("checkedIn.empty")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              let formattedDate = "TBA";
              if (event.date && event.date !== "TBA") {
                const date = new Date(event.date);
                if (!isNaN(date.getTime())) {
                  formattedDate = new Intl.DateTimeFormat("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(date);
                }
              }

              const formattedCheckedInAt = event.checkedInAt
                ? new Intl.DateTimeFormat("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(event.checkedInAt)
                : null;

              return (
                <div
                  key={event.id}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-200/70 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 transition-all hover:border-blue-300 hover:shadow-lg dark:border-white/10 dark:from-blue-950/20 dark:to-indigo-950/20 dark:hover:border-blue-500/30"
                >
                  <div className="p-4 sm:p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="mb-1.5 line-clamp-2 text-base leading-snug font-bold text-neutral-900 sm:text-lg dark:text-white">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="font-medium capitalize">{event.location}</span>
                          {event.date && (
                            <>
                              <span className="text-neutral-300 dark:text-neutral-600">•</span>
                              <span>{formattedDate}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-md">
                        <CheckIcon className="h-4 w-4 text-white" aria-hidden="true" />
                      </div>
                    </div>

                    {formattedCheckedInAt && (
                      <div className="flex items-center gap-1.5 rounded-md bg-blue-100/60 px-2.5 py-1.5 text-xs font-medium text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                        <svg
                          className="h-3.5 w-3.5"
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
                        <span>Checked in on {formattedCheckedInAt}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
