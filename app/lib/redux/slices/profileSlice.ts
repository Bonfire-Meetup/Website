import type {
  BoostAllocation,
  BoostedRecording,
  LoginAttempt,
  Profile,
} from "@/lib/api/user-profile";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ProfileState {
  profile: Profile | null;
  boosts: BoostedRecording[];
  attempts: LoginAttempt[];
  boostAllocation: BoostAllocation | null;
  watchlist: string[];
  loading: boolean;
  error: string | null;
  deleteStep: "idle" | "confirm" | "verify" | "done";
  deleteChallengeToken: string | null;
  deleteCode: string;
  deleteIntent: boolean;
  stagedCommunityEmails: boolean | null;
  stagedPublicProfile: boolean | null;
}

const initialState: ProfileState = {
  profile: null,
  boosts: [],
  attempts: [],
  boostAllocation: null,
  watchlist: [],
  loading: false,
  error: null,
  deleteStep: "idle",
  deleteChallengeToken: null,
  deleteCode: "",
  deleteIntent: false,
  stagedCommunityEmails: null,
  stagedPublicProfile: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Profile>) => {
      state.profile = action.payload;
      state.error = null;
    },
    setBoosts: (state, action: PayloadAction<BoostedRecording[]>) => {
      state.boosts = action.payload;
    },
    removeBoost: (state, action: PayloadAction<string>) => {
      state.boosts = state.boosts.filter((b) => b.shortId !== action.payload);
    },
    setAttempts: (state, action: PayloadAction<LoginAttempt[]>) => {
      state.attempts = action.payload;
    },
    setBoostAllocation: (state, action: PayloadAction<BoostAllocation | null>) => {
      state.boostAllocation = action.payload;
    },
    setWatchlist: (state, action: PayloadAction<string[]>) => {
      state.watchlist = action.payload;
    },
    addToWatchlist: (state, action: PayloadAction<string>) => {
      if (!state.watchlist.includes(action.payload)) {
        state.watchlist.unshift(action.payload);
      }
    },
    removeFromWatchlist: (state, action: PayloadAction<string>) => {
      state.watchlist = state.watchlist.filter((id) => id !== action.payload);
    },
    updatePreferences: (
      state,
      action: PayloadAction<{ allowCommunityEmails?: boolean; publicProfile?: boolean }>,
    ) => {
      if (!state.profile) {
        return;
      }
      const { allowCommunityEmails, publicProfile } = action.payload;
      if (allowCommunityEmails !== undefined) {
        state.profile.allowCommunityEmails = allowCommunityEmails;
      }
      if (publicProfile !== undefined) {
        state.profile.publicProfile = publicProfile;
      }
    },
    setStagedCommunityEmails: (state, action: PayloadAction<boolean | null>) => {
      state.stagedCommunityEmails = action.payload;
    },
    setStagedPublicProfile: (state, action: PayloadAction<boolean | null>) => {
      state.stagedPublicProfile = action.payload;
    },
    setDeleteStep: (state, action: PayloadAction<ProfileState["deleteStep"]>) => {
      state.deleteStep = action.payload;
    },
    setDeleteChallengeToken: (state, action: PayloadAction<string | null>) => {
      state.deleteChallengeToken = action.payload;
    },
    setDeleteCode: (state, action: PayloadAction<string>) => {
      state.deleteCode = action.payload;
    },
    setDeleteIntent: (state, action: PayloadAction<boolean>) => {
      state.deleteIntent = action.payload;
    },
    resetDelete: (state) => {
      state.deleteStep = "idle";
      state.deleteChallengeToken = null;
      state.deleteCode = "";
      state.deleteIntent = false;
    },
    setProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setProfileError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.boosts = [];
      state.attempts = [];
      state.boostAllocation = null;
      state.watchlist = [];
      state.stagedCommunityEmails = null;
      state.stagedPublicProfile = null;
      state.deleteStep = "idle";
      state.deleteChallengeToken = null;
      state.deleteCode = "";
      state.deleteIntent = false;
    },
  },
});

export const {
  setProfile,
  setBoosts,
  removeBoost,
  setAttempts,
  setBoostAllocation,
  setWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updatePreferences,
  setStagedCommunityEmails,
  setStagedPublicProfile,
  setDeleteStep,
  setDeleteChallengeToken,
  setDeleteCode,
  setDeleteIntent,
  resetDelete,
  setProfileLoading,
  setProfileError,
  clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
