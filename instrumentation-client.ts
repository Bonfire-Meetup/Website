import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    { path: "/api/v1/video/*/likes", method: "GET" },
    { path: "/api/v1/video/*/likes", method: "POST" },
    { path: "/api/v1/video/*/likes", method: "DELETE" },
    { path: "/api/v1/video/*/boosts", method: "GET" },
    { path: "/api/v1/video/*/boosts", method: "POST" },
    { path: "/api/v1/video/*/boosts", method: "DELETE" },
    { path: "/api/v1/auth/challenges", method: "POST" },
    { path: "/api/v1/auth/tokens", method: "POST" },
    { path: "/api/v1/me", method: "GET" },
    { path: "/api/v1/me/boosts", method: "GET" },
    { path: "/api/v1/me/auth-attempts", method: "GET" },
    { path: "/api/v1/me/preferences", method: "PATCH" },
    { path: "/api/v1/me/delete-challenge", method: "POST" },
    { path: "/api/v1/me/delete", method: "POST" },
    { path: "/contact", method: "POST" },
    { path: "/speak", method: "POST" },
  ],
});
