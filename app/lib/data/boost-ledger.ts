import "server-only";

import { desc, eq } from "drizzle-orm";

import { getEventById } from "@/data/events-calendar";
import {
  BOOST_LEDGER_KIND,
  BOOST_LEDGER_RESOURCE,
  BOOST_LEDGER_TRACKING_STARTED_AT,
  type BoostLedgerMetadata,
} from "@/lib/boost-ledger";
import { getUserBoosts } from "@/lib/data/boosts";
import { db } from "@/lib/data/db";
import { boostLedger } from "@/lib/data/schema";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { logError } from "@/lib/utils/log";

export interface BoostLedgerEntry {
  balanceAfter: number;
  createdAt: string;
  delta: number;
  id: string;
  kind: string;
  metadata: BoostLedgerMetadata;
  resourceId: string | null;
  resourceType: string | null;
}

export interface BoostLedgerListItem extends BoostLedgerEntry {
  contextLabel: string | null;
  href: string | null;
  isBackfill: boolean;
  resourceLabel: string | null;
}

export interface CreateBoostLedgerEntryInput {
  balanceAfter: number;
  delta: number;
  kind: string;
  metadata?: BoostLedgerMetadata;
  resourceId?: string | null;
  resourceType?: string | null;
  userId: string;
}

const toBoostLedgerMetadata = (value: unknown): BoostLedgerMetadata => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as BoostLedgerMetadata;
};

export const createBoostLedgerEntry = async ({
  balanceAfter,
  delta,
  kind,
  metadata,
  resourceId = null,
  resourceType = null,
  userId,
}: CreateBoostLedgerEntryInput): Promise<void> => {
  try {
    await db()
      .insert(boostLedger)
      .values({
        balanceAfter,
        delta,
        kind,
        metadata: metadata ?? {},
        resourceId,
        resourceType,
        userId,
      });
  } catch (error) {
    logError("data.boost_ledger.create_failed", error, {
      kind,
      resourceId,
      resourceType,
      userId,
    });
    throw error;
  }
};

export const getUserBoostLedger = async (
  userId: string,
  limit = 50,
): Promise<BoostLedgerEntry[]> => {
  try {
    const rows = await db()
      .select({
        balanceAfter: boostLedger.balanceAfter,
        createdAt: boostLedger.createdAt,
        delta: boostLedger.delta,
        id: boostLedger.id,
        kind: boostLedger.kind,
        metadata: boostLedger.metadata,
        resourceId: boostLedger.resourceId,
        resourceType: boostLedger.resourceType,
      })
      .from(boostLedger)
      .where(eq(boostLedger.userId, userId))
      .orderBy(desc(boostLedger.createdAt))
      .limit(limit);

    return rows.map((row) => ({
      balanceAfter: row.balanceAfter,
      createdAt: new Date(row.createdAt).toISOString(),
      delta: row.delta,
      id: row.id,
      kind: row.kind,
      metadata: toBoostLedgerMetadata(row.metadata),
      resourceId: row.resourceId ?? null,
      resourceType: row.resourceType ?? null,
    }));
  } catch (error) {
    logError("data.boost_ledger.list_failed", error, { limit, userId });
    throw error;
  }
};

export const getUserBoostLedgerItems = async (
  userId: string,
  limit = 50,
): Promise<BoostLedgerListItem[]> => {
  const [entries, historicalBoosts] = await Promise.all([
    getUserBoostLedger(userId, limit),
    getUserBoosts(userId),
  ]);
  const recordings = getAllRecordings();
  const recordingMap = new Map(recordings.map((recording) => [recording.shortId, recording]));
  const trackingStartedAtMs = Date.parse(BOOST_LEDGER_TRACKING_STARTED_AT);

  const ledgerItems = entries.map((entry) => {
    if (entry.resourceType === BOOST_LEDGER_RESOURCE.VIDEO) {
      const videoId = entry.metadata.videoId ?? entry.resourceId;
      const recording = videoId ? recordingMap.get(videoId) : null;

      return {
        ...entry,
        contextLabel: recording ? recording.speaker.join(", ") : null,
        href: recording ? PAGE_ROUTES.WATCH(recording.slug, recording.shortId) : null,
        isBackfill: false,
        resourceLabel: recording?.title ?? null,
      };
    }

    if (entry.resourceType === BOOST_LEDGER_RESOURCE.EVENT_QUESTION) {
      const { eventId } = entry.metadata;
      const event = eventId ? getEventById(eventId) : null;

      return {
        ...entry,
        contextLabel: event?.title ?? null,
        href: eventId ? PAGE_ROUTES.EVENT(eventId) : null,
        isBackfill: false,
        resourceLabel: null,
      };
    }

    return {
      ...entry,
      contextLabel: null,
      href: null,
      isBackfill: false,
      resourceLabel: null,
    };
  });

  const historicalItems = historicalBoosts
    .filter((boost) => {
      const createdAtMs = new Date(boost.createdAt).getTime();
      return Number.isFinite(createdAtMs) && createdAtMs < trackingStartedAtMs;
    })
    .map((boost) => {
      const recording = recordingMap.get(boost.videoId);

      return {
        balanceAfter: 0,
        contextLabel: recording ? recording.speaker.join(", ") : null,
        createdAt: new Date(boost.createdAt).toISOString(),
        delta: -1,
        href: recording ? PAGE_ROUTES.WATCH(recording.slug, recording.shortId) : null,
        id: `backfill-video-${boost.videoId}`,
        isBackfill: true,
        kind: BOOST_LEDGER_KIND.VIDEO_BOOST_ADDED,
        metadata: {
          videoId: boost.videoId,
        },
        resourceId: boost.videoId,
        resourceLabel: recording?.title ?? null,
        resourceType: BOOST_LEDGER_RESOURCE.VIDEO,
      } satisfies BoostLedgerListItem;
    });

  return [...ledgerItems, ...historicalItems]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};
