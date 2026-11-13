"use client";

import { useLocale, useTranslations } from "next-intl";
import { type CSSProperties, useMemo, useState } from "react";

import { DateTile } from "@/components/events/DateTile";
import { EventsPageHero } from "@/components/events/EventsPageHero";
import { ArrowRightIcon, SparklesIcon } from "@/components/shared/Icons";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { type DropdownOption, SelectDropdown } from "@/components/ui/SelectDropdown";
import { Link } from "@/i18n/navigation";
import { LOCATIONS } from "@/lib/config/constants";
import { isTbaDate } from "@/lib/events/datetime";
import { pastEventsOf } from "@/lib/events/event-lists";
import { parseEventTitle } from "@/lib/events/presentation";
import { getEventLocationTheme } from "@/lib/events/theme";
import type { EventItem } from "@/lib/events/types";
import { PAGE_ROUTES } from "@/lib/routes/pages";

interface CalendarGroupItem {
  key: string;
  label: string;
  events: EventItem[];
}

type PastLocationFilter = "all" | typeof LOCATIONS.PRAGUE | typeof LOCATIONS.ZLIN;

export function PastEventsPageContent({ events }: { events: EventItem[] }) {
  const t = useTranslations("sections.events");
  const locale = useLocale();
  const pastEvents = pastEventsOf(events, new Date());
  const [activeLocation, setActiveLocation] = useState<PastLocationFilter>("all");
  const [activeYear, setActiveYear] = useState<string>("all");
  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
    [locale],
  );
  const weekdayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        timeZone: "UTC",
      }),
    [locale],
  );
  const monthShortFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
    [locale],
  );
  const years = useMemo(() => {
    const values = new Set<number>();
    for (const event of pastEvents) {
      if (!isTbaDate(event.date)) {
        const [year] = event.date.split("-").map((part) => Number(part));
        if (year) {
          values.add(year);
        }
      }
    }
    return Array.from(values).sort((a, b) => b - a);
  }, [pastEvents]);
  const yearDropdownOptions = useMemo<DropdownOption[]>(
    () => [
      { label: t("pastFilterAllYears"), value: "all" },
      ...years.map((year) => ({ label: year.toString(), value: year.toString() })),
    ],
    [t, years],
  );
  const filteredEvents = useMemo(
    () =>
      pastEvents.filter((event) => {
        if (activeLocation !== "all" && event.location !== activeLocation) {
          return false;
        }
        if (activeYear !== "all") {
          return event.date.startsWith(`${activeYear}-`);
        }
        return true;
      }),
    [activeLocation, activeYear, pastEvents],
  );
  const locationOptions = useMemo<
    { label: string; value: PastLocationFilter; activeClassName?: string }[]
  >(
    () => [
      { label: t("pastFilterAllLocations"), value: "all" },
      {
        label: LOCATIONS.PRAGUE,
        value: LOCATIONS.PRAGUE,
        activeClassName:
          "border-red-500/75 bg-red-500 text-white dark:border-red-400/70 dark:bg-red-500/85 dark:text-white",
      },
      {
        label: LOCATIONS.ZLIN,
        value: LOCATIONS.ZLIN,
        activeClassName:
          "border-blue-500/75 bg-blue-500 text-white dark:border-blue-400/70 dark:bg-blue-500/85 dark:text-white",
      },
    ],
    [t],
  );
  const defaultFilterButtonActiveClass =
    "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900";
  const yearSelectToneClass =
    activeYear !== "all"
      ? "text-brand-600 dark:text-brand-300"
      : "text-neutral-600 dark:text-neutral-300";
  const yearSelectBaseClass =
    "h-8 min-w-[122px] rounded-full border border-neutral-200/80 bg-white/80 px-3 text-xs font-semibold shadow-sm ring-1 ring-black/5 transition focus:ring-2 focus:outline-none focus:ring-brand-500/50 dark:border-white/12 dark:bg-white/8 dark:ring-white/10 dark:focus:ring-brand-400/50";
  const filterButtonClass = (isActive: boolean, activeClassName = defaultFilterButtonActiveClass) =>
    `rounded-full border px-2.5 py-1 text-2xs font-semibold transition-colors ${
      isActive
        ? activeClassName
        : "border-neutral-200/80 bg-white/75 text-neutral-600 hover:border-neutral-300 hover:bg-white dark:border-white/12 dark:bg-white/8 dark:text-neutral-300 dark:hover:border-white/22 dark:hover:bg-white/15"
    }`;
  const groups = useMemo(() => {
    const mapped = new Map<string, CalendarGroupItem>();

    for (const event of filteredEvents) {
      if (isTbaDate(event.date)) {
        const tbaGroup = mapped.get("tba");
        if (tbaGroup) {
          tbaGroup.events.push(event);
        } else {
          mapped.set("tba", { key: "tba", label: "TBA", events: [event] });
        }
      } else {
        const date = new Date(`${event.date}T00:00:00.000Z`);
        if (!Number.isNaN(date.getTime())) {
          const key = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}`;
          const label = monthFormatter.format(date);
          const group = mapped.get(key);
          if (group) {
            group.events.push(event);
          } else {
            mapped.set(key, { key, label, events: [event] });
          }
        }
      }
    }

    return Array.from(mapped.values());
  }, [filteredEvents, monthFormatter]);

  return (
    <main className="gradient-bg relative min-h-screen overflow-hidden">
      <EventsPageHero
        eyebrow={t("pastSectionEyebrow")}
        subtitle={t("pastPageSubtitle")}
        title={
          <h1 className="page-title mb-5">
            <span className="text-gradient-static block">{t("pastPageTitle")}</span>
          </h1>
        }
      />

      <section className="relative mx-auto max-w-7xl px-4 pb-24">
        <div className="surface mb-6 p-3 sm:p-3.5">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="hidden items-center gap-2 lg:flex">
              <Pill
                size="sm"
                className="text-2xs tracking-label-sm bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-600 uppercase dark:bg-white/10 dark:text-neutral-300"
              >
                {t("pastFiltersLabel")}
              </Pill>
            </div>

            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xs tracking-label-sm font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                  {t("pastFilterLocation")}
                </span>
                {locationOptions.map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => setActiveLocation(option.value)}
                    variant="plain"
                    size="xs"
                    className={filterButtonClass(
                      activeLocation === option.value,
                      option.activeClassName,
                    )}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xs tracking-label-sm font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                  {t("pastFilterYear")}
                </span>
                <SelectDropdown
                  id="past-events-year-filter"
                  value={activeYear}
                  options={yearDropdownOptions}
                  nativeOnMobile
                  onChange={setActiveYear}
                  buttonClassName={`${yearSelectBaseClass} ${yearSelectToneClass}`}
                  nativeClassName={`${yearSelectBaseClass} pr-8 ${yearSelectToneClass}`}
                />
              </div>
            </div>
          </div>
        </div>

        {groups.length > 0 ? (
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group.key} className="grid gap-4 lg:grid-cols-[190px_1fr] lg:gap-6">
                <div className="surface self-start p-4 lg:sticky lg:top-24">
                  <p className="text-2xs tracking-label-sm font-bold text-neutral-500 uppercase dark:text-neutral-400">
                    {t("pastSectionEyebrow")}
                  </p>
                  <h2 className="mt-1 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                    {group.label}
                  </h2>
                  <p className="mt-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {group.events.length}{" "}
                    {group.events.length === 1
                      ? t("pastMonthEventSingle")
                      : t("pastMonthEventPlural")}
                  </p>
                </div>

                <div className="space-y-3.5">
                  {group.events.map((event) => {
                    const theme = getEventLocationTheme(event.location);
                    const parsedTitle = parseEventTitle(event.title);
                    const shouldSplitTitle =
                      parsedTitle !== null && parsedTitle.prefix.startsWith("Bonfire@");
                    const eventDate = !isTbaDate(event.date)
                      ? new Date(`${event.date}T00:00:00.000Z`)
                      : null;
                    const isValidDate = eventDate && !Number.isNaN(eventDate.getTime());
                    const dayNumber = isValidDate ? eventDate.getUTCDate().toString() : "TBA";
                    const weekday = isValidDate ? weekdayFormatter.format(eventDate) : "";
                    return (
                      <article
                        key={event.id}
                        className="surface group relative grid grid-cols-[78px_1fr] gap-3 overflow-hidden p-4 transition-colors hover:bg-white sm:grid-cols-[88px_1fr] sm:gap-4 sm:p-5 dark:hover:bg-white/10"
                      >
                        <div
                          className={`pointer-events-none absolute inset-y-0 left-0 w-1 opacity-65 ${theme.rail}`}
                        />

                        <div className="relative flex items-start">
                          <DateTile
                            variant="plain"
                            date={isValidDate ? event.date : undefined}
                            location={event.location}
                            top={weekday || event.date}
                            day={dayNumber}
                            bottom={isValidDate ? monthShortFormatter.format(eventDate) : undefined}
                            className="w-full"
                          />
                        </div>

                        <div className="min-w-0">
                          {shouldSplitTitle && parsedTitle ? (
                            <h3>
                              <span className="text-2xs tracking-label-sm block font-bold text-neutral-400 uppercase dark:text-neutral-500">
                                {parsedTitle.prefix}
                              </span>
                              <span className="text-gradient-static mt-0.5 block text-xl font-black tracking-tight sm:text-[1.35rem]">
                                {parsedTitle.subtitle}
                              </span>
                            </h3>
                          ) : (
                            <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                              {event.title}
                            </h3>
                          )}

                          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            <span className="flex min-w-0 items-center gap-1.5 align-middle">
                              <span
                                className="h-1.5 w-1.5 flex-none rounded-full"
                                style={{ backgroundColor: theme.color }}
                              />
                              <span className="flex-none">{event.location}</span>
                              <span className="flex-none text-neutral-400 dark:text-neutral-500">
                                ·
                              </span>
                              <span className="min-w-0 truncate" title={event.venue}>
                                {event.venue}
                              </span>
                            </span>
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                            {event.description}
                          </p>

                          <div className="mt-4">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={PAGE_ROUTES.EVENT_SURVEY_WITH_EVENT(event.id)}
                                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold text-white shadow-[0_14px_28px_-18px_var(--survey-color)] transition-[transform,filter,box-shadow] group-hover:translate-x-0.5 hover:brightness-105"
                                style={
                                  {
                                    "--survey-color": `${theme.color}80`,
                                    background: `linear-gradient(135deg, ${theme.color} 0%, ${theme.color}cc 100%)`,
                                  } as CSSProperties
                                }
                              >
                                <SparklesIcon className="h-4 w-4" />
                                {t("pastPageSurveyCta")}
                              </Link>
                              <Link
                                href={PAGE_ROUTES.EVENT(event.id)}
                                className="btn-outline gap-1.5 rounded-full px-3.5 py-1.5 text-sm"
                              >
                                {t("pastPageViewDetails")}
                                <ArrowRightIcon className={`h-4 w-4 ${theme.iconTint}`} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300/80 bg-white/70 p-10 text-center text-neutral-600 dark:border-white/15 dark:bg-white/5 dark:text-neutral-300">
            {t("pastPageEmpty")}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <BackLink href={PAGE_ROUTES.EVENT_UPCOMING}>{t("backToUpcoming")}</BackLink>
        </div>
      </section>
    </main>
  );
}
