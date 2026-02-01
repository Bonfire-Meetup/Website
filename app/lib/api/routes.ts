export const API_ROUTES = {
  AUTH: {
    CHALLENGES: "/api/v1/auth/challenges",
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
  ME: {
    AUTH_ATTEMPTS: "/api/v1/me/auth-attempts",
    BASE: "/api/v1/me",
    DELETE: "/api/v1/me/delete",
    DELETE_CHALLENGE: "/api/v1/me/delete-challenge",
    PASSKEYS: "/api/v1/me/passkeys",
    PASSKEY: (id: string) => `/api/v1/me/passkeys/${id}`,
    PREFERENCES: "/api/v1/me/preferences",
    RSVPS: "/api/v1/me/rsvps",
  },
  NEWSLETTER: {
    SUBSCRIBE: "/api/v1/newsletter/subscribe",
    SEND: "/api/v1/newsletter/send",
  },
  VIDEO: {
    BOOSTS: (id: string) => `/api/v1/video/${id}/boosts`,
    BOOSTS_PATTERN: "/api/v1/video/*/boosts",
    LIKES: (id: string) => `/api/v1/video/${id}/likes`,
    LIKES_PATTERN: "/api/v1/video/*/likes",
  },
  USERS: {
    BOOSTS: (userId = "me") => `/api/v1/users/${userId}/boosts`,
    WATCHLIST: (userId = "me") => `/api/v1/users/${userId}/watchlist`,
    WATCHLIST_VIDEO: (videoId: string, userId = "me") =>
      `/api/v1/users/${userId}/watchlist/${videoId}`,
    CHECK_IN: (userId = "me") => `/api/v1/users/${userId}/check-in`,
    ME: {
      BOOSTS: "/api/v1/users/me/boosts",
      WATCHLIST: "/api/v1/users/me/watchlist",
      WATCHLIST_VIDEO: (videoId: string) => `/api/v1/users/me/watchlist/${videoId}`,
      CHECK_IN: "/api/v1/users/me/check-in",
    },
  },
  EVENTS: {
    RSVPS: (eventId: string) => `/api/v1/events/${eventId}/rsvps`,
    RSVPS_PATTERN: "/api/v1/events/*/rsvps",
  },
} as const;
