export const USER_ROLES = {
  CREW: "crew",
  MODERATOR: "moderator",
  VERIFIED: "verified",
  SPEAKER: "speaker",
  EDITOR: "editor",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const PUBLIC_ROLES: readonly UserRole[] = [
  USER_ROLES.CREW,
  USER_ROLES.MODERATOR,
  USER_ROLES.VERIFIED,
  USER_ROLES.SPEAKER,
] as const;
