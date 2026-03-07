"use client";

import { useEffect, useState, type ReactNode } from "react";

import { QuestionRow } from "@/components/questions/QuestionRow";
import {
  type SortMode,
  type TalkFilter,
  useCommunityQuestionsPanel,
} from "@/components/questions/useCommunityQuestionsPanel";
import {
  BoltIcon,
  CloseIcon,
  ClockIcon,
  MenuIcon,
  QuestionMarkCircleIcon,
  RefreshIcon,
  SendIcon,
} from "@/components/shared/Icons";
import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { formatDateTimeUTC } from "@/lib/utils/locale";

import { LoadingSpinner } from "../ui/LoadingSpinner";

import { DEFAULT_PANEL_THEME, PANEL_THEMES, type PanelTheme } from "./panel-themes";

export type { PanelTheme };
export { DEFAULT_PANEL_THEME, PANEL_THEMES };

interface CommunityQuestionsPanelProps {
  eventId: string;
  theme?: PanelTheme;
  talkOptions: { key: string; topic: string }[];
  defaultAutoRefresh?: boolean;
  mode?: "default" | "live";
  showAutoRefreshToggle?: boolean;
}

type MobilePanel = "composer" | "filters" | null;

const PILL_SELECT_BASE =
  "min-w-0 max-w-full rounded-full border border-neutral-200/70 bg-neutral-50 py-1 pl-2.5 pr-6 text-[11px] font-medium text-neutral-600 outline-none transition-colors dark:border-white/10 dark:bg-white/5 dark:text-neutral-300";
const MOBILE_DOCK_BUTTON_BASE =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors";
const MOBILE_DOCK_BUTTON_INACTIVE =
  "border-neutral-200/80 bg-neutral-50 dark:border-white/12 dark:bg-white/8";
const MOBILE_DOCK_BUTTON_ACTIVE =
  "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900";
const MOBILE_SHEET_WRAPPER = "fixed inset-x-0 bottom-20 z-40 px-3 md:hidden";
const MOBILE_SHEET_PANEL =
  "rounded-[1.6rem] border border-neutral-200/80 bg-white/96 p-3 shadow-[0_28px_80px_-30px_rgba(15,23,42,0.55)] backdrop-blur dark:border-white/12 dark:bg-neutral-950/94";

function CommunityQuestionsPanelSkeleton() {
  return (
    <div className="mt-6 animate-pulse space-y-4 rounded-3xl border border-neutral-200/80 bg-gradient-to-b from-white/90 to-neutral-50/70 p-3.5 sm:p-5 dark:border-white/10 dark:from-white/8 dark:to-white/[0.03]">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="h-2 w-10 rounded-full bg-neutral-200 dark:bg-white/15" />
          <div className="h-6 w-44 rounded-lg bg-neutral-200 dark:bg-white/15" />
          <div className="h-3 w-32 rounded-full bg-neutral-200 dark:bg-white/15" />
        </div>
        <div className="hidden gap-2 md:flex">
          <div className="h-9 w-24 rounded-full bg-neutral-200 dark:bg-white/15" />
          <div className="h-9 w-24 rounded-full bg-neutral-200 dark:bg-white/15" />
          <div className="h-9 w-28 rounded-full bg-neutral-200 dark:bg-white/15" />
        </div>
      </div>

      <div className="hidden rounded-2xl border border-neutral-200/70 bg-white/70 p-3 md:block dark:border-white/10 dark:bg-white/5">
        <div className="flex items-end gap-2">
          <div className="h-[52px] flex-1 rounded-xl bg-neutral-200 dark:bg-white/10" />
          <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-white/10" />
        </div>
        <div className="mt-2 flex gap-2">
          <div className="h-8 flex-1 rounded-full bg-neutral-200 dark:bg-white/10" />
          <div className="h-8 w-14 rounded-full bg-neutral-200 dark:bg-white/10" />
        </div>
      </div>

      <div className="hidden gap-2 md:flex">
        <div className="h-8 w-32 rounded-full bg-neutral-200 dark:bg-white/10" />
        <div className="h-8 w-28 rounded-full bg-neutral-200 dark:bg-white/10" />
      </div>

      <div className="space-y-2">
        <div className="h-14 rounded-2xl bg-neutral-200 dark:bg-white/10" />
        <div className="h-14 rounded-2xl bg-neutral-200 dark:bg-white/10" />
        <div className="h-14 rounded-2xl bg-neutral-200 dark:bg-white/10" />
      </div>

      <div className="sticky bottom-3 z-20 -mx-1 mt-2 md:hidden">
        <div className="flex items-center gap-2 rounded-[1.4rem] border border-neutral-200/80 bg-white/92 p-2 dark:border-white/12 dark:bg-neutral-950/88">
          <div className="h-11 flex-1 rounded-full bg-neutral-200 dark:bg-white/10" />
          <div className="h-11 w-28 rounded-full bg-neutral-200 dark:bg-white/10" />
          <div className="h-11 w-11 rounded-full bg-neutral-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function RefreshButton({
  isFetching,
  idleLabel,
  loadingLabel,
  onRefresh,
  className,
  iconClassName = "h-4.5 w-4.5",
}: {
  isFetching: boolean;
  idleLabel: string;
  loadingLabel: string;
  onRefresh: () => void;
  className: string;
  iconClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isFetching}
      aria-label={isFetching ? loadingLabel : idleLabel}
      className={className}
    >
      {isFetching ? (
        <LoadingSpinner size="sm" ariaLabel={loadingLabel} />
      ) : (
        <RefreshIcon className={iconClassName} />
      )}
    </button>
  );
}

