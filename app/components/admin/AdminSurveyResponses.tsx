"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useAdminSurveyResponses, type AdminSurveyResponse } from "@/lib/api/admin";
import { useEventsCatalog } from "@/lib/api/events";
import type { EventItem } from "@/lib/events/types";

import {
  ADMIN_LABEL_CLASS,
  ADMIN_PANEL_CLASS,
  AdminCard,
  AdminDistribution,
  AdminField,
  AdminListState,
  AdminLongText,
  AdminScoreChip,
  AdminScoreStat,
  AdminSearchField,
  AdminSectionTitle,
  AdminSelect,
  AdminStat,
  AdminTag,
  AdminTimestamp,
  AdminToolbar,
  matchesSearch,
} from "./AdminPrimitives";

const ALL_EVENTS = "all";
export type EventCatalog = Map<string, EventItem>;

const EMPTY_CATALOG: EventCatalog = new Map();

type RatingField = "overallRating" | "nextEventLikelihood" | "talksOverallRating";

const eventKeyOf = (response: AdminSurveyResponse) => response.eventId ?? response.eventTitle;

function average(responses: AdminSurveyResponse[], field: RatingField) {
  const values = responses
    .map((response) => response[field])
    .filter((value): value is number => value !== null);

  return {
    count: values.length,
    value: values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
  };
}

