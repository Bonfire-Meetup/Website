"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  type ComponentType,
  type ReactNode,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { getEventById, getPastEvents, getUpcomingEvents } from "@/data/events-calendar";
import { useCsrfToken } from "@/lib/api/csrf";
import { type EventSurveyFormState, submitEventSurvey } from "@/lib/forms/form-actions";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { useHaptics } from "@/lib/utils/haptics";
import {
  readLocalStorage,
  removeFromLocalStorage,
  writeLocalStorage,
} from "@/lib/utils/local-storage";
import { formatEventDateUTC } from "@/lib/utils/locale";

import {
  BoltIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  PlusIcon,
  SparklesIcon,
  StarFilledIcon,
} from "../shared/Icons";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { type DropdownGroup, SelectDropdown } from "../ui/SelectDropdown";

import { TurnstileWidget, type TurnstileWidgetHandle } from "./TurnstileWidget";

const initialState: EventSurveyFormState = { success: false };

const FAVORITE_PART_OPTIONS = [
  "technology_talk",
  "art_audio_management_talk",
  "interview_or_live_podcast",
  "networking_social_time",
  "other",
] as const;

const FUTURE_TOPIC_OPTIONS = [
  "technology",
  "art_animation_workflows",
  "game_audio_sound_design_music",
  "game_production_project_management",
  "game_marketing_community",
  "behind_the_scenes_interviews",
  "live_podcasts_panels",
  "other",
] as const;

const TALK_FORMAT_OPTIONS = [
  "perfect_as_is",
  "talks_should_be_shorter",
  "talks_could_go_deeper",
  "more_time_for_qna",
  "other",
] as const;

const SCALE_OPTIONS = ["0", "1", "2", "3", "4", "5"] as const;
const EMPTY_TALK_FEEDBACK_ENTRY = { comment: "", rating: "" };

interface EventSurveyDraft {
  eventId: string;
  favoriteParts: string[];
  favoritePartsOther: string;
  futureTopics: string[];
  futureTopicsOther: string;
  nextEventLikelihood: string;
  overallRating: string;
  suggestions: string;
  talkFeedback: Record<string, { comment: string; rating: string }>;
  talkFeedbackEnabled: boolean;
  talkFormat: string;
  talkFormatOther: string;
  talksOverallRating: string;
}

const EMPTY_DRAFT: EventSurveyDraft = {
  eventId: "",
  favoriteParts: [],
  favoritePartsOther: "",
  futureTopics: [],
  futureTopicsOther: "",
  nextEventLikelihood: "",
  overallRating: "",
  suggestions: "",
  talkFeedback: {},
  talkFeedbackEnabled: false,
  talkFormat: "",
  talkFormatOther: "",
  talksOverallRating: "",
};

interface ScaleGroupProps {
  fieldName: string;
  onChange: (value: string) => void;
  selectedValue: string;
}

interface MultiChoiceGroupProps {
  fieldName: "favoriteParts" | "futureTopics";
  onToggle: (value: string) => void;
  options: readonly string[];
  selectedValues: string[];
}

interface SingleChoiceGroupProps {
  fieldName: "talkFormat";
  onChange: (value: string) => void;
  options: readonly string[];
  selectedValue: string;
}

interface SurveySectionProps {
  borderClassName: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  iconSurfaceClassName: string;
  kicker: string;
  kickerClassName: string;
  orbClassName: string;
  title: string;
  children: ReactNode;
  className?: string;
}

function getStoredDraft(): EventSurveyDraft | null {
  return readLocalStorage(STORAGE_KEYS.DRAFT_EVENT_SURVEY);
}

function getPreselectedEventId(searchParams: URLSearchParams): string {
  const eventId = searchParams.get("eventId")?.trim();
  return eventId && getEventById(eventId) ? eventId : "";
}

