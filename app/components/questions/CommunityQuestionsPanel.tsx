"use client";

import { useEffect, useState } from "react";

import { QuestionRow } from "@/components/questions/QuestionRow";
import {
  type SortMode,
  type TalkFilter,
  useCommunityQuestionsPanel,
} from "@/components/questions/useCommunityQuestionsPanel";
import {
  BoltIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  RefreshIcon,
  SendIcon,
} from "@/components/shared/Icons";
import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { formatDateTimeUTC } from "@/lib/utils/locale";

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

function CommunityQuestionsPanelSkeleton() {
  return (
    <div className="mt-6 animate-pulse space-y-4 rounded-3xl border border-neutral-200/80 bg-gradient-to-b from-white/90 to-neutral-50/70 p-3.5 sm:p-5 dark:border-white/10 dark:from-white/8 dark:to-white/[0.03]">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="h-2 w-10 rounded-full bg-neutral-200 dark:bg-white/15" />
          <div className="h-6 w-44 rounded-lg bg-neutral-200 dark:bg-white/15" />
        </div>
        <div className="h-7 w-32 rounded-full bg-neutral-200 dark:bg-white/15" />
      </div>

      <div className="h-10 rounded-xl bg-neutral-200 dark:bg-white/10" />
      <div className="space-y-2 rounded-2xl border border-neutral-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
        <div className="h-16 rounded-lg bg-neutral-200 dark:bg-white/10" />
        <div className="flex gap-2">
          <div className="h-8 flex-1 rounded-lg bg-neutral-200 dark:bg-white/10" />
          <div className="h-8 w-24 rounded-lg bg-neutral-200 dark:bg-white/10" />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-neutral-200/80 bg-white/80 p-2.5 dark:border-white/10 dark:bg-white/5">
        <div className="h-3 w-14 rounded-full bg-neutral-200 dark:bg-white/10" />
        <div className="h-8 rounded-md bg-neutral-200 dark:bg-white/10" />
        <div className="h-8 rounded-md bg-neutral-200 dark:bg-white/10" />
      </div>

      <div className="space-y-2">
        <div className="h-14 rounded-2xl bg-neutral-200 dark:bg-white/10" />
        <div className="h-14 rounded-2xl bg-neutral-200 dark:bg-white/10" />
      </div>
    </div>
  );
}

const PILL_SELECT_BASE =
  "w-auto rounded-full border border-neutral-200/70 bg-neutral-50 py-1 pl-2.5 pr-6 text-[11px] font-medium text-neutral-600 outline-none transition-colors dark:border-white/10 dark:bg-white/5 dark:text-neutral-300";

export function CommunityQuestionsPanel({
  eventId,
  theme = DEFAULT_PANEL_THEME,
  talkOptions,
  defaultAutoRefresh = false,
  mode = "default",
  showAutoRefreshToggle = false,
}: CommunityQuestionsPanelProps) {
  const panel = useCommunityQuestionsPanel(eventId);
  const { handleRefresh } = panel;
  const isLiveView = mode === "live";
  const canSubmitQuestion =
    panel.canParticipate && panel.text.trim().length >= 3 && !panel.createQuestion.isPending;
  const isUpcomingMode = !panel.isWindowOpen && !panel.isReplayMode;
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(defaultAutoRefresh);
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

  useEffect(() => {
    if (!showAutoRefreshToggle || !autoRefreshEnabled || !panel.isWindowOpen) {
      return;
    }

    const tick = window.setInterval(() => {
      if (document.hidden) {
        return;
      }

      handleRefresh();
    }, 15000);

    return () => {
      window.clearInterval(tick);
    };
  }, [autoRefreshEnabled, handleRefresh, panel.isWindowOpen, showAutoRefreshToggle]);

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
          {panel.isWindowOpen && lastRefreshLabel && (
            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              {panel.t("questions.lastRefresh", { date: lastRefreshLabel })}
            </p>
          )}
        </div>

        {panel.isWindowOpen && (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
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

              <button
                type="button"
                onClick={() => handleRefresh()}
                disabled={panel.isFetching}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/8 dark:text-neutral-200 dark:hover:bg-white/15"
              >
                <RefreshIcon
                  className={`relative -top-px h-3.5 w-3.5 ${panel.isFetching ? "animate-spin" : ""}`}
                />
                {panel.isFetching ? panel.t("questions.refreshing") : panel.t("questions.refresh")}
              </button>

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

      {panel.isWindowOpen && !isLiveView && panel.isAuthenticated && (
        <div className="rounded-2xl border border-neutral-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-end gap-2">
            <textarea
              value={panel.text}
              onChange={(event) => panel.setText(event.target.value)}
              placeholder={panel.t("questions.placeholder")}
              maxLength={600}
              rows={2}
              className={`min-h-[52px] flex-1 resize-none rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-2.5 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:bg-white/8 ${theme.focusBorder}`}
            />
            <button
              type="button"
              onClick={panel.handleSubmit}
              disabled={!canSubmitQuestion}
              aria-label={panel.t("questions.askButton")}
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:hover:scale-105 ${theme.sendButton}`}
            >
              <SendIcon className="h-4 w-4 translate-x-px" />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <select
              value={panel.selectedTalkIndex}
              onChange={(event) => panel.setSelectedTalkIndex(event.target.value)}
              className={`${PILL_SELECT_BASE} ${theme.focusBorder}`}
            >
              <option value="none">{panel.t("questions.generalTalk")}</option>
              {talkOptions.map((option, index) => (
                <option key={option.key} value={String(index)}>
                  {option.topic}
                </option>
              ))}
            </select>

            {panel.text.length > 400 && (
              <span className="text-[10px] text-neutral-400 tabular-nums dark:text-neutral-500">
                {panel.text.length}/600
              </span>
            )}
          </div>
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
          {(!panel.isReplayMode || hasAnyQuestions) && (
            <div className="flex flex-wrap gap-2">
              <select
                value={panel.activeTalkFilter}
                onChange={(event) => panel.setActiveTalkFilter(event.target.value as TalkFilter)}
                className={`${PILL_SELECT_BASE} ${theme.focusBorder}`}
              >
                <option value="all">{panel.t("questions.filters.allTalks")}</option>
                <option value="general">{panel.t("questions.filters.generalOnly")}</option>
                {talkOptions.map((option, index) => (
                  <option key={option.key} value={String(index)}>
                    {option.topic}
                  </option>
                ))}
              </select>

              <select
                value={panel.sortMode}
                onChange={(event) => panel.setSortMode(event.target.value as SortMode)}
                className={`${PILL_SELECT_BASE} ${theme.focusBorder}`}
              >
                <option value="boosts">{panel.t("questions.filters.sortBoosts")}</option>
                <option value="date">{panel.t("questions.filters.sortDate")}</option>
              </select>
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
                deleteConfirmLabel={panel.t("questions.deleteConfirm")}
                deleteQuestionPending={panel.deleteQuestion.isPending}
                deleteLabel={panel.t("questions.delete")}
                deleteCancelLabel={panel.t("questions.deleteCancel")}
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
    </div>
  );
}
