import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    { path: "/api/v1/video/*/likes", method: "GET" },
    { path: "/api/v1/video/*/likes", method: "POST" },
    { path: "/api/v1/video/*/likes", method: "DELETE" },
    { path: "/contact", method: "POST" },
    { path: "/speak", method: "POST" },
  ],
});