function isDraftEmpty(draft: EventSurveyDraft): boolean {
  return !(
    draft.eventId ||
    draft.overallRating ||
    draft.favoriteParts.length > 0 ||
    draft.favoritePartsOther.trim() ||
    draft.futureTopics.length > 0 ||
    draft.futureTopicsOther.trim() ||
    draft.talkFormat ||
    draft.talkFormatOther.trim() ||
    draft.nextEventLikelihood ||
    draft.suggestions.trim() ||
    draft.talkFeedbackEnabled ||
    draft.talksOverallRating ||
    Object.values(draft.talkFeedback).some((entry) => entry.rating || entry.comment.trim())
  );
}

function toggleSelection(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function serializeTalkFeedback(talkFeedback: EventSurveyDraft["talkFeedback"]) {
  return Object.entries(talkFeedback).map(([talkKey, entry]) => ({
    comment: entry.comment || undefined,
    rating: entry.rating || undefined,
    talkKey,
  }));
}

function formatSpeakerNames(name: string | string[]) {
  return Array.isArray(name) ? name.join(", ") : name;
}

function getTalkPreviewLabel(speaker: { name: string | string[] }, fallbackNumber: number) {
  const fullName = formatSpeakerNames(speaker.name);
  const trimmedName = fullName?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  return `Talk ${fallbackNumber}`;
}

function ScaleGroup({ fieldName, onChange, selectedValue }: ScaleGroupProps) {
  const t = useTranslations("eventsSurveyPage.form");

  return (
    <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
      {SCALE_OPTIONS.map((value) => {
        const checked = selectedValue === value;

        return (
          <label
            key={value}
            className={`flex min-h-10 cursor-pointer items-center justify-center rounded-xl border px-1.5 py-2 text-xs font-semibold transition-colors sm:min-h-12 sm:px-3 sm:py-3 sm:text-sm ${
              checked
                ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400/40 dark:bg-brand-500/15 dark:text-brand-200"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 dark:hover:border-white/20"
            }`}
          >
            <input
              type="radio"
              name={fieldName}
              value={value}
              checked={checked}
              readOnly
              onClick={(e) => {
                e.preventDefault();
                onChange(checked ? "" : value);
              }}
              className="sr-only"
            />
            <span>{t(`scale.${value}`)}</span>
          </label>
        );
      })}
    </div>
  );
}

function MultiChoiceGroup({ fieldName, onToggle, options, selectedValues }: MultiChoiceGroupProps) {
  const t = useTranslations("eventsSurveyPage.form");

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
      {options.map((value) => {
        const checked = selectedValues.includes(value);

        return (
          <label
            key={value}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors sm:p-4 ${
              checked
                ? "border-brand-500/30 bg-brand-50/70 dark:border-brand-400/30 dark:bg-brand-500/10"
                : "border-neutral-200 bg-white/70 hover:border-neutral-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
            }`}
          >
            <input
              type="checkbox"
              name={fieldName}
              value={value}
              checked={checked}
              onChange={() => onToggle(value)}
              className="text-brand-600 focus:ring-brand-500/20 mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 dark:border-white/15 dark:bg-transparent"
            />
            <span className="min-w-0 text-sm leading-5 text-neutral-700 sm:leading-6 dark:text-neutral-200">
              {t(`options.${value}`)}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function SingleChoiceGroup({
  fieldName,
  onChange,
  options,
  selectedValue,
}: SingleChoiceGroupProps) {
  const t = useTranslations("eventsSurveyPage.form");

  return (
    <div className="grid gap-2.5 sm:gap-3">
      {options.map((value) => {
        const checked = selectedValue === value;

        return (
          <label
            key={value}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors sm:p-4 ${
              checked
                ? "border-brand-500/30 bg-brand-50/70 dark:border-brand-400/30 dark:bg-brand-500/10"
                : "border-neutral-200 bg-white/70 hover:border-neutral-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
            }`}
          >
            <input
              type="radio"
              name={fieldName}
              value={value}
              checked={checked}
              onChange={() => onChange(value)}
              className="text-brand-600 focus:ring-brand-500/20 mt-0.5 h-4 w-4 shrink-0 border-neutral-300 dark:border-white/15 dark:bg-transparent"
            />
            <span className="min-w-0 text-sm leading-5 text-neutral-700 sm:leading-6 dark:text-neutral-200">
              {t(`options.${value}`)}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function SurveySection({
  borderClassName,
  children,
  className,
  description,
  icon: Icon,
  iconClassName,
  iconSurfaceClassName,
  kicker,
  kickerClassName,
  orbClassName,
  title,
}: SurveySectionProps) {
  return (
    <section
      className={`relative overflow-visible rounded-[24px] border border-neutral-200/80 bg-white/70 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.32)] backdrop-blur-sm sm:rounded-[28px] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none ${borderClassName} ${className ?? ""}`}
    >
      <div
        className={`pointer-events-none absolute top-0 right-0 h-32 w-32 translate-x-9 -translate-y-9 rounded-full blur-3xl sm:h-36 sm:w-36 sm:translate-x-10 sm:-translate-y-10 ${orbClassName}`}
      />
      <div className="relative p-4 sm:p-5 lg:p-6">
        <div className="mb-4 space-y-3 border-b border-neutral-200/80 pb-4 sm:mb-5 sm:pb-5 dark:border-white/10">
          <p
            className={`text-[10px] font-semibold tracking-[0.18em] uppercase sm:text-[11px] ${kickerClassName}`}
          >
            {kicker}
          </p>
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${iconSurfaceClassName} ${iconClassName}`}
            >
              <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>
            <h3 className="text-lg leading-tight font-black tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
              {title}
            </h3>
          </div>
          <div>
            <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              {description}
            </p>
          </div>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

interface EventSurveyFormInnerProps {
  onReset: () => void;
}

function EventSurveyFormInner({ onReset }: EventSurveyFormInnerProps) {
  const t = useTranslations("eventsSurveyPage.form");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(submitEventSurvey, initialState);
  const [isTransitionPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const haptics = useHaptics();
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [turnstileExecuting, setTurnstileExecuting] = useState(false);
  const csrfToken = useCsrfToken();
  const [draft, setDraft] = useState<EventSurveyDraft>(EMPTY_DRAFT);
  const selectedEvent = useMemo(
    () => (draft.eventId ? getEventById(draft.eventId) : undefined),
    [draft.eventId],
  );
  const eventTalks = useMemo(() => selectedEvent?.speakers ?? [], [selectedEvent]);
  const ratedTalkCount = useMemo(
    () =>
      Object.values(draft.talkFeedback).filter((entry) => entry.rating || entry.comment.trim())
        .length,
    [draft.talkFeedback],
  );
  const serializedTalkFeedback = useMemo(
    () => JSON.stringify(serializeTalkFeedback(draft.talkFeedback)),
    [draft.talkFeedback],
  );
  const talkPreviewLabels = useMemo(
    () => eventTalks.slice(0, 3).map((speaker, index) => getTalkPreviewLabel(speaker, index + 1)),
    [eventTalks],
  );

  const eventGroups = useMemo<DropdownGroup[]>(() => {
    const now = new Date();
    const toOption = (event: ReturnType<typeof getUpcomingEvents>[number]) => ({
      label: `${event.title} · ${formatEventDateUTC(event.date, locale)}`,
      value: event.id,
    });
    const groups: DropdownGroup[] = [];
    const upcomingOptions = getUpcomingEvents(now).map(toOption);
    const pastOptions = getPastEvents(now).map(toOption);

    if (upcomingOptions.length > 0) {
      groups.push({ label: t("eventGroups.upcoming"), options: upcomingOptions });
    }

    if (pastOptions.length > 0) {
      groups.push({ label: t("eventGroups.past"), options: pastOptions });
    }

    return groups;
  }, [locale, t]);

  useEffect(() => {
    const storedDraft = getStoredDraft();
    const preselectedEventId = getPreselectedEventId(searchParams);

    if (storedDraft) {
      setDraft(storedDraft.eventId ? storedDraft : { ...storedDraft, eventId: preselectedEventId });
      return;
    }

    if (preselectedEventId) {
      setDraft((current) => ({ ...current, eventId: preselectedEventId }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (state.message === "captchaFailed") {
      haptics.error();
      setTurnstileResetKey((prev) => prev + 1);
      setTurnstileExecuting(false);
      return;
    }

    if (state.success) {
      haptics.success();
      setTurnstileExecuting(false);
      removeFromLocalStorage(STORAGE_KEYS.DRAFT_EVENT_SURVEY);
      return;
    }

    if (state.errors || state.message) {
      haptics.error();
      setTurnstileExecuting(false);
    }
  }, [haptics, state]);

  useEffect(() => {
    const persistDraft = () => {
      if (state.success || isDraftEmpty(draft)) {
        removeFromLocalStorage(STORAGE_KEYS.DRAFT_EVENT_SURVEY);
        return;
      }

      const storedDraft = getStoredDraft();
      if (storedDraft && JSON.stringify(storedDraft) === JSON.stringify(draft)) {
        return;
      }

      writeLocalStorage(STORAGE_KEYS.DRAFT_EVENT_SURVEY, draft);
    };

    const timeoutId = window.setTimeout(persistDraft, 1500);
    window.addEventListener("beforeunload", persistDraft);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("beforeunload", persistDraft);
    };
  }, [draft, state.success]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!turnstileRef.current) {
      return;
    }

    setTurnstileExecuting(true);

    try {
      const token = await turnstileRef.current.execute();

      if (!token) {
        haptics.error();
        setTurnstileResetKey((prev) => prev + 1);
        setTurnstileExecuting(false);
        return;
      }

      if (!formRef.current) {
        setTurnstileExecuting(false);
        return;
      }

      const formData = new FormData(formRef.current);
      formData.set("cf-turnstile-response", token);

      startTransition(() => {
        formAction(formData);
      });
    } catch {
      haptics.error();
      setTurnstileExecuting(false);
    }
  }

  function updateDraft(patch: Partial<EventSurveyDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function resetTalkFeedbackState() {
    return {
      talkFeedback: {},
      talkFeedbackEnabled: false,
      talksOverallRating: "",
    } satisfies Pick<
      EventSurveyDraft,
      "talkFeedback" | "talkFeedbackEnabled" | "talksOverallRating"
    >;
  }

  function updateEventId(eventId: string) {
    setDraft((current) => ({
      ...current,
      eventId,
      ...resetTalkFeedbackState(),
    }));
  }

  function updateTalkFeedback(
    talkKey: string,
    patch: Partial<{ comment: string; rating: string }>,
  ) {
    setDraft((current) => ({
      ...current,
      talkFeedback: {
        ...current.talkFeedback,
        [talkKey]: {
          ...EMPTY_TALK_FEEDBACK_ENTRY,
          ...current.talkFeedback[talkKey],
          ...patch,
        },
      },
    }));
  }

  function clearDraft() {
    setDraft(EMPTY_DRAFT);
    removeFromLocalStorage(STORAGE_KEYS.DRAFT_EVENT_SURVEY);
  }

  const hasDraft = !isDraftEmpty(draft);
  const inputBaseClass = "form-input-base";
  const inputNormalClass = "form-input";
  const inputErrorClass = "form-input-error";

  if (state.success) {
    return (
      <div className="glass-card no-hover-pop mx-auto max-w-3xl p-8 text-center sm:p-12">
        <div className="form-success-icon">
          <CheckIcon className="h-8 w-8 text-white" />
        </div>
        <h2 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-white">
          {t("successTitle")}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">{t("successMessage")}</p>
        <div className="mt-6 flex justify-center">
          <Button type="button" variant="plain" onClick={onReset}>
            {t("sendAnother")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="glass-card no-hover-pop mx-auto max-w-3xl p-4 sm:p-8 lg:p-10"
    >
      <div className="mb-5 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="form-header-icon shrink-0">
            <StarFilledIcon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
              {t("title")}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("subtitle")}</p>
          </div>
        </div>
        {hasDraft ? (
          <Button
            type="button"
            variant="plain"
            size="sm"
            onClick={clearDraft}
            className="form-clear-button w-full justify-center self-start sm:w-auto sm:self-auto"
          >
            <CloseIcon className="h-3.5 w-3.5" />
            {t("clearDraft")}
          </Button>
        ) : null}
      </div>

      {hasDraft ? <div className="form-draft-note">{t("draftNote")}</div> : null}

      <div className="space-y-5 sm:space-y-8">
        <div className="hidden sm:grid sm:[grid-template-columns:repeat(3,minmax(0,1fr))] sm:gap-3">
          {[t("summary.setup"), t("summary.highlights"), t("summary.future")].map(
            (label, index) => (
              <div
                key={label}
                className="relative min-w-[15rem] snap-start overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/45 px-4 py-3 backdrop-blur-sm sm:min-w-0 sm:py-3.5 dark:border-white/10 dark:bg-white/[0.025]"
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-neutral-300/80 via-neutral-200/60 to-transparent dark:from-white/20 dark:via-white/10 dark:to-transparent" />
                <div className="pl-3">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-400 uppercase dark:text-neutral-500">
                    Step 0{index + 1}
                  </p>
                  <p className="mt-1 text-sm leading-5 font-medium text-neutral-700 dark:text-neutral-200">
                    {label}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>

        <SurveySection
          borderClassName="hover:border-amber-400/45 dark:hover:border-amber-300/25"
          className="z-40"
          icon={CalendarIcon}
          iconClassName="text-amber-700 dark:text-amber-300"
          iconSurfaceClassName="bg-amber-100 dark:bg-amber-500/12"
          kicker={t("sections.setup.kicker")}
          kickerClassName="text-amber-700 dark:text-amber-300"
          orbClassName="bg-amber-400/18 dark:bg-amber-400/14"
          title={t("sections.setup.title")}
          description={t("sections.setup.description")}
        >
          <div className="space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <label htmlFor="survey-event" className="form-label">
                {t("questions.event")} <span className="text-rose-500">*</span>
              </label>
              <SelectDropdown
                id="survey-event"
                name="eventId"
                value={draft.eventId}
                options={[{ label: t("eventPlaceholder"), value: "", disabled: true }]}
                groups={eventGroups}
                onChange={updateEventId}
                nativeOnMobile
                required
                ariaInvalid={Boolean(state.errors?.eventId)}
                buttonClassName={`${inputBaseClass} ${
                  state.errors?.eventId ? inputErrorClass : inputNormalClass
                }`}
                nativeClassName={`${inputBaseClass} ${
                  state.errors?.eventId ? inputErrorClass : inputNormalClass
                }`}
                activeOptionClassName="bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300"
              />
              {state.errors?.eventId ? (
                <p className="form-error-text">{t("errors.eventRequired")}</p>
              ) : null}
            </div>

            <div className="space-y-3">
              <div>
                <label className="form-label">{t("questions.overallRating")}</label>
                <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                  {t("questions.overallRatingHint")}
                </p>
              </div>
              <ScaleGroup
                fieldName="overallRating"
                selectedValue={draft.overallRating}
                onChange={(overallRating) => updateDraft({ overallRating })}
              />
            </div>
          </div>
        </SurveySection>

        <SurveySection
          borderClassName="hover:border-cyan-400/45 dark:hover:border-cyan-300/25"
          className="z-30"
          icon={SparklesIcon}
          iconClassName="text-cyan-700 dark:text-cyan-300"
          iconSurfaceClassName="bg-cyan-100 dark:bg-cyan-500/12"
          kicker={t("sections.highlights.kicker")}
          kickerClassName="text-cyan-700 dark:text-cyan-300"
          orbClassName="bg-cyan-400/18 dark:bg-cyan-400/14"
          title={t("sections.highlights.title")}
          description={t("sections.highlights.description")}
        >
          <div className="space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <label className="form-label">{t("questions.favoriteParts")}</label>
              <MultiChoiceGroup
                fieldName="favoriteParts"
                options={FAVORITE_PART_OPTIONS}
                selectedValues={draft.favoriteParts}
                onToggle={(value) =>
                  updateDraft({ favoriteParts: toggleSelection(draft.favoriteParts, value) })
                }
              />
              {draft.favoriteParts.includes("other") ? (
                <div>
                  <input
                    type="text"
                    name="favoritePartsOther"
                    value={draft.favoritePartsOther}
                    onChange={(e) => updateDraft({ favoritePartsOther: e.target.value })}
                    className={`${inputBaseClass} ${
                      state.errors?.favoritePartsOther ? inputErrorClass : inputNormalClass
                    }`}
                    placeholder={t("otherPlaceholder")}
                  />
                  {state.errors?.favoritePartsOther ? (
                    <p className="form-error-text">
                      {t(`errors.${state.errors.favoritePartsOther}`)}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <label className="form-label">{t("questions.futureTopics")}</label>
              <MultiChoiceGroup
                fieldName="futureTopics"
                options={FUTURE_TOPIC_OPTIONS}
                selectedValues={draft.futureTopics}
                onToggle={(value) =>
                  updateDraft({ futureTopics: toggleSelection(draft.futureTopics, value) })
                }
              />
              {draft.futureTopics.includes("other") ? (
                <div>
                  <input
                    type="text"
                    name="futureTopicsOther"
                    value={draft.futureTopicsOther}
                    onChange={(e) => updateDraft({ futureTopicsOther: e.target.value })}
                    className={`${inputBaseClass} ${
                      state.errors?.futureTopicsOther ? inputErrorClass : inputNormalClass
                    }`}
                    placeholder={t("otherPlaceholder")}
                  />
                  {state.errors?.futureTopicsOther ? (
                    <p className="form-error-text">
                      {t(`errors.${state.errors.futureTopicsOther}`)}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </SurveySection>

        <SurveySection
          borderClassName="hover:border-rose-400/45 dark:hover:border-rose-300/25"
          className="z-20"
          icon={BoltIcon}
          iconClassName="text-rose-700 dark:text-rose-300"
          iconSurfaceClassName="bg-rose-100 dark:bg-rose-500/12"
          kicker={t("sections.talks.kicker")}
          kickerClassName="text-rose-700 dark:text-rose-300"
          orbClassName="bg-rose-400/18 dark:bg-rose-400/14"
          title={t("sections.talks.title")}
          description={t("sections.talks.description")}
        >
          <div className="space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <label className="form-label">{t("questions.talkFormat")}</label>
              <SingleChoiceGroup
                fieldName="talkFormat"
                options={TALK_FORMAT_OPTIONS}
                selectedValue={draft.talkFormat}
                onChange={(talkFormat) => updateDraft({ talkFormat })}
              />
              {draft.talkFormat === "other" ? (
                <div>
                  <input
                    type="text"
                    name="talkFormatOther"
                    value={draft.talkFormatOther}
                    onChange={(e) => updateDraft({ talkFormatOther: e.target.value })}
                    className={`${inputBaseClass} ${
                      state.errors?.talkFormatOther ? inputErrorClass : inputNormalClass
                    }`}
                    placeholder={t("otherPlaceholder")}
                  />
                  {state.errors?.talkFormatOther ? (
                    <p className="form-error-text">{t(`errors.${state.errors.talkFormatOther}`)}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </SurveySection>

        {selectedEvent && eventTalks.length > 0 ? (
          <SurveySection
            borderClassName="hover:border-orange-400/45 dark:hover:border-orange-300/25"
            className="z-15"
            icon={BoltIcon}
            iconClassName="text-orange-700 dark:text-orange-300"
            iconSurfaceClassName="bg-orange-100 dark:bg-orange-500/12"
            kicker={t("sections.talkFeedback.kicker")}
            kickerClassName="text-orange-700 dark:text-orange-300"
            orbClassName="bg-orange-400/18 dark:bg-orange-400/14"
            title={t("sections.talkFeedback.title")}
            description={t("sections.talkFeedback.description")}
          >
            <div className="space-y-4 sm:space-y-5">
              <button
                type="button"
                onClick={() =>
                  updateDraft({
                    ...(draft.talkFeedbackEnabled
                      ? resetTalkFeedbackState()
                      : {
                          talkFeedbackEnabled: true,
                          talkFeedback: draft.talkFeedback,
                          talksOverallRating: draft.talksOverallRating,
                        }),
                  })
                }
                className={`flex w-full items-start justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors sm:items-center sm:gap-4 sm:px-5 ${
                  draft.talkFeedbackEnabled
                    ? "border-brand-500/30 bg-brand-50/70 dark:border-brand-400/30 dark:bg-brand-500/10"
                    : "border-neutral-200/80 bg-white/55 hover:border-neutral-300 hover:bg-white/75 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
                }`}
                aria-expanded={draft.talkFeedbackEnabled}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        draft.talkFeedbackEnabled
                          ? "bg-brand-500 dark:bg-brand-400 text-white dark:text-neutral-950"
                          : "bg-neutral-900/5 text-neutral-600 dark:bg-white/10 dark:text-neutral-300"
                      }`}
                    >
                      {draft.talkFeedbackEnabled ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <PlusIcon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {t("questions.talkFeedbackToggle")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    {draft.talkFeedbackEnabled
                      ? t("questions.talkFeedbackExpandedHint")
                      : t("questions.talkFeedbackSummary", {
                          count: ratedTalkCount,
                          total: eventTalks.length,
                        })}
                  </p>
                  {!draft.talkFeedbackEnabled ? (
                    <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                      {talkPreviewLabels.map((label) => (
                        <span
                          key={label}
                          className="max-w-full truncate rounded-full border border-neutral-200/80 bg-white/70 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300"
                          title={label}
                        >
                          {label}
                        </span>
                      ))}
                      {eventTalks.length > 3 ? (
                        <span className="rounded-full border border-neutral-200/80 bg-white/70 px-2.5 py-1 text-xs font-medium text-neutral-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-400">
                          {t("questions.moreTalks", { count: eventTalks.length - 3 })}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </button>

              {draft.talkFeedbackEnabled ? (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div>
                      <label className="form-label">{t("questions.talksOverallRating")}</label>
                      <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                        {t("questions.talksOverallRatingHint")}
                      </p>
                    </div>
                    <ScaleGroup
                      fieldName="talksOverallRating"
                      selectedValue={draft.talksOverallRating}
                      onChange={(talksOverallRating) => updateDraft({ talksOverallRating })}
                    />
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/45 dark:border-white/10 dark:bg-white/[0.025]">
                    {eventTalks.map((speaker, index) => {
                      const talkKey = String(index);
                      const entry = draft.talkFeedback[talkKey] ?? EMPTY_TALK_FEEDBACK_ENTRY;
                      const speakerName = formatSpeakerNames(speaker.name);

                      return (
                        <div
                          key={talkKey}
                          className={`space-y-3 p-3 sm:p-4 ${
                            index === 0 ? "" : "border-t border-neutral-200/70 dark:border-white/10"
                          }`}
                        >
                          <div>
                            <h3 className="text-sm leading-6 font-semibold text-neutral-900 dark:text-white">
                              {speaker.topic}
                            </h3>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                              {speakerName}
                            </p>
                          </div>

                          <div>
                            <label className="form-label">{t("questions.talkRating")}</label>
                            <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                              {t("questions.talkRatingHint")}
                            </p>
                            <ScaleGroup
                              fieldName={`talk-rating-${talkKey}`}
                              selectedValue={entry.rating}
                              onChange={(rating) => updateTalkFeedback(talkKey, { rating })}
                            />
                          </div>

                          <div>
                            <label className="form-label" htmlFor={`talk-comment-${talkKey}`}>
                              {t("questions.talkComment")}
                            </label>
                            <textarea
                              id={`talk-comment-${talkKey}`}
                              rows={2}
                              value={entry.comment}
                              onChange={(e) =>
                                updateTalkFeedback(talkKey, { comment: e.target.value })
                              }
                              className={`${inputBaseClass} ${inputNormalClass} resize-y`}
                              placeholder={t("talkCommentPlaceholder")}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </SurveySection>
        ) : null}

        <SurveySection
          borderClassName="hover:border-violet-400/45 dark:hover:border-violet-300/25"
          className="z-10"
          icon={StarFilledIcon}
          iconClassName="text-violet-700 dark:text-violet-300"
          iconSurfaceClassName="bg-violet-100 dark:bg-violet-500/12"
          kicker={t("sections.future.kicker")}
          kickerClassName="text-violet-700 dark:text-violet-300"
          orbClassName="bg-violet-400/18 dark:bg-violet-400/14"
          title={t("sections.future.title")}
          description={t("sections.future.description")}
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <label className="form-label">{t("questions.nextEventLikelihood")}</label>
                <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                  {t("questions.nextEventLikelihoodHint")}
                </p>
              </div>
              <ScaleGroup
                fieldName="nextEventLikelihood"
                selectedValue={draft.nextEventLikelihood}
                onChange={(nextEventLikelihood) => updateDraft({ nextEventLikelihood })}
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="survey-suggestions" className="form-label">
                {t("questions.suggestions")}
              </label>
              <textarea
                id="survey-suggestions"
                name="suggestions"
                rows={6}
                value={draft.suggestions}
                onChange={(e) => updateDraft({ suggestions: e.target.value })}
                className={`${inputBaseClass} resize-y ${
                  state.errors?.suggestions ? inputErrorClass : inputNormalClass
                }`}
                placeholder={t("suggestionsPlaceholder")}
              />
              {state.errors?.suggestions ? (
                <p className="form-error-text">{t(`errors.${state.errors.suggestions}`)}</p>
              ) : null}
            </div>
          </div>
        </SurveySection>

        <input
          type="text"
          name="website"
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input
          type="hidden"
          name="talkFeedbackEnabled"
          value={draft.talkFeedbackEnabled ? "true" : "false"}
        />
        <input type="hidden" name="talkFeedbackJson" value={serializedTalkFeedback} />

        {state.errors?.form || state.message ? (
          <div className="form-error-alert">
            {state.errors?.form ? t(`errors.${state.errors.form}`) : t(`errors.${state.message}`)}
          </div>
        ) : null}

        <TurnstileWidget
          ref={turnstileRef}
          mode="execute"
          className="flex justify-center"
          resetKey={state.message === "captchaFailed" ? turnstileResetKey : undefined}
        />

        <Button
          type="submit"
          variant="fire-primary"
          disabled={isPending || isTransitionPending || turnstileExecuting || !csrfToken}
          className="w-full"
        >
          {isPending || isTransitionPending || turnstileExecuting ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size="md" />
              {t("submitting")}
            </span>
          ) : (
            t("submit")
          )}
        </Button>
      </div>
    </form>
  );
}

export function EventSurveyForm() {
  const [instanceKey, setInstanceKey] = useState(0);

  return (
    <EventSurveyFormInner
      key={instanceKey}
      onReset={() => {
        removeFromLocalStorage(STORAGE_KEYS.DRAFT_EVENT_SURVEY);
        setInstanceKey((prev) => prev + 1);
      }}
    />
  );
}
