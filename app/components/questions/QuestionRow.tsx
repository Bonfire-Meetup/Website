"use client";

import type { QuestionItem } from "@/components/questions/useCommunityQuestionsPanel";
import { BoltIcon, CheckIcon, CloseIcon, TrashIcon, UserIcon } from "@/components/shared/Icons";
import { UserAvatar } from "@/components/user/UserAvatar";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { makeAvatarSeedFromPublicId } from "@/lib/utils/hash-rng";

function formatBubbleTime(iso: string | null, locale: string): string {
  if (!iso) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function GuildRing({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 p-[3px] shadow-md shadow-orange-400/50 dark:shadow-orange-500/40">
      {children}
    </div>
  );
}

function QuestionAuthorAvatar({ question }: { question: QuestionItem }) {
  const isGuild = question.authorIsPublic && question.authorMembershipTier !== null;

  if (question.authorIsPublic && question.authorPublicId) {
    const avatar = (
      <UserAvatar
        avatarSeed={makeAvatarSeedFromPublicId(question.authorPublicId)}
        name={question.authorName}
        size={30}
        className="ring-[1.5px] ring-white dark:ring-neutral-900"
      />
    );

    return (
      <a href={PAGE_ROUTES.USER(question.authorPublicId)} className="shrink-0">
        {isGuild ? <GuildRing>{avatar}</GuildRing> : avatar}
      </a>
    );
  }

  return (
    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 ring-2 ring-white dark:bg-neutral-700 dark:text-neutral-300 dark:ring-neutral-900">
      <UserIcon className="h-3.5 w-3.5" />
    </div>
  );
}

interface QuestionRowProps {
  anonymousLabel: string;
  confirmDeleteId: string | null;
  deleteConfirmLabel: string;
  deleteQuestionPending: boolean;
  deleteLabel: string;
  deleteCancelLabel: string;
  isReplayMode: boolean;
  isWindowOpen: boolean;
  locale: string;
  onConfirmDelete: (questionId: string) => void;
  onRequestDelete: (questionId: string) => void;
  onToggleBoost: (questionId: string, hasBoosted: boolean) => void;
  privateOnlyLabel: string;
  question: QuestionItem;
  selfLabel: string;
  setConfirmDeleteId: (questionId: string | null) => void;
  talkOptions: { key: string; topic: string }[];
  toggleBoostPending: boolean;
}

export function QuestionRow({
  anonymousLabel,
  confirmDeleteId,
  deleteConfirmLabel,
  deleteQuestionPending,
  deleteLabel,
  deleteCancelLabel,
  isReplayMode,
  isWindowOpen,
  locale,
  onConfirmDelete,
  onRequestDelete,
  onToggleBoost,
  privateOnlyLabel,
  question,
  selfLabel,
  setConfirmDeleteId,
  talkOptions,
  toggleBoostPending,
}: QuestionRowProps) {
  const talkTopic =
    typeof question.talkIndex === "number" ? talkOptions[question.talkIndex]?.topic : null;
  const isConfirmingDelete = confirmDeleteId === question.id;
  const { isOwn } = question;

  return (
    <div className={`group flex items-end gap-2 py-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      <div className="shrink-0 self-end pb-[22px]">
        <QuestionAuthorAvatar question={question} />
      </div>

      <div
        className={`flex max-w-[78%] flex-col gap-1 sm:max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}
      >
        {talkTopic && (
          <span
            className={`inline-block max-w-[90%] truncate rounded-full px-2 py-0.5 text-[10px] font-medium ${
              isOwn
                ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300"
                : "bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-400"
            }`}
          >
            {talkTopic}
          </span>
        )}

        <div
          className={`px-3.5 py-2.5 text-sm leading-relaxed ${
            isOwn
              ? "rounded-[18px] rounded-br-[5px] bg-gradient-to-br from-rose-500 via-orange-500 to-red-500 text-white shadow-md shadow-orange-400/25 dark:shadow-orange-500/20"
              : "rounded-[18px] rounded-bl-[5px] border border-neutral-200/90 bg-white text-neutral-900 shadow-sm dark:border-white/10 dark:bg-white/8 dark:text-neutral-100"
          }`}
        >
          {question.text}
        </div>

        <div
          className={`flex flex-wrap items-center gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
        >
          <div className={`flex items-center gap-1.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
            {isOwn ? (
              <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                {selfLabel}
              </span>
            ) : question.authorIsPublic && question.authorPublicId ? (
              <a
                href={PAGE_ROUTES.USER(question.authorPublicId)}
                className="text-[10px] font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-2 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:decoration-neutral-500 dark:hover:text-white"
              >
                {question.authorName ?? anonymousLabel}
              </a>
            ) : (
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                {privateOnlyLabel}
              </span>
            )}
            <span className="text-[10px] text-neutral-400 tabular-nums dark:text-neutral-500">
              {formatBubbleTime(question.createdAt, locale)}
            </span>
          </div>

          {!isReplayMode && (
            <button
              type="button"
              onClick={() => onToggleBoost(question.id, question.hasBoosted)}
              disabled={toggleBoostPending || deleteQuestionPending || !isWindowOpen}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                question.hasBoosted
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
              }`}
              aria-label={`Boost · ${question.boostCount}`}
            >
              <BoltIcon className="h-3 w-3" />
              <span>{question.boostCount}</span>
            </button>
          )}

          {isOwn &&
            (isConfirmingDelete ? (
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onConfirmDelete(question.id)}
                  disabled={deleteQuestionPending}
                  className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-emerald-500 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={deleteConfirmLabel}
                >
                  <CheckIcon className="h-2.5 w-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deleteQuestionPending}
                  className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border border-neutral-200/80 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-neutral-800 dark:text-neutral-400"
                  aria-label={deleteCancelLabel}
                >
                  <CloseIcon className="h-2.5 w-2.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onRequestDelete(question.id)}
                disabled={deleteQuestionPending || !isWindowOpen}
                className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full text-neutral-400 opacity-100 transition-all hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-30 sm:opacity-0 sm:group-hover:opacity-100 dark:text-neutral-500 dark:hover:text-neutral-300"
                aria-label={deleteLabel}
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
