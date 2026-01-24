import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface VideoInfo {
  youtubeId: string;
  title: string;
  watchUrl: string;
}

interface PlayerState {
  video: VideoInfo | null;
  cinemaMode: boolean;
  playerRect: Rect | null;
  isAnimating: boolean;
  isLoading: boolean;
  hasPlaybackStarted: boolean;
  inlineContainerId: string | null;
}

const initialState: PlayerState = {
  video: null,
  cinemaMode: false,
  playerRect: null,
  isAnimating: false,
  isLoading: true,
  hasPlaybackStarted: false,
  inlineContainerId: null,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setVideo: (state, action: PayloadAction<VideoInfo>) => {
      state.video = action.payload;
      state.isLoading = true;
      state.hasPlaybackStarted = false;
    },
    clearVideo: (state) => {
      state.video = null;
      state.isLoading = true;
      state.hasPlaybackStarted = false;
    },
    setInlineContainer: (state, action: PayloadAction<string | null>) => {
      state.inlineContainerId = action.payload;
    },
    setCinemaMode: (state, action: PayloadAction<boolean>) => {
      state.cinemaMode = action.payload;
    },
    setPlayerRect: (state, action: PayloadAction<Rect | null>) => {
      state.playerRect = action.payload;
    },
    setIsAnimating: (state, action: PayloadAction<boolean>) => {
      state.isAnimating = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setHasPlaybackStarted: (state, action: PayloadAction<boolean>) => {
      state.hasPlaybackStarted = action.payload;
    },
  },
});

export const {
  setVideo,
  clearVideo,
  setInlineContainer,
  setCinemaMode,
  setPlayerRect,
  setIsAnimating,
  setIsLoading,
  setHasPlaybackStarted,
} = playerSlice.actions;

export default playerSlice.reducer;
