import { initBotId } from "botid/client/core";

import { API_ROUTES } from "./app/lib/api/routes";
import { PAGE_ROUTES } from "./app/lib/routes/pages";

initBotId({
  protect: [
    { method: "GET", path: API_ROUTES.VIDEO.LIKES_PATTERN },
    { method: "POST", path: API_ROUTES.VIDEO.LIKES_PATTERN },
    { method: "DELETE", path: API_ROUTES.VIDEO.LIKES_PATTERN },
    { method: "GET", path: API_ROUTES.VIDEO.BOOSTS_PATTERN },
    { method: "POST", path: API_ROUTES.VIDEO.BOOSTS_PATTERN },
    { method: "DELETE", path: API_ROUTES.VIDEO.BOOSTS_PATTERN },
    { method: "POST", path: API_ROUTES.AUTH.CHALLENGES },
    { method: "POST", path: API_ROUTES.AUTH.TOKENS },
    { method: "GET", path: API_ROUTES.ME.BASE },
    { method: "GET", path: API_ROUTES.ME.BOOSTS },
    { method: "GET", path: API_ROUTES.ME.AUTH_ATTEMPTS },
    { method: "PATCH", path: API_ROUTES.ME.PREFERENCES },
    { method: "POST", path: API_ROUTES.ME.DELETE_CHALLENGE },
    { method: "POST", path: API_ROUTES.ME.DELETE },
    { method: "POST", path: PAGE_ROUTES.CONTACT },
    { method: "POST", path: PAGE_ROUTES.SPEAK },
  ],
});
