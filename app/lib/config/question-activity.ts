export const QUESTION_ACTIVITY_RECENT_EVENT_LIMIT = 4;

export type QuestionActivityLevel = 1 | 2 | 3;

export type QuestionActivityTitleKey = "curious" | "engaged" | "catalyst";

interface QuestionActivityRule {
  eventCount: number;
  recentWindow: number;
}

interface QuestionActivityAppearance {
  glowClassName: string;
  iconClassName: string;
  labelClassName: string;
}

export interface QuestionActivityBadge {
  level: QuestionActivityLevel;
  titleKey: QuestionActivityTitleKey;
  appearance: QuestionActivityAppearance;
}

const QUESTION_ACTIVITY_RULES: Record<QuestionActivityLevel, QuestionActivityRule> = {
  1: { eventCount: 1, recentWindow: 2 },
  2: { eventCount: 2, recentWindow: 3 },
  3: { eventCount: 3, recentWindow: 4 },
};

const QUESTION_ACTIVITY_BADGES: Record<QuestionActivityLevel, QuestionActivityBadge> = {
  1: {
    level: 1,
    titleKey: "curious",
    appearance: {
      glowClassName:
        "bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-500 shadow-sky-500/30 dark:shadow-sky-400/25",
      iconClassName: "text-sky-500 dark:text-sky-300",
      labelClassName:
        "from-sky-600 via-cyan-500 to-blue-500 dark:from-sky-300 dark:via-cyan-300 dark:to-blue-300",
    },
  },
  2: {
    level: 2,
    titleKey: "engaged",
    appearance: {
      glowClassName:
        "bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 shadow-orange-500/35 dark:shadow-orange-400/25",
      iconClassName: "text-amber-500 dark:text-amber-300",
      labelClassName:
        "from-amber-500 via-orange-500 to-rose-500 dark:from-amber-300 dark:via-orange-300 dark:to-rose-300",
    },
  },
  3: {
    level: 3,
    titleKey: "catalyst",
    appearance: {
      glowClassName:
        "bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-500 shadow-rose-500/35 dark:shadow-rose-400/30",
      iconClassName: "text-fuchsia-500 dark:text-fuchsia-300",
      labelClassName:
        "from-fuchsia-500 via-rose-500 to-orange-500 dark:from-fuchsia-300 dark:via-rose-300 dark:to-orange-300",
    },
  },
};

function countActiveEvents(
  recentEventIds: readonly string[],
  participatedEventIds: ReadonlySet<string>,
) {
  let count = 0;

  for (const eventId of recentEventIds) {
    if (participatedEventIds.has(eventId)) {
      count += 1;
    }
  }

  return count;
}

export function resolveQuestionActivityLevel(
  recentEventIds: readonly string[],
  participatedEventIds: ReadonlySet<string>,
): QuestionActivityLevel | null {
  for (const level of [3, 2, 1] as const) {
    const rule = QUESTION_ACTIVITY_RULES[level];
    const activeEvents = countActiveEvents(
      recentEventIds.slice(0, rule.recentWindow),
      participatedEventIds,
    );

    if (activeEvents >= rule.eventCount) {
      return level;
    }
  }

  return null;
}

export function getQuestionActivityBadge(level: QuestionActivityLevel | null) {
  return level === null ? null : QUESTION_ACTIVITY_BADGES[level];
}
