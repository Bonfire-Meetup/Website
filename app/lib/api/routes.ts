export const API_ROUTES = {
  AUTH: {
    BASE: "/api/v1/auth",
    CHALLENGES: "/api/v1/auth/challenges",
    REVOKE: "/api/v1/auth/revoke",
    TOKEN: "/api/v1/auth/token",
    PASSKEY: {
      REGISTER_OPTIONS: "/api/v1/auth/passkey/register/options",
      REGISTER_VERIFY: "/api/v1/auth/passkey/register/verify",
      AUTHENTICATE_OPTIONS: "/api/v1/auth/passkey/authenticate/options",
      AUTHENTICATE_VERIFY: "/api/v1/auth/passkey/authenticate/verify",
    },
  },
  JWKS: "/.well-known/jwks.json",
  CSRF: "/api/v1/csrf",
  CHECK_IN: {
    BASE: "/api/v1/check-ins",
    VERIFY: "/api/v1/check-ins/verify",
  },
  LIBRARY: "/api/v1/library",
  ME: {
    AUTH_ATTEMPTS: "/api/v1/me/auth-attempts",
    BASE: "/api/v1/me",
    DELETION_CHALLENGES: "/api/v1/me/deletion-challenges",
    PASSKEYS: "/api/v1/me/passkeys",
    PASSKEY: (id: string) => `/api/v1/me/passkeys/${id}`,
    PREFERENCES: "/api/v1/me/preferences",
  },
  NEWSLETTER: {
    SUBSCRIPTIONS: "/api/v1/newsletters/subscriptions",
    LIST: "/api/v1/newsletters",
    SENDS: (slug: string) => `/api/v1/newsletters/${slug}/sends`,
    AUDIENCE_COUNTS: "/api/v1/newsletters/audience/counts",
    ITEM: (slug: string) => `/api/v1/newsletters/${slug}`,
  },
  VIDEO: {
    BOOSTS: (id: string) => `/api/v1/videos/${id}/boosts`,
    BOOSTS_PATTERN: "/api/v1/videos/*/boosts",
    LIKES: (id: string) => `/api/v1/videos/${id}/likes`,
    LIKES_PATTERN: "/api/v1/videos/*/likes",
  },
  USERS: {
    PROFILE: (id: string) => `/api/v1/users/${id}`,
    BOOSTS: (userId = "me") => `/api/v1/users/${userId}/boosts`,
    WATCHLIST: (userId = "me") => `/api/v1/users/${userId}/watchlist`,
    WATCHLIST_VIDEO: (videoId: string, userId = "me") =>
      `/api/v1/users/${userId}/watchlist/${videoId}`,
    CHECK_IN: (userId = "me") => `/api/v1/users/${userId}/check-ins`,
    ME: {
      BOOSTS: "/api/v1/users/me/boosts",
      WATCHLIST: "/api/v1/users/me/watchlist",
      WATCHLIST_VIDEO: (videoId: string) => `/api/v1/users/me/watchlist/${videoId}`,
      CHECK_IN: "/api/v1/users/me/check-ins",
    },
  },
  EVENTS: {
    RSVPS: (eventId: string) => `/api/v1/events/${eventId}/rsvps`,
    RSVPS_PATTERN: "/api/v1/events/*/rsvps",
    QUESTIONS: (eventId: string) => `/api/v1/events/${eventId}/questions`,
    QUESTIONS_PATTERN: "/api/v1/events/*/questions",
    QUESTION: (eventId: string, questionId: string) =>
      `/api/v1/events/${eventId}/questions/${questionId}`,
    QUESTION_PATTERN: "/api/v1/events/*/questions/*",
    QUESTION_BOOSTS: (eventId: string, questionId: string) =>
      `/api/v1/events/${eventId}/questions/${questionId}/boosts`,
    QUESTION_BOOSTS_PATTERN: "/api/v1/events/*/questions/*/boosts",
  },
} as const;