function QuestionComposerFields({
  canSubmit,
  focusBorderClassName,
  isSubmitting,
  onSubmit,
  onTextChange,
  onTalkChange,
  rows,
  selectedTalkIndex,
  showCompactSelect,
  submitLabel,
  talkOptions,
  text,
  placeholder,
  generalTalkLabel,
}: {
  canSubmit: boolean;
  focusBorderClassName: string;
  isSubmitting: boolean;
  onSubmit: () => void;
  onTextChange: (value: string) => void;
  onTalkChange: (value: string) => void;
  rows: 2 | 3;
  selectedTalkIndex: string;
  showCompactSelect: boolean;
  submitLabel: string;
  talkOptions: { key: string; topic: string }[];
  text: string;
  placeholder: string;
  generalTalkLabel: string;
}) {
  const textareaMinHeight = rows === 3 ? "min-h-[88px]" : "min-h-[52px]";
  const submitButtonSize = rows === 3 ? "h-11 w-11" : "h-10 w-10 sm:hover:scale-105";
  const submitButtonClassName =
    rows === 3
      ? "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
      : "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";
  const selectClassName = showCompactSelect
    ? `w-full flex-1 truncate ${PILL_SELECT_BASE} ${focusBorderClassName} sm:w-auto sm:max-w-[20rem] sm:flex-none`
    : `w-full flex-1 truncate ${PILL_SELECT_BASE} ${focusBorderClassName}`;

  return (
    <>
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder={placeholder}
          maxLength={600}
          rows={rows}
          className={`${textareaMinHeight} flex-1 resize-none rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-2.5 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:bg-white/8 ${focusBorderClassName}`}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          aria-label={submitLabel}
          className={`${submitButtonClassName} ${submitButtonSize}`}
        >
          {isSubmitting ? (
            <LoadingSpinner size="sm" ariaLabel={submitLabel} />
          ) : (
            <SendIcon className="h-4 w-4 translate-x-px" />
          )}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          value={selectedTalkIndex}
          onChange={(event) => onTalkChange(event.target.value)}
          className={selectClassName}
        >
          <option value="none">{generalTalkLabel}</option>
          {talkOptions.map((option, index) => (
            <option key={option.key} value={String(index)}>
              {option.topic}
            </option>
          ))}
        </select>

        {text.length > 400 && (
          <span className="ml-auto text-[10px] text-neutral-400 tabular-nums dark:text-neutral-500">
            {text.length}/600
          </span>
        )}
      </div>
    </>
  );
}

