import "server-only";

import { revalidateTag } from "next/cache";

import {
  BOOST_LEDGER_KIND,
  BOOST_LEDGER_RESOURCE,
  buildEventQuestionLedgerContext,
} from "@/lib/boost-ledger";
import {
  addVideoBoost,
  consumeBoost,
  getUserBoostAllocation,
  getVideoBoostStats,
  refundBoostWithLedger,
  removeVideoBoost,
} from "@/lib/data/boosts";
import {
  addEventQuestionBoost,
  type EventQuestionBoostRefund,
  getEventQuestionBoostStats,
  removeEventQuestionBoost,
} from "@/lib/data/event-questions";

interface BoostMutationResponse {
  availableBoosts: number;
  count: number;
  added?: boolean;
  error?: undefined;
  removed?: boolean;
}

interface FailedBoostMutationResponse {
  availableBoosts: number;
  count?: number;
  error?: "no_boosts_available";
  added?: boolean;
  removed?: boolean;
}

interface EventQuestionContext {
  eventId: string;
  questionId: string;
}

const revalidateVideoBoostSurfaces = () => {
  revalidateTag("engagement-counts", "max");
  revalidateTag("member-picks", "max");
  revalidateTag("hidden-gems", "max");
};

export async function createVideoBoost(
  videoId: string,
  userId: string,
): Promise<BoostMutationResponse | FailedBoostMutationResponse> {
  const existingStats = await getVideoBoostStats(videoId, userId);
  if (existingStats.hasBoosted) {
    const allocation = await getUserBoostAllocation(userId);

    return {
      added: false,
      availableBoosts: allocation.availableBoosts,
      count: existingStats.count,
    };
  }

  const consumed = await consumeBoost(userId, {
    kind: BOOST_LEDGER_KIND.VIDEO_BOOST_ADDED,
    metadata: { videoId },
    resourceId: videoId,
    resourceType: BOOST_LEDGER_RESOURCE.VIDEO,
  });

  if (!consumed.success) {
    return {
      availableBoosts: consumed.availableBoosts ?? 0,
      error: "no_boosts_available",
    };
  }

  const result = await addVideoBoost(videoId, userId);
  let availableBoosts = consumed.availableBoosts ?? 0;

  if (!result.added) {
    availableBoosts = await refundBoostWithLedger(userId, {
      kind: BOOST_LEDGER_KIND.VIDEO_BOOST_REVERTED,
      metadata: { videoId },
      resourceId: videoId,
      resourceType: BOOST_LEDGER_RESOURCE.VIDEO,
    });
  }

  revalidateVideoBoostSurfaces();

  return {
    ...result,
    availableBoosts,
  };
}

export async function removeVideoBoostOperation(
  videoId: string,
  userId: string,
): Promise<BoostMutationResponse> {
  const result = await removeVideoBoost(videoId, userId);
  const availableBoosts = result.removed
    ? await refundBoostWithLedger(userId, {
        kind: BOOST_LEDGER_KIND.VIDEO_BOOST_REMOVED,
        metadata: { videoId },
        resourceId: videoId,
        resourceType: BOOST_LEDGER_RESOURCE.VIDEO,
      })
    : (await getUserBoostAllocation(userId)).availableBoosts;

  revalidateVideoBoostSurfaces();

  return {
    ...result,
    availableBoosts,
  };
}

const toEventQuestionContext = ({ eventId, questionId }: EventQuestionContext) =>
  buildEventQuestionLedgerContext({
    eventId,
    questionId,
  });

export async function createEventQuestionBoostOperation(
  userId: string,
  context: EventQuestionContext,
): Promise<BoostMutationResponse | FailedBoostMutationResponse> {
  const existingStats = await getEventQuestionBoostStats(context.questionId, userId);
  if (existingStats.hasBoosted) {
    const allocation = await getUserBoostAllocation(userId);

    return {
      added: false,
      availableBoosts: allocation.availableBoosts,
      count: existingStats.count,
    };
  }

  const consumed = await consumeBoost(userId, {
    kind: BOOST_LEDGER_KIND.EVENT_QUESTION_BOOST_ADDED,
    ...toEventQuestionContext(context),
  });

  if (!consumed.success) {
    return {
      availableBoosts: consumed.availableBoosts ?? 0,
      error: "no_boosts_available",
    };
  }

  const result = await addEventQuestionBoost(context.questionId, userId);
  let availableBoosts = consumed.availableBoosts ?? 0;

  if (!result.added) {
    availableBoosts = await refundBoostWithLedger(userId, {
      kind: BOOST_LEDGER_KIND.EVENT_QUESTION_BOOST_REVERTED,
      ...toEventQuestionContext(context),
    });
  }

  return {
    ...result,
    availableBoosts,
  };
}

export async function removeEventQuestionBoostOperation(
  userId: string,
  context: EventQuestionContext,
): Promise<BoostMutationResponse> {
  const result = await removeEventQuestionBoost(context.questionId, userId);
  const availableBoosts = result.removed
    ? await refundBoostWithLedger(userId, {
        kind: BOOST_LEDGER_KIND.EVENT_QUESTION_BOOST_REMOVED,
        ...toEventQuestionContext(context),
      })
    : (await getUserBoostAllocation(userId)).availableBoosts;

  return {
    ...result,
    availableBoosts,
  };
}

export async function refundEventQuestionBoosts(
  refunds: EventQuestionBoostRefund[],
): Promise<void> {
  await Promise.all(
    refunds.map((refund) =>
      refundBoostWithLedger(refund.userId, {
        kind: BOOST_LEDGER_KIND.EVENT_QUESTION_REFUND,
        ...toEventQuestionContext(refund),
      }),
    ),
  );
}
