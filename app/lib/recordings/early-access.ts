export const EARLY_ACCESS_LEVELS = {
  AUTHENTICATED: 0,
  GUILD_TIER_1: 1,
  GUILD_TIER_2: 2,
  GUILD_TIER_3: 3,
} as const;

export type RequiredMembershipTier = 0 | 1 | 2 | 3;

export type AccessType = "public" | "authenticated" | "guild";

export interface RecordingAccessRequirement {
  type: AccessType;
  tier?: Exclude<RequiredMembershipTier, 0>;
}

export interface RecordingAccessPolicy {
  now: RecordingAccessRequirement;
  after?: RecordingAccessRequirement & { at: string };
}

export interface RecordingAccessState {
  current: RecordingAccessRequirement;
  earlyAccessEndsAtMs?: number;
  requiredMembershipTier?: RequiredMembershipTier;
  isRestricted: boolean;
  isEarlyAccess: boolean;
  isPermanentRestricted: boolean;
  isSignInAccess: boolean;
  isGuildAccess: boolean;
}

const normalizeAccessRequirement = (
  value: unknown,
): RecordingAccessRequirement | (RecordingAccessRequirement & { at: string }) | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidate = value as { at?: unknown; type?: unknown; tier?: unknown };

  if (candidate.type === "public") {
    return typeof candidate.at === "string"
      ? { at: candidate.at, type: "public" }
      : { type: "public" };
  }

  if (candidate.type === "authenticated") {
    return typeof candidate.at === "string"
      ? { at: candidate.at, type: "authenticated" }
      : { type: "authenticated" };
  }

  if (
    candidate.type === "guild" &&
    (candidate.tier === EARLY_ACCESS_LEVELS.GUILD_TIER_1 ||
      candidate.tier === EARLY_ACCESS_LEVELS.GUILD_TIER_2 ||
      candidate.tier === EARLY_ACCESS_LEVELS.GUILD_TIER_3)
  ) {
    return typeof candidate.at === "string"
      ? { at: candidate.at, tier: candidate.tier, type: "guild" }
      : { tier: candidate.tier, type: "guild" };
  }

  return undefined;
};

export const normalizeRecordingAccessPolicy = (
  value: unknown,
): RecordingAccessPolicy | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidate = value as { now?: unknown; after?: unknown };
  const now = normalizeAccessRequirement(candidate.now);

  if (!now || !("type" in now) || "at" in now) {
    return undefined;
  }

  const after = normalizeAccessRequirement(candidate.after);

  if (after && "at" in after) {
    return { after, now };
  }

  return { now };
};

export const normalizeLegacyEarlyAccess = (value: unknown): RecordingAccessPolicy | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const { requiredMembershipTier } = value as { requiredMembershipTier?: unknown };

  if (requiredMembershipTier === EARLY_ACCESS_LEVELS.AUTHENTICATED) {
    return { now: { type: "authenticated" } };
  }

  if (
    requiredMembershipTier === EARLY_ACCESS_LEVELS.GUILD_TIER_1 ||
    requiredMembershipTier === EARLY_ACCESS_LEVELS.GUILD_TIER_2 ||
    requiredMembershipTier === EARLY_ACCESS_LEVELS.GUILD_TIER_3
  ) {
    return { now: { tier: requiredMembershipTier, type: "guild" } };
  }

  return undefined;
};

export const resolveCurrentRecordingAccess = (
  policy: RecordingAccessPolicy | undefined,
  now = new Date(),
): RecordingAccessRequirement => {
  if (!policy) {
    return { type: "public" };
  }

  if (policy.after) {
    const at = new Date(policy.after.at);

    if (!Number.isNaN(at.getTime()) && now.getTime() >= at.getTime()) {
      return { tier: policy.after.tier, type: policy.after.type };
    }
  }

  return policy.now;
};

export const isRecordingEarlyAccess = (
  policy: RecordingAccessPolicy | undefined,
  now = new Date(),
) =>
  Boolean(
    policy?.after &&
    !Number.isNaN(new Date(policy.after.at).getTime()) &&
    now.getTime() < new Date(policy.after.at).getTime(),
  );

export const isRecordingRestricted = (
  policy: RecordingAccessPolicy | undefined,
  now = new Date(),
): boolean => resolveCurrentRecordingAccess(policy, now).type !== "public";

export const getRequiredMembershipTier = (
  requirement: RecordingAccessRequirement,
): RequiredMembershipTier | undefined => {
  if (requirement.type === "authenticated") {
    return EARLY_ACCESS_LEVELS.AUTHENTICATED;
  }

  if (requirement.type === "guild" && requirement.tier) {
    return requirement.tier;
  }

  return undefined;
};

export const getRecordingAccessState = (
  policy: RecordingAccessPolicy | undefined,
  now = new Date(),
): RecordingAccessState => {
  const current = resolveCurrentRecordingAccess(policy, now);
  const requiredMembershipTier = getRequiredMembershipTier(current);
  const isRestricted = current.type !== "public";
  const afterMs = policy?.after ? new Date(policy.after.at).getTime() : Number.NaN;
  const hasValidAfterMs = Number.isFinite(afterMs);
  const earlyAccessEndsAtMs = hasValidAfterMs ? afterMs : undefined;
  const isEarlyAccess = Boolean(earlyAccessEndsAtMs && now.getTime() < earlyAccessEndsAtMs);

  return {
    current,
    earlyAccessEndsAtMs,
    isEarlyAccess,
    isGuildAccess: current.type === "guild",
    isPermanentRestricted: isRestricted && !isEarlyAccess,
    isRestricted,
    isSignInAccess: current.type === "authenticated",
    requiredMembershipTier,
  };
};

export const canAccessRecording = ({
  isAuthenticated,
  membershipTier,
  policy,
  now,
}: {
  isAuthenticated: boolean;
  membershipTier?: number | null;
  policy: RecordingAccessPolicy | undefined;
  now?: Date;
}): boolean => {
  const { current } = getRecordingAccessState(policy, now);

  if (current.type === "public") {
    return true;
  }

  if (!isAuthenticated) {
    return false;
  }

  if (current.type === "authenticated") {
    return true;
  }

  return (membershipTier ?? 0) >= (current.tier ?? EARLY_ACCESS_LEVELS.GUILD_TIER_1);
};
