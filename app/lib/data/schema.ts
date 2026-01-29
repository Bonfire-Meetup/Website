import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  foreignKey,
  index,
  inet,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const appUser = pgTable(
  "app_user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    preferences: jsonb("preferences").notNull().default({}),
    name: text("name"),
    roles: text("roles").array().notNull().default([]),
    membershipTier: smallint("membership_tier"),
  },
  (table) => [
    index("app_user_email_idx").on(table.email),
    index("app_user_membership_tier_idx")
      .on(table.membershipTier)
      .where(sql`(membership_tier IS NOT NULL)`),
  ],
);

export const authChallenge = pgTable(
  "auth_challenge",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    challengeTokenHash: text("challenge_token_hash").notNull(),
    email: text("email").notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    ip: inet("ip"),
    userAgent: text("user_agent"),
  },
  (table) => [
    uniqueIndex("auth_challenge_token_hash_idx").on(table.challengeTokenHash),
    index("auth_challenge_email_created_idx").on(table.email, table.createdAt),
    index("auth_challenge_expires_idx").on(table.expiresAt),
    index("auth_challenge_used_idx").on(table.usedAt),
  ],
);

export const authToken = pgTable(
  "auth_token",
  {
    jti: uuid("jti").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ip: inet("ip"),
    userAgent: text("user_agent"),
  },
  (table) => [
    index("auth_token_user_idx").on(table.userId),
    index("auth_token_expires_idx").on(table.expiresAt),
  ],
);

export const authAttempt = pgTable(
  "auth_attempt",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => appUser.id, { onDelete: "set null" }),
    emailHash: text("email_hash").notNull(),
    emailDomain: text("email_domain"),
    outcome: text("outcome").notNull(),
    method: text("method"),
    ipHash: text("ip_hash"),
    userAgentHash: text("user_agent_hash"),
    userAgentSummary: text("user_agent_summary"),
    requestId: text("request_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("auth_attempt_user_idx").on(table.userId),
    index("auth_attempt_email_created_idx").on(table.emailHash, table.createdAt),
  ],
);

export const authRefreshToken = pgTable(
  "auth_refresh_token",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenHash: text("token_hash").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    tokenFamilyId: uuid("token_family_id").notNull(),
    parentId: uuid("parent_id"),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    usedAt: timestamp("used_at", { withTimezone: true }),
    ip: inet("ip"),
    userAgent: text("user_agent"),
  },
  (table) => [
    index("auth_refresh_token_hash_idx").on(table.tokenHash),
    index("auth_refresh_token_user_idx").on(table.userId),
    index("auth_refresh_token_family_idx").on(table.tokenFamilyId),
    index("auth_refresh_token_expires_idx").on(table.expiresAt),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "auth_refresh_token_parent_id_fkey",
    }).onDelete("set null"),
  ],
);

export const authPasskey = pgTable(
  "auth_passkey",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    credentialId: text("credential_id").notNull().unique(),
    publicKey: text("public_key").notNull(),
    counter: bigint("counter", { mode: "number" }).notNull().default(0),
    deviceType: text("device_type"),
    backedUp: boolean("backed_up").notNull().default(false),
    transports: text("transports").array(),
    name: text("name"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_auth_passkey_user_id").on(table.userId),
    index("idx_auth_passkey_credential_id").on(table.credentialId),
  ],
);

export const authPasskeyChallenge = pgTable(
  "auth_passkey_challenge",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => appUser.id, { onDelete: "cascade" }),
    challenge: text("challenge").notNull(),
    type: text("type").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_auth_passkey_challenge_expires").on(table.expiresAt)],
);

export const checkIn = pgTable(
  "check_in",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    eventId: text("event_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("check_in_user_event_idx").on(table.userId, table.eventId),
    index("check_in_user_id_idx").on(table.userId),
    index("check_in_event_id_idx").on(table.eventId),
    index("check_in_created_at_idx").on(table.createdAt),
  ],
);

export const userWatchlist = pgTable(
  "user_watchlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    videoId: text("video_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("user_watchlist_user_video_idx").on(table.userId, table.videoId),
    index("user_watchlist_user_id_idx").on(table.userId),
    index("user_watchlist_video_id_idx").on(table.videoId),
    index("user_watchlist_created_at_idx").on(table.createdAt),
  ],
);

export const videoBoosts = pgTable(
  "video_boosts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    videoId: text("video_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("video_boosts_video_user_idx").on(table.videoId, table.userId),
    index("video_boosts_video_id_idx").on(table.videoId),
    index("video_boosts_user_id_idx").on(table.userId),
  ],
);

export const userBoostAllocation = pgTable(
  "user_boost_allocation",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => appUser.id, { onDelete: "cascade" }),
    availableBoosts: integer("available_boosts").notNull().default(3),
    lastAllocationDate: date("last_allocation_date").notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("user_boost_allocation_last_allocation_idx").on(table.lastAllocationDate)],
);

export const videoLikes = pgTable(
  "video_likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    videoId: text("video_id").notNull(),
    ipHash: text("ip_hash").notNull(),
    uaHash: text("ua_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("video_likes_video_ip_ua_idx").on(table.videoId, table.ipHash, table.uaHash),
    index("video_likes_video_id_idx").on(table.videoId),
  ],
);

export const newsletterSubscription = pgTable(
  "newsletter_subscription",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    ipHash: text("ip_hash"),
    userAgentHash: text("user_agent_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("newsletter_subscription_email_idx").on(table.email),
    index("newsletter_subscription_created_idx").on(table.createdAt),
  ],
);

export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    inquiryType: text("inquiry_type"),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    ipHash: text("ip_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("contact_submissions_ip_hash_idx").on(table.ipHash),
    index("contact_submissions_created_at_idx").on(table.createdAt),
  ],
);

export const talkProposals = pgTable(
  "talk_proposals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    speakerName: text("speaker_name").notNull(),
    email: text("email").notNull(),
    talkTitle: text("talk_title").notNull(),
    abstract: text("abstract").notNull(),
    duration: text("duration").notNull(),
    experience: text("experience"),
    preferredLocation: text("preferred_location"),
    ipHash: text("ip_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("talk_proposals_ip_hash_idx").on(table.ipHash),
    index("talk_proposals_created_at_idx").on(table.createdAt),
  ],
);
