import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import playerReducer from "./slices/playerSlice";
import profileReducer from "./slices/profileSlice";
import videoEngagementReducer from "./slices/videoEngagementSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    videoEngagement: videoEngagementReducer,
    player: playerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
