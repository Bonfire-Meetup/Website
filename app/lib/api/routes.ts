export const API_ROUTES = {
  CSRF: "/api/v1/csrf",
  AUTH: {
    CHALLENGES: "/api/v1/auth/challenges",
    TOKENS: "/api/v1/auth/tokens",
    JWKS: "/api/v1/auth/jwks",
  },
  ME: {
    BASE: "/api/v1/me",
    BOOSTS: "/api/v1/me/boosts",
    AUTH_ATTEMPTS: "/api/v1/me/auth-attempts",
    PREFERENCES: "/api/v1/me/preferences",
    DELETE_CHALLENGE: "/api/v1/me/delete-challenge",
    DELETE: "/api/v1/me/delete",
  },
  VIDEO: {
    LIKES: (id: string) => `/api/v1/video/${id}/likes`,
    BOOSTS: (id: string) => `/api/v1/video/${id}/boosts`,
    LIKES_PATTERN: "/api/v1/video/*/likes",
    BOOSTS_PATTERN: "/api/v1/video/*/boosts",
  },
} as const;
