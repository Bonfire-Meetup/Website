export const STORAGE_KEYS = {
  ACCESS_TOKEN: "bonfire:access-token",
  AUTH_CHALLENGE_PREFIX: "bonfire:auth-challenge",
  DRAFT_CONTACT_FORM: "bonfire:draft:contact-form",
  DRAFT_TALK_PROPOSAL: "bonfire:draft:talk-proposal",
  THEME: "bonfire:theme",
} as const;

export const getAuthChallengeKey = (token: string): string =>
  `${STORAGE_KEYS.AUTH_CHALLENGE_PREFIX}:${token}`;
