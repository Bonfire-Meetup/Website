"use client";

import { useLocale, useTranslations } from "next-intl";

import { ArrowLeftIcon } from "@/components/shared/Icons";
import { getPastEvents } from "@/data/events-calendar";
import { Link } from "@/i18n/navigation";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatEventDateUTC } from "@/lib/utils/locale";

export function PastEventsPageContent() {
  const t = useTranslations("sections.events");
  const locale = useLocale();
  const pastEvents = getPastEvents(new Date());

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-4 pt-32 pb-14 sm:min-h-[65vh] sm:pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
          <div className="absolute top-28 right-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,var(--color-orange-glow),transparent_62%)]" />
          <div className="absolute bottom-10 left-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,var(--color-rose-glow),transparent_65%)]" />
        </div>

        <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap select-none">
          <span className="text-outline block text-[15vw] leading-none font-black opacity-[0.03] sm:text-[11vw] dark:opacity-[0.02]">
            EVENTS
          </span>
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="text-brand-600 dark:text-brand-300 mb-6 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.4em] uppercase sm:gap-3 sm:text-sm sm:tracking-[0.5em]">
            <span className="to-brand-400 h-px w-8 bg-gradient-to-r from-transparent sm:w-12" />
            {t("pastSectionEyebrow")}
            <span className="to-brand-400 h-px w-8 bg-gradient-to-l from-transparent sm:w-12" />
          </p>

          <h1 className="mb-5 text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
            <span className="text-gradient-static block">{t("pastPageTitle")}</span>
          </h1>

          <p className="mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400">
            {t("pastPageSubtitle")}
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-20">
        {pastEvents.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {pastEvents.map((event, index) => (
              <article
                key={event.id}
                className="group relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/70 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-black/5 sm:p-6 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:shadow-none"
                style={{ animationDelay: `${index * 35}ms` }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-red-500 opacity-70" />
                <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-rose-300/30 blur-2xl dark:bg-rose-400/20" />

                <div className="relative">
                  <p className="inline-flex items-center rounded-full bg-neutral-900/5 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-neutral-600 uppercase dark:bg-white/10 dark:text-neutral-300">
                    {event.date.trim().toUpperCase() === "TBA"
                      ? event.date
                      : formatEventDateUTC(event.date, locale)}
                  </p>

                  <h2 className="mt-3 text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    {event.title}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {event.location} · {event.venue}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {event.description}
                  </p>

                  <div className="mt-5">
                    <Link
                      href={PAGE_ROUTES.EVENT(event.id)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-700 underline decoration-neutral-300 underline-offset-4 transition-colors group-hover:text-neutral-900 dark:text-neutral-200 dark:decoration-neutral-600 dark:group-hover:text-white"
                    >
                      {t("pastPageViewDetails")}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-300/80 bg-white/70 p-10 text-center text-neutral-600 dark:border-white/15 dark:bg-white/5 dark:text-neutral-300">
            {t("pastPageEmpty")}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href={PAGE_ROUTES.EVENT_UPCOMING}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300/90 bg-white/70 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-white hover:text-neutral-900 dark:border-white/15 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            {t("backToUpcoming")}
          </Link>
        </div>
      </section>
    </main>
  );
}