function QuestionFiltersFields({
  activeTalkFilter,
  focusBorderClassName,
  onSortModeChange,
  onTalkFilterChange,
  sortBoostsLabel,
  sortDateLabel,
  sortMode,
  talkOptions,
  allTalksLabel,
  generalOnlyLabel,
}: {
  activeTalkFilter: TalkFilter;
  focusBorderClassName: string;
  onSortModeChange: (value: SortMode) => void;
  onTalkFilterChange: (value: TalkFilter) => void;
  sortBoostsLabel: string;
  sortDateLabel: string;
  sortMode: SortMode;
  talkOptions: { key: string; topic: string }[];
  allTalksLabel: string;
  generalOnlyLabel: string;
}) {
  const selectClassName = `${PILL_SELECT_BASE} ${focusBorderClassName}`;

  return (
    <>
      <select
        value={activeTalkFilter}
        onChange={(event) => onTalkFilterChange(event.target.value as TalkFilter)}
        className={selectClassName}
      >
        <option value="all">{allTalksLabel}</option>
        <option value="general">{generalOnlyLabel}</option>
        {talkOptions.map((option, index) => (
          <option key={option.key} value={String(index)}>
            {option.topic}
          </option>
        ))}
      </select>

      <select
        value={sortMode}
        onChange={(event) => onSortModeChange(event.target.value as SortMode)}
        className={selectClassName}
      >
        <option value="boosts">{sortBoostsLabel}</option>
        <option value="date">{sortDateLabel}</option>
      </select>
    </>
  );
}

