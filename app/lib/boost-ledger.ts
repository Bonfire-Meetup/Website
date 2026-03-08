export const BOOST_LEDGER_KIND = {
  MONTHLY_ALLOCATION: "monthly_allocation",
  CAP_ADJUSTMENT: "cap_adjustment",
  VIDEO_BOOST_ADDED: "video_boost_added",
  VIDEO_BOOST_REMOVED: "video_boost_removed",
  VIDEO_BOOST_REVERTED: "video_boost_reverted",
  EVENT_QUESTION_BOOST_ADDED: "event_question_boost_added",
  EVENT_QUESTION_BOOST_REMOVED: "event_question_boost_removed",
  EVENT_QUESTION_BOOST_REVERTED: "event_question_boost_reverted",
  EVENT_QUESTION_REFUND: "event_question_refund",
} as const;

export const BOOST_LEDGER_RESOURCE = {
  EVENT_QUESTION: "event_question",
  SYSTEM: "system",
  VIDEO: "video",
} as const;

export const BOOST_LEDGER_TRACKING_STARTED_AT = "2026-03-08T16:00:00+01:00";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface BoostLedgerMetadata {
  eventId?: string;
  videoId?: string;
  [key: string]: JsonValue | undefined;
}

export interface EventQuestionLedgerContextInput {
  eventId: string;
  questionId: string;
}

export function buildEventQuestionLedgerContext({
  eventId,
  questionId,
}: EventQuestionLedgerContextInput) {
  return {
    metadata: {
      eventId,
    },
    resourceId: questionId,
    resourceType: BOOST_LEDGER_RESOURCE.EVENT_QUESTION,
  } as const;
}

export function getBoostLedgerKindLabel(kind: string, t: (key: string) => string): string {
  switch (kind) {
    case BOOST_LEDGER_KIND.MONTHLY_ALLOCATION:
      return t("kinds.monthlyAllocation");
    case BOOST_LEDGER_KIND.CAP_ADJUSTMENT:
      return t("kinds.capAdjustment");
    case BOOST_LEDGER_KIND.VIDEO_BOOST_ADDED:
      return t("kinds.videoBoostAdded");
    case BOOST_LEDGER_KIND.VIDEO_BOOST_REMOVED:
      return t("kinds.videoBoostRemoved");
    case BOOST_LEDGER_KIND.VIDEO_BOOST_REVERTED:
      return t("kinds.videoBoostReverted");
    case BOOST_LEDGER_KIND.EVENT_QUESTION_BOOST_ADDED:
      return t("kinds.eventQuestionBoostAdded");
    case BOOST_LEDGER_KIND.EVENT_QUESTION_BOOST_REMOVED:
      return t("kinds.eventQuestionBoostRemoved");
    case BOOST_LEDGER_KIND.EVENT_QUESTION_BOOST_REVERTED:
      return t("kinds.eventQuestionBoostReverted");
    case BOOST_LEDGER_KIND.EVENT_QUESTION_REFUND:
      return t("kinds.eventQuestionRefund");
    default:
      return t("kinds.generic");
  }
}
