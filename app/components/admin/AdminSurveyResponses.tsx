"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { getEventById } from "@/data/events-calendar";
import { useAdminSurveyResponses, type AdminSurveyResponse } from "@/lib/api/admin";

import {
  AdminCard,
  AdminDistribution,
  AdminListState,
  AdminLongText,
  AdminRating,
  AdminSearchField,
  AdminSelect,
  AdminStat,
  AdminTag,
  AdminTimestamp,
  AdminToolbar,
  matchesSearch,
} from "./AdminPrimitives";

const ALL_EVENTS = "all";

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

function buildEventOptions(responses: AdminSurveyResponse[]) {
  const events = new Map<string, { title: string; date: string; count: number }>();

  for (const response of responses) {
    const key = eventKeyOf(response);
    const current = events.get(key);

    events.set(key, {
      count: (current?.count ?? 0) + 1,
      date: (response.eventId && getEventById(response.eventId)?.date) || "",
      title: response.eventTitle,
    });
  }

  return [...events.entries()]
    .sort((a, b) => b[1].date.localeCompare(a[1].date))
    .map(([value, event]) => ({ label: `${event.title} (${event.count})`, value }));
}

function buildTalkSummary(eventId: string, responses: AdminSurveyResponse[]) {
  const event = getEventById(eventId);

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
  const tCommon = useTranslations("admin.common");
  const tOptions = useTranslations("eventsSurveyPage.form.options");
  const query = useAdminSurveyResponses();
  const [eventFilter, setEventFilter] = useState(ALL_EVENTS);
  const [search, setSearch] = useState("");

  const responses = query.data ?? [];
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
  const talkSummary = selectedEventId ? buildTalkSummary(selectedEventId, eventResponses) : [];

  return (
    <AdminListState
      isLoading={query.isLoading}
      isError={query.isError}
      isEmpty={responses.length === 0}
      emptyMessage={t("empty")}
      onRetry={() => query.refetch()}
    >
      <AdminToolbar count={visibleResponses.length}>
        <AdminSelect
          value={eventFilter}
          onChange={setEventFilter}
          label={t("filterEvent")}
          options={[{ label: t("allEvents"), value: ALL_EVENTS }, ...buildEventOptions(responses)]}
        />
        <AdminSearchField value={search} onChange={setSearch} />
      </AdminToolbar>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminStat label={t("responses")} value={String(eventResponses.length)} />
        <AdminStat
          label={t("avgOverall")}
          value={formatAverage(overall.value)}
          hint={t("ratingsCount", { count: overall.count })}
        />
        <AdminStat
          label={t("avgNextEvent")}
          value={formatAverage(nextEvent.value)}
          hint={t("ratingsCount", { count: nextEvent.count })}
        />
        <AdminStat
          label={t("avgTalks")}
          value={formatAverage(talks.value)}
          hint={t("ratingsCount", { count: talks.count })}
        />
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-3">
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
        <section className="surface mb-8 p-5">
          <h3 className="eyebrow mb-4 text-xs text-neutral-500 dark:text-neutral-400">
            {t("talkRatings")}
          </h3>
          <ul className="flex flex-col divide-y divide-neutral-200/70 dark:divide-white/10">
            {talkSummary.map((talk) => (
              <li key={talk.talkIndex} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {talk.topic}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{talk.speaker}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xl font-black text-neutral-900 tabular-nums dark:text-white">
                      {formatAverage(talk.average)}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
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
                          className="surface-inset px-3 py-2 text-sm whitespace-pre-wrap text-neutral-700 dark:text-neutral-300"
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
        <p className="mb-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
          {t("talkRatingsHint")}
        </p>
      )}

      {visibleResponses.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {tCommon("noMatches")}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleResponses.map((response) => (
            <SurveyResponseCard key={response.id} response={response} optionLabel={optionLabel} />
          ))}
        </div>
      )}
    </AdminListState>
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
  const tCommon = useTranslations("admin.common");
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
  ];

  return (
    <AdminCard>
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white">
          {response.eventTitle}
        </h3>
        <AdminTimestamp value={response.createdAt} />
      </header>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <AdminRating label={t("overall")} value={response.overallRating} />
        <AdminRating label={t("nextEvent")} value={response.nextEventLikelihood} />
        <AdminRating label={t("talks")} value={response.talksOverallRating} />
      </div>

      <dl className="mb-4 grid gap-3 sm:grid-cols-3">
        {choiceGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1.5">
            <dt className="eyebrow text-2xs text-neutral-500 dark:text-neutral-400">
              {group.label}
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              {group.values.length > 0 ? (
                group.values.map((value) => <AdminTag key={value}>{value}</AdminTag>)
              ) : (
                <span className="text-xs text-neutral-400">{tCommon("noAnswer")}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {response.suggestions ? (
        <div className="mb-4 flex flex-col gap-1.5">
          <span className="eyebrow text-2xs text-neutral-500 dark:text-neutral-400">
            {t("suggestions")}
          </span>
          <div className="surface-inset px-4 py-3">
            <AdminLongText text={response.suggestions} />
          </div>
        </div>
      ) : null}

      {response.talkFeedback.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className="eyebrow text-2xs text-neutral-500 dark:text-neutral-400">
            {t("talkFeedback")}
          </span>
          <ul className="flex flex-col gap-2">
            {response.talkFeedback.map((entry) => (
              <li
                key={`${entry.talkIndex ?? "legacy"}-${entry.topic}`}
                className="surface-inset flex flex-col gap-1 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {entry.topic}
                    </p>
                    {entry.speaker ? (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {entry.speaker}
                      </p>
                    ) : null}
                  </div>
                  {entry.rating !== null ? (
                    <AdminTag tone="accent">{entry.rating}/5</AdminTag>
                  ) : null}
                </div>
                {entry.comment ? (
                  <p className="text-sm whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
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
