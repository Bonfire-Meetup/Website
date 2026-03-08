import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AccessTokenPayload, IdTokenPayload } from "@/lib/auth/token";

interface AuthState {
  token: string | null;
  idToken: string | null;
  user: {
    id?: string;
    email?: string;
    name?: string | null;
    publicProfile?: boolean;
    decodedToken?: AccessTokenPayload | null;
    decodedIdToken?: IdTokenPayload | null;
  } | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  token: null,
  idToken: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (
      state,
      action: PayloadAction<{
        token: string;
        idToken?: string | null;
        decoded?: AccessTokenPayload;
        decodedIdToken?: IdTokenPayload | null;
      }>,
    ) => {
      state.token = action.payload.token;
      state.idToken = action.payload.idToken ?? null;
      state.isAuthenticated = true;
      state.hydrated = true;
      if (action.payload.decoded || action.payload.decodedIdToken) {
        state.user = {
          ...state.user,
          id: action.payload.decoded?.sub ?? action.payload.decodedIdToken?.sub,
          email: action.payload.decodedIdToken?.email,
          name: action.payload.decodedIdToken?.name,
          publicProfile: action.payload.decodedIdToken?.publicProfile,
          decodedToken: action.payload.decoded,
          decodedIdToken: action.payload.decodedIdToken,
        };
      }
      state.error = null;
    },
    clearAuth: (state) => {
      state.token = null;
      state.idToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.hydrated = true;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setToken, clearAuth, setAuthLoading } = authSlice.actions;

export default authSlice.reducer;