function countValues(values: string[]) {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function buildEventOptions(responses: AdminSurveyResponse[], catalog: EventCatalog) {
  const events = new Map<string, { title: string; date: string; count: number }>();

  for (const response of responses) {
    const key = eventKeyOf(response);
    const current = events.get(key);

    events.set(key, {
      count: (current?.count ?? 0) + 1,
      date: (response.eventId && catalog.get(response.eventId)?.date) || "",
      title: response.eventTitle,
    });
  }

  return [...events.entries()]
    .sort((a, b) => b[1].date.localeCompare(a[1].date))
    .map(([value, event]) => ({ label: `${event.title} (${event.count})`, value }));
}

function buildTalkSummary(
  eventId: string,
  responses: AdminSurveyResponse[],
  catalog: EventCatalog,
) {
  const event = catalog.get(eventId);

  if (!event) {
    return [];
  }

  return event.speakers.map((speaker, talkIndex) => {
    const entries = responses.flatMap((response) =>
      response.talkFeedback
        .filter((entry) => entry.talkIndex === talkIndex)
        .map((entry) => ({ ...entry, responseId: response.id })),
    );
    const ratings = entries
      .map((entry) => entry.rating)
      .filter((rating): rating is number => rating !== null);

    return {
      average:
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : null,
      comments: entries.flatMap((entry) =>
        entry.comment ? [{ id: entry.responseId, text: entry.comment }] : [],
      ),
      ratingsCount: ratings.length,
      speaker: Array.isArray(speaker.name) ? speaker.name.join(", ") : speaker.name,
      talkIndex,
      topic: speaker.topic,
    };
  });
}

const formatAverage = (value: number | null) => (value === null ? "–" : value.toFixed(1));

export function AdminSurveyResponses() {
  const t = useTranslations("admin.surveys");
  const query = useAdminSurveyResponses();
  const catalog = useEventsCatalog().data ?? EMPTY_CATALOG;
  const responses = query.data ?? [];

  return (
    <AdminListState
      isLoading={query.isLoading}
      isError={query.isError}
      isEmpty={responses.length === 0}
      emptyMessage={t("empty")}
      onRetry={() => query.refetch()}
    >
      <SurveyResponsesView responses={responses} catalog={catalog} />
    </AdminListState>
  );
}

export function SurveyResponsesView({
  responses,
  catalog,
}: {
  responses: AdminSurveyResponse[];
  catalog: EventCatalog;
}) {
  const t = useTranslations("admin.surveys");
  const tCommon = useTranslations("admin.common");
  const tOptions = useTranslations("eventsSurveyPage.form.options");
  const [eventFilter, setEventFilter] = useState(ALL_EVENTS);
  const [search, setSearch] = useState("");

  const optionLabel = (key: string) => (tOptions.has(key) ? tOptions(key) : key);
  const eventResponses =
    eventFilter === ALL_EVENTS
      ? responses
      : responses.filter((response) => eventKeyOf(response) === eventFilter);
  const visibleResponses = eventResponses.filter((response) =>
    matchesSearch(search, [
      response.eventTitle,
      response.suggestions,
      response.favoritePartsOther,
      response.futureTopicsOther,
      response.talkFormatOther,
      ...response.talkFeedback.map((entry) => entry.comment),
    ]),
  );

  const overall = average(eventResponses, "overallRating");
  const nextEvent = average(eventResponses, "nextEventLikelihood");
  const talks = average(eventResponses, "talksOverallRating");
  const toRows = (values: string[]) =>
    countValues(values).map(([key, count]) => ({ count, key, label: optionLabel(key) }));
  const selectedEventId = eventFilter === ALL_EVENTS ? null : eventResponses[0]?.eventId;
  const talkSummary = selectedEventId
    ? buildTalkSummary(selectedEventId, eventResponses, catalog)
    : [];

  return (
    <>
      <AdminToolbar count={visibleResponses.length}>
        <AdminSelect
          value={eventFilter}
          onChange={setEventFilter}
          label={t("filterEvent")}
          options={[
            { label: t("allEvents"), value: ALL_EVENTS },
            ...buildEventOptions(responses, catalog),
          ]}
        />
        <AdminSearchField value={search} onChange={setSearch} />
      </AdminToolbar>

      <AdminSectionTitle>{t("summary")}</AdminSectionTitle>

      <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminStat label={t("responses")} value={String(eventResponses.length)} />
        <AdminScoreStat
          label={t("avgOverall")}
          value={overall.value}
          hint={t("ratingsCount", { count: overall.count })}
          scaleLabel={t("outOf")}
        />
        <AdminScoreStat
          label={t("avgNextEvent")}
          value={nextEvent.value}
          hint={t("ratingsCount", { count: nextEvent.count })}
          scaleLabel={t("outOf")}
        />
        <AdminScoreStat
          label={t("avgTalks")}
          value={talks.value}
          hint={t("ratingsCount", { count: talks.count })}
          scaleLabel={t("outOf")}
        />
      </div>

      <div className="mb-3 grid gap-3 lg:grid-cols-3">
        <AdminDistribution
          title={t("favoriteParts")}
          rows={toRows(eventResponses.flatMap((response) => response.favoriteParts))}
          total={eventResponses.length}
        />
        <AdminDistribution
          title={t("futureTopics")}
          rows={toRows(eventResponses.flatMap((response) => response.futureTopics))}
          total={eventResponses.length}
        />
        <AdminDistribution
          title={t("talkFormat")}
          rows={toRows(
            eventResponses.flatMap((response) =>
              response.talkFormat ? [response.talkFormat] : [],
            ),
          )}
          total={eventResponses.length}
        />
      </div>

      {talkSummary.length > 0 ? (
        <section className={`${ADMIN_PANEL_CLASS} mb-10 p-5`}>
          <h3 className={`${ADMIN_LABEL_CLASS} mb-4`}>{t("talkRatings")}</h3>
          <ul className="flex flex-col divide-y divide-neutral-200 dark:divide-white/10">
            {talkSummary.map((talk) => (
              <li key={talk.talkIndex} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[0.9375rem] font-semibold text-neutral-900 dark:text-white">
                      {talk.topic}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{talk.speaker}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl leading-none font-black text-neutral-900 tabular-nums dark:text-white">
                      {formatAverage(talk.average)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      {t("ratingsCount", { count: talk.ratingsCount })}
                    </p>
                  </div>
                </div>
                {talk.comments.length > 0 ? (
                  <details className="group">
                    <summary className="cursor-pointer text-xs font-semibold text-rose-600 dark:text-rose-400">
                      {t("comments", { count: talk.comments.length })}
                    </summary>
                    <ul className="mt-2 flex flex-col gap-2">
                      {talk.comments.map((comment) => (
                        <li
                          key={comment.id}
                          className="rounded-xl bg-neutral-100 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-neutral-900 dark:bg-white/5 dark:text-neutral-100"
                        >
                          {comment.text}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="mb-10 text-sm text-neutral-600 dark:text-neutral-400">
          {t("talkRatingsHint")}
        </p>
      )}

      <AdminSectionTitle count={visibleResponses.length}>{t("allResponses")}</AdminSectionTitle>

      {visibleResponses.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-600 dark:text-neutral-400">
          {tCommon("noMatches")}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleResponses.map((response) => (
            <SurveyResponseCard key={response.id} response={response} optionLabel={optionLabel} />
          ))}
        </div>
      )}
    </>
  );
}

function SurveyResponseCard({
  response,
  optionLabel,
}: {
  response: AdminSurveyResponse;
  optionLabel: (key: string) => string;
}) {
  const t = useTranslations("admin.surveys");
  const withOther = (key: string, otherText: string | null) =>
    key === "other" && otherText ? t("other", { text: otherText }) : optionLabel(key);

  const choiceGroups = [
    {
      label: t("favoriteParts"),
      values: response.favoriteParts.map((key) => withOther(key, response.favoritePartsOther)),
    },
    {
      label: t("futureTopics"),
      values: response.futureTopics.map((key) => withOther(key, response.futureTopicsOther)),
    },
    {
      label: t("talkFormat"),
      values: response.talkFormat ? [withOther(response.talkFormat, response.talkFormatOther)] : [],
    },
  ].filter((group) => group.values.length > 0);

  return (
    <AdminCard>
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            {response.eventTitle}
          </h3>
          <AdminTimestamp value={response.createdAt} />
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          <AdminScoreChip label={t("overall")} value={response.overallRating} />
          <AdminScoreChip label={t("nextEvent")} value={response.nextEventLikelihood} />
          <AdminScoreChip label={t("talks")} value={response.talksOverallRating} />
        </div>
      </header>

      {response.suggestions ? (
        <div className="mt-4 border-l-4 border-orange-400 pl-4 dark:border-orange-400/70">
          <p className={`${ADMIN_LABEL_CLASS} mb-1`}>{t("suggestions")}</p>
          <AdminLongText text={response.suggestions} />
        </div>
      ) : null}

      {choiceGroups.length > 0 ? (
        <dl className="mt-4 flex flex-col gap-2.5 border-t border-neutral-200 pt-4 dark:border-white/10">
          {choiceGroups.map((group) => (
            <AdminField key={group.label} label={group.label}>
              <ul className="flex flex-wrap gap-1.5">
                {group.values.map((value) => (
                  <li key={value}>
                    <AdminTag>{value}</AdminTag>
                  </li>
                ))}
              </ul>
            </AdminField>
          ))}
        </dl>
      ) : null}

      {response.talkFeedback.length > 0 ? (
        <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-white/10">
          <p className={`${ADMIN_LABEL_CLASS} mb-2`}>{t("talkFeedback")}</p>
          <ul className="flex flex-col divide-y divide-neutral-200 dark:divide-white/10">
            {response.talkFeedback.map((entry) => (
              <li
                key={`${entry.talkIndex ?? "legacy"}-${entry.topic}`}
                className="flex flex-col gap-1.5 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {entry.topic}
                    </p>
                    {entry.speaker ? (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {entry.speaker}
                      </p>
                    ) : null}
                  </div>
                  {entry.rating !== null ? <AdminScoreChip label="" value={entry.rating} /> : null}
                </div>
                {entry.comment ? (
                  <p className="rounded-lg bg-neutral-100 px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap text-neutral-900 dark:bg-white/5 dark:text-neutral-100">
                    {entry.comment}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </AdminCard>
  );
}