function MobileSheet({
  children,
  eyebrow,
  onClose,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className={MOBILE_SHEET_WRAPPER}>
      <div className={MOBILE_SHEET_PANEL}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase dark:text-neutral-400">
              {eyebrow}
            </p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200/80 bg-neutral-50 text-neutral-600 dark:border-white/12 dark:bg-white/8 dark:text-neutral-200"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function MobileDockButton({
  active,
  children,
  className = "",
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${MOBILE_DOCK_BUTTON_BASE} ${className} ${active ? MOBILE_DOCK_BUTTON_ACTIVE : MOBILE_DOCK_BUTTON_INACTIVE}`}
    >
      {children}
    </button>
  );
}

export function CommunityQuestionsPanel({
  eventId,
  theme = DEFAULT_PANEL_THEME,
  talkOptions,
  defaultAutoRefresh = false,
  mode = "default",
  showAutoRefreshToggle = false,
}: CommunityQuestionsPanelProps) {
  const panel = useCommunityQuestionsPanel(eventId);
  const { handleRefresh, isWindowOpen } = panel;
  const isLiveView = mode === "live";
  const canSubmitQuestion =
    panel.canParticipate && panel.text.trim().length >= 3 && !panel.createQuestion.isPending;
  const isUpcomingMode = !panel.isWindowOpen && !panel.isReplayMode;
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(defaultAutoRefresh);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const [mobileSuccessVisible, setMobileSuccessVisible] = useState(false);
  const lastRefreshLabel =
    panel.dataUpdatedAt > 0
      ? formatDateTimeUTC(new Date(panel.dataUpdatedAt).toISOString(), panel.locale)
      : null;
  const hasAnyQuestions = (panel.data?.items.length ?? 0) > 0;
  const panelTitle = panel.isReplayMode
    ? panel.t("questions.windowReplay")
    : isUpcomingMode
      ? panel.t("questions.windowOpensSoon")
      : panel.t("questions.title");
  const showQuestionComposer = !isLiveView && panel.isWindowOpen && panel.isAuthenticated;
  const showQuestionFilters = !isUpcomingMode && (!panel.isReplayMode || hasAnyQuestions);
  const showMobileDock =
    isWindowOpen && (!isLiveView || showQuestionFilters || panel.isAuthenticated);
  const handleComposerTextChange = (value: string) => panel.setText(value);
  const handleComposerTalkChange = (value: string) => panel.setSelectedTalkIndex(value);
  const handleFilterTalkChange = (value: TalkFilter) => panel.setActiveTalkFilter(value);
  const handleFilterSortChange = (value: SortMode) => panel.setSortMode(value);

  useEffect(() => {
    if (!showAutoRefreshToggle || !autoRefreshEnabled || !isWindowOpen) {
      return;
    }

    const tick = window.setInterval(() => {
      if (!document.hidden) {
        handleRefresh();
      }
    }, 15000);

    return () => window.clearInterval(tick);
  }, [autoRefreshEnabled, handleRefresh, isWindowOpen, showAutoRefreshToggle]);

  useEffect(() => {
    if (!isWindowOpen || isLiveView || !panel.isAuthenticated) {
      setMobilePanel(null);
    }
  }, [isLiveView, isWindowOpen, panel.isAuthenticated]);

  useEffect(() => {
    if (isUpcomingMode && mobilePanel === "filters") {
      setMobilePanel(null);
    }
  }, [isUpcomingMode, mobilePanel]);

  useEffect(() => {
    if (panel.submissionCount === 0) {
      return;
    }

    setMobilePanel(null);
    setMobileSuccessVisible(true);

    const timeoutId = window.setTimeout(() => setMobileSuccessVisible(false), 2400);

    return () => window.clearTimeout(timeoutId);
  }, [panel.submissionCount]);

  if (panel.isLoading && !panel.data) {
    return <CommunityQuestionsPanelSkeleton />;
  }

  return (
    <div className="mt-6 space-y-4 rounded-3xl border border-neutral-200/80 bg-gradient-to-b from-white/90 to-neutral-50/70 p-3.5 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.45)] sm:p-5 dark:border-white/10 dark:from-white/8 dark:to-white/[0.03]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase dark:text-neutral-400">
            {panel.t("questions.eyebrow")}
          </p>
          <h4 className="mt-1 text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
            {panelTitle}
          </h4>
          {isWindowOpen && lastRefreshLabel && (
            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              {panel.t("questions.lastRefresh", { date: lastRefreshLabel })}
            </p>
          )}
        </div>

        {isWindowOpen && (
          <div className="hidden w-full flex-col gap-2 md:flex md:w-auto md:items-end">
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {showAutoRefreshToggle && (
                <label className="inline-flex min-h-9 items-center gap-2 rounded-full border border-neutral-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:border-white/15 dark:bg-white/8 dark:text-neutral-200">
                  <input
                    type="checkbox"
                    checked={autoRefreshEnabled}
                    onChange={(event) => setAutoRefreshEnabled(event.target.checked)}
                    className="h-3.5 w-3.5 rounded border-neutral-300 text-neutral-900 accent-neutral-900 dark:border-white/20 dark:accent-white"
                  />
                  {panel.t("questions.autoRefresh")}
                </label>
              )}

              <RefreshButton
                isFetching={panel.isFetching}
                idleLabel={panel.t("questions.refresh")}
                loadingLabel={panel.t("questions.refreshing")}
                onRefresh={handleRefresh}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/8 dark:text-neutral-200 dark:hover:bg-white/15"
                iconClassName="relative -top-px h-3.5 w-3.5"
              />

              {!isLiveView && panel.isAuthenticated && (
                <div
                  className={`inline-flex min-h-9 items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-semibold sm:self-auto ${ENGAGEMENT_BRANDING.boost.classes.activeGradient} ${ENGAGEMENT_BRANDING.boost.classes.activeText} ${ENGAGEMENT_BRANDING.boost.classes.activeShadow}`}
                >
                  <BoltIcon className="h-3.5 w-3.5" />
                  {panel.t("questions.boostsLeft", { count: String(panel.availableBoosts ?? 0) })}
                </div>
              )}

              {!isLiveView && panel.isAuthHydrated && !panel.isAuthenticated && (
                <button
                  type="button"
                  onClick={panel.handleAuthRedirect}
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${ENGAGEMENT_BRANDING.access.classes.signInNav}`}
                >
                  <QuestionMarkCircleIcon className="h-3.5 w-3.5" />
                  <span>{panel.t("questions.signInPrompt")}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showQuestionComposer && (
        <div className="hidden rounded-2xl border border-neutral-200/70 bg-white/70 p-3 md:block dark:border-white/10 dark:bg-white/[0.04]">
          <QuestionComposerFields
            canSubmit={canSubmitQuestion}
            focusBorderClassName={theme.focusBorder}
            generalTalkLabel={panel.t("questions.generalTalk")}
            isSubmitting={panel.createQuestion.isPending}
            onSubmit={panel.handleSubmit}
            onTalkChange={handleComposerTalkChange}
            onTextChange={handleComposerTextChange}
            placeholder={panel.t("questions.placeholder")}
            rows={2}
            selectedTalkIndex={panel.selectedTalkIndex}
            showCompactSelect
            submitLabel={panel.t("questions.askButton")}
            talkOptions={talkOptions}
            text={panel.text}
          />
        </div>
      )}

      {isUpcomingMode && (
        <div className={`rounded-2xl border px-4 py-5 ${theme.card}`}>
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.blockBorder} bg-white shadow-sm dark:bg-white/[0.07]`}
            >
              <ClockIcon className={`h-4 w-4 ${theme.icon}`} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {panel.t("questions.windowClosedInfo")}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {panel.t("questions.windowClosedHint")}
              </p>
            </div>
          </div>
        </div>
      )}

      {panel.error && (
        <p className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm font-medium text-red-600 dark:border-red-300/25 dark:bg-red-500/10 dark:text-red-300">
          {panel.error}
        </p>
      )}

      {!isUpcomingMode && (
        <div className="space-y-3">
          {showQuestionFilters && (
            <div className="hidden flex-wrap gap-2 md:flex">
              <QuestionFiltersFields
                activeTalkFilter={panel.activeTalkFilter}
                allTalksLabel={panel.t("questions.filters.allTalks")}
                focusBorderClassName={theme.focusBorder}
                generalOnlyLabel={panel.t("questions.filters.generalOnly")}
                onSortModeChange={handleFilterSortChange}
                onTalkFilterChange={handleFilterTalkChange}
                sortBoostsLabel={panel.t("questions.filters.sortBoosts")}
                sortDateLabel={panel.t("questions.filters.sortDate")}
                sortMode={panel.sortMode}
                talkOptions={talkOptions}
              />
            </div>
          )}

          <div
            className={
              isLiveView
                ? "scrollbar-thin max-h-[62vh] space-y-0 overflow-y-auto overscroll-contain pr-1"
                : "space-y-0"
            }
          >
            {panel.isLoading && (
              <div className="flex items-center gap-3 rounded-xl border border-neutral-200/70 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <div className="questions-loader-modern max-w-[240px] flex-1">
                  <div className="questions-loader-modern__beam" />
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {panel.t("questions.loading")}
                </div>
              </div>
            )}

            {!panel.isLoading && panel.isWindowOpen && panel.visibleQuestions.length === 0 && (
              <div className="rounded-xl border border-dashed border-neutral-200 px-3 py-4 text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
                {panel.t("questions.empty")}
              </div>
            )}

            {!panel.isLoading && panel.isReplayMode && panel.visibleQuestions.length === 0 && (
              <div className="rounded-xl border border-dashed border-neutral-200/80 bg-neutral-50/60 px-3 py-4 text-sm text-neutral-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-neutral-300">
                {panel.t("questions.replayEmpty")}
              </div>
            )}

            {panel.visibleQuestions.map((question) => (
              <QuestionRow
                key={question.id}
                anonymousLabel={panel.t("anonymous")}
                confirmDeleteId={panel.confirmDeleteId}
                deleteCancelLabel={panel.t("questions.deleteCancel")}
                deleteConfirmLabel={panel.t("questions.deleteConfirm")}
                deleteLabel={panel.t("questions.delete")}
                deleteQuestionPending={panel.deleteQuestion.isPending}
                isLiveView={isLiveView}
                isReplayMode={panel.isReplayMode}
                isWindowOpen={panel.isWindowOpen}
                locale={panel.locale}
                onConfirmDelete={panel.handleConfirmDelete}
                onRequestDelete={(id) => panel.setConfirmDeleteId(id)}
                onToggleBoost={panel.handleToggleBoost}
                ownBubbleGradient={theme.ownBubble}
                privateOnlyLabel={panel.t("privateOnly")}
                question={question}
                selfLabel={panel.t("questions.selfLabel")}
                setConfirmDeleteId={panel.setConfirmDeleteId}
                talkOptions={talkOptions}
                toggleBoostPending={panel.toggleBoostPending}
              />
            ))}
          </div>
        </div>
      )}

      {mobilePanel && (
        <div
          className="fixed inset-0 z-30 bg-neutral-950/35 backdrop-blur-[1px] md:hidden"
          onClick={() => setMobilePanel(null)}
          aria-hidden="true"
        />
      )}

      {showQuestionComposer && mobilePanel === "composer" && (
        <MobileSheet
          eyebrow={panel.t("questions.eyebrow")}
          onClose={() => setMobilePanel(null)}
          title={panel.t("questions.askButton")}
        >
          <QuestionComposerFields
            canSubmit={canSubmitQuestion}
            focusBorderClassName={theme.focusBorder}
            generalTalkLabel={panel.t("questions.generalTalk")}
            isSubmitting={panel.createQuestion.isPending}
            onSubmit={panel.handleSubmit}
            onTalkChange={handleComposerTalkChange}
            onTextChange={handleComposerTextChange}
            placeholder={panel.t("questions.placeholder")}
            rows={3}
            selectedTalkIndex={panel.selectedTalkIndex}
            showCompactSelect={false}
            submitLabel={panel.t("questions.askButton")}
            talkOptions={talkOptions}
            text={panel.text}
          />
        </MobileSheet>
      )}

      {showQuestionFilters && mobilePanel === "filters" && (
        <MobileSheet
          eyebrow={panel.t("questions.eyebrow")}
          onClose={() => setMobilePanel(null)}
          title={panel.t("questions.filters.title")}
        >
          <div className="flex flex-col gap-2">
            <QuestionFiltersFields
              activeTalkFilter={panel.activeTalkFilter}
              allTalksLabel={panel.t("questions.filters.allTalks")}
              focusBorderClassName={theme.focusBorder}
              generalOnlyLabel={panel.t("questions.filters.generalOnly")}
              onSortModeChange={handleFilterSortChange}
              onTalkFilterChange={handleFilterTalkChange}
              sortBoostsLabel={panel.t("questions.filters.sortBoosts")}
              sortDateLabel={panel.t("questions.filters.sortDate")}
              sortMode={panel.sortMode}
              talkOptions={talkOptions}
            />
          </div>
        </MobileSheet>
      )}

      {showMobileDock && (
        <div className="sticky bottom-3 z-20 -mx-1 mt-2 md:hidden">
          {mobileSuccessVisible && (
            <div className="mb-2 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/95 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <SendIcon className="h-3.5 w-3.5" />
                <span>{panel.t("questions.submittedToast")}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-[1.4rem] border border-neutral-200/80 bg-white/92 p-2 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/12 dark:bg-neutral-950/88">
            {!isLiveView && panel.isAuthHydrated && !panel.isAuthenticated ? (
              <button
                type="button"
                onClick={panel.handleAuthRedirect}
                className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${ENGAGEMENT_BRANDING.access.classes.signInNav}`}
              >
                <QuestionMarkCircleIcon className="h-4 w-4" />
                <span>{panel.t("questions.signInPrompt")}</span>
              </button>
            ) : (
              <>
                {showQuestionComposer && (
                  <MobileDockButton
                    active={mobilePanel === "composer"}
                    className="flex-1 text-neutral-800 dark:text-neutral-100"
                    onClick={() =>
                      setMobilePanel((current) => (current === "composer" ? null : "composer"))
                    }
                  >
                    <SendIcon className="h-4 w-4" />
                    <span className="truncate">{panel.t("questions.askButtonMobile")}</span>
                    {panel.availableBoosts !== null && (
                      <span
                        className={`inline-flex min-w-6 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          mobilePanel === "composer"
                            ? "bg-white/15 text-white dark:bg-black/10 dark:text-neutral-900"
                            : `${ENGAGEMENT_BRANDING.boost.classes.activeGradient} ${ENGAGEMENT_BRANDING.boost.classes.activeText} shadow-md shadow-emerald-500/25`
                        }`}
                      >
                        <BoltIcon className="mr-1 h-3 w-3" />
                        {panel.availableBoosts}
                      </span>
                    )}
                  </MobileDockButton>
                )}

                {showQuestionFilters && (
                  <MobileDockButton
                    active={mobilePanel === "filters"}
                    className="text-neutral-700 dark:text-neutral-200"
                    onClick={() =>
                      setMobilePanel((current) => (current === "filters" ? null : "filters"))
                    }
                  >
                    <MenuIcon className="h-4 w-4" />
                    <span>{panel.t("questions.filters.title")}</span>
                  </MobileDockButton>
                )}
              </>
            )}

            <RefreshButton
              isFetching={panel.isFetching}
              idleLabel={panel.t("questions.refresh")}
              loadingLabel={panel.t("questions.refreshing")}
              onRefresh={handleRefresh}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-200/80 bg-gradient-to-b from-white to-neutral-100 text-neutral-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors hover:from-white hover:to-neutral-50 disabled:opacity-60 dark:border-white/12 dark:bg-gradient-to-b dark:from-white/12 dark:to-white/6 dark:text-neutral-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:from-white/14 dark:hover:to-white/8"
            />
          </div>
        </div>
      )}
    </div>
  );
}
