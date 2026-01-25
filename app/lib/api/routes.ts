export const API_ROUTES = {
  AUTH: {
    CHALLENGES: "/api/v1/auth/challenges",
    TOKEN: "/api/v1/auth/token",
  },
  JWKS: "/.well-known/jwks.json",
  CSRF: "/api/v1/csrf",
  ME: {
    AUTH_ATTEMPTS: "/api/v1/me/auth-attempts",
    BASE: "/api/v1/me",
    DELETE: "/api/v1/me/delete",
    DELETE_CHALLENGE: "/api/v1/me/delete-challenge",
    PREFERENCES: "/api/v1/me/preferences",
  },
  NEWSLETTER: {
    SUBSCRIBE: "/api/v1/newsletter/subscribe",
  },
  VIDEO: {
    BOOSTS: (id: string) => `/api/v1/video/${id}/boosts`,
    BOOSTS_PATTERN: "/api/v1/video/*/boosts",
    LIKES: (id: string) => `/api/v1/video/${id}/likes`,
    LIKES_PATTERN: "/api/v1/video/*/likes",
  },
  USERS: {
    BOOSTS: (userId: string = "me") => `/api/v1/users/${userId}/boosts`,
    WATCHLIST: (userId: string = "me") => `/api/v1/users/${userId}/watchlist`,
    WATCHLIST_VIDEO: (videoId: string, userId: string = "me") =>
      `/api/v1/users/${userId}/watchlist/${videoId}`,
    CHECK_IN: (userId: string = "me") => `/api/v1/users/${userId}/check-in`,
    ME: {
      BOOSTS: "/api/v1/users/me/boosts",
      WATCHLIST: "/api/v1/users/me/watchlist",
      WATCHLIST_VIDEO: (videoId: string) => `/api/v1/users/me/watchlist/${videoId}`,
      CHECK_IN: "/api/v1/users/me/check-in",
    },
  },
} as const;
