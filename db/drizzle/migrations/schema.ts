import { sql } from "drizzle-orm";
import {
  pgTable,
  index,
  foreignKey,
  uuid,
  text,
  timestamp,
  integer,
  date,
  bigint,
  boolean,
  jsonb,
  smallint,
  uniqueIndex,
  inet,
} from "drizzle-orm/pg-core";

export const authAttempt = pgTable(
  "auth_attempt",
  {
    id: uuid().defaultRandom().notNull(),
    userId: uuid("user_id"),
    emailHash: text("email_hash").notNull(),
    emailDomain: text("email_domain"),
    outcome: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    ipHash: text("ip_hash"),
    userAgentHash: text("user_agent_hash"),
    requestId: uuid("request_id"),
    method: text(),
    userAgentSummary: text("user_agent_summary"),
  },
  (table) => [
    index("auth_attempt_email_created_idx").using(
      "btree",
      table.emailHash.asc().nullsLast().op("text_ops"),
      table.createdAt.desc().nullsFirst().op("text_ops"),
    ),
    index("auth_attempt_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUser.id],
      name: "auth_attempt_user_id_fkey",
    }).onDelete("set null"),
  ],
);

export const newsletterSubscription = pgTable(
  "newsletter_subscription",
  {
    id: uuid().defaultRandom().notNull(),
    email: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    ipHash: text("ip_hash"),
    userAgentHash: text("user_agent_hash"),
  },
  (table) => [
    index("newsletter_subscription_created_idx").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("newsletter_subscription_email_idx").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const userBoostAllocation = pgTable(
  "user_boost_allocation",
  {
    userId: uuid("user_id").notNull(),
    availableBoosts: integer("available_boosts").default(3).notNull(),
    lastAllocationDate: date("last_allocation_date")
      .default(sql`CURRENT_DATE`)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("user_boost_allocation_last_allocation_idx").using(
      "btree",
      table.lastAllocationDate.asc().nullsLast().op("date_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUser.id],
      name: "user_boost_allocation_user_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const userWatchlist = pgTable(
  "user_watchlist",
  {
    id: uuid().defaultRandom().notNull(),
    userId: uuid("user_id").notNull(),
    videoId: text("video_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("user_watchlist_created_at_idx").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("user_watchlist_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    index("user_watchlist_video_id_idx").using(
      "btree",
      table.videoId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUser.id],
      name: "user_watchlist_user_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const checkIn = pgTable(
  "check_in",
  {
    id: uuid().defaultRandom().notNull(),
    userId: uuid("user_id").notNull(),
    eventId: text("event_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("check_in_created_at_idx").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("check_in_event_id_idx").using("btree", table.eventId.asc().nullsLast().op("text_ops")),
    index("check_in_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUser.id],
      name: "check_in_user_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const authPasskey = pgTable(
  "auth_passkey",
  {
    id: uuid().defaultRandom().notNull(),
    userId: uuid("user_id").notNull(),
    credentialId: text("credential_id").notNull(),
    publicKey: text("public_key").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    counter: bigint({ mode: "number" }).default(0).notNull(),
    deviceType: text("device_type"),
    backedUp: boolean("backed_up").default(false).notNull(),
    transports: text().array(),
    name: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("idx_auth_passkey_credential_id").using(
      "btree",
      table.credentialId.asc().nullsLast().op("text_ops"),
    ),
    index("idx_auth_passkey_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUser.id],
      name: "auth_passkey_user_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid().defaultRandom().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    inquiryType: text("inquiry_type"),
    subject: text().notNull(),
    message: text().notNull(),
    ipHash: text("ip_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("contact_submissions_created_at_idx").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("contact_submissions_ip_hash_idx").using(
      "btree",
      table.ipHash.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const talkProposals = pgTable(
  "talk_proposals",
  {
    id: uuid().defaultRandom().notNull(),
    speakerName: text("speaker_name").notNull(),
    email: text().notNull(),
    talkTitle: text("talk_title").notNull(),
    abstract: text().notNull(),
    duration: text().notNull(),
    experience: text(),
    preferredLocation: text("preferred_location"),
    ipHash: text("ip_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("talk_proposals_created_at_idx").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("talk_proposals_ip_hash_idx").using(
      "btree",
      table.ipHash.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const appUser = pgTable(
  "app_user",
  {
    id: uuid().defaultRandom().notNull(),
    email: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: "string" }),
    name: text(),
    preferences: jsonb().default({}).notNull(),
    roles: text().array().default([""]).notNull(),
    membershipTier: smallint("membership_tier"),
  },
  (table) => [
    index("app_user_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("app_user_membership_tier_idx")
      .using("btree", table.membershipTier.asc().nullsLast().op("int2_ops"))
      .where(sql`(membership_tier IS NOT NULL)`),
  ],
);

export const videoLikes = pgTable(
  "video_likes",
  {
    id: uuid().defaultRandom().notNull(),
    videoId: text("video_id").notNull(),
    ipHash: text("ip_hash").notNull(),
    uaHash: text("ua_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("video_likes_video_id_idx").using(
      "btree",
      table.videoId.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const authChallenge = pgTable(
  "auth_challenge",
  {
    id: uuid().defaultRandom().notNull(),
    challengeTokenHash: text("challenge_token_hash").notNull(),
    email: text().notNull(),
    codeHash: text("code_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "string" }),
    attempts: integer().default(0).notNull(),
    maxAttempts: integer("max_attempts").default(5).notNull(),
    ip: inet(),
    userAgent: text("user_agent"),
  },
  (table) => [
    index("auth_challenge_email_created_idx").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
      table.createdAt.desc().nullsFirst().op("text_ops"),
    ),
    index("auth_challenge_expires_idx").using(
      "btree",
      table.expiresAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    uniqueIndex("auth_challenge_token_hash_idx").using(
      "btree",
      table.challengeTokenHash.asc().nullsLast().op("text_ops"),
    ),
    index("auth_challenge_used_idx").using(
      "btree",
      table.usedAt.asc().nullsLast().op("timestamptz_ops"),
    ),
  ],
);

export const authToken = pgTable(
  "auth_token",
  {
    jti: uuid().notNull(),
    userId: uuid("user_id").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
    ip: inet(),
    userAgent: text("user_agent"),
  },
  (table) => [
    index("auth_token_expires_idx").using(
      "btree",
      table.expiresAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("auth_token_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUser.id],
      name: "auth_token_user_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const authRefreshToken = pgTable(
  "auth_refresh_token",
  {
    id: uuid().defaultRandom().notNull(),
    tokenHash: text("token_hash").notNull(),
    userId: uuid("user_id").notNull(),
    tokenFamilyId: uuid("token_family_id").notNull(),
    parentId: uuid("parent_id"),
    issuedAt: timestamp("issued_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "string" }),
    ip: inet(),
    userAgent: text("user_agent"),
  },
  (table) => [
    index("auth_refresh_token_expires_idx").using(
      "btree",
      table.expiresAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("auth_refresh_token_family_idx").using(
      "btree",
      table.tokenFamilyId.asc().nullsLast().op("uuid_ops"),
    ),
    index("auth_refresh_token_hash_idx").using(
      "btree",
      table.tokenHash.asc().nullsLast().op("text_ops"),
    ),
    index("auth_refresh_token_user_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUser.id],
      name: "auth_refresh_token_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "auth_refresh_token_parent_id_fkey",
    }).onDelete("set null"),
  ],
);

export const videoBoosts = pgTable(
  "video_boosts",
  {
    id: uuid().defaultRandom().notNull(),
    videoId: text("video_id").notNull(),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("video_boosts_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    index("video_boosts_video_id_idx").using(
      "btree",
      table.videoId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUser.id],
      name: "video_boosts_user_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const authPasskeyChallenge = pgTable(
  "auth_passkey_challenge",
  {
    id: uuid().defaultRandom().notNull(),
    userId: uuid("user_id"),
    challenge: text().notNull(),
    type: text().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_auth_passkey_challenge_expires").using(
      "btree",
      table.expiresAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUser.id],
      name: "auth_passkey_challenge_user_id_fkey",
    }).onDelete("cascade"),
  ],
);
