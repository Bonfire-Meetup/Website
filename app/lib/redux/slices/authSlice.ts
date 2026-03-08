import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AccessTokenPayload, IdTokenPayload } from "@/lib/auth/token";

interface AuthState {
  token: string | null;
  idToken: string | null;
  decodedToken: AccessTokenPayload | null;
  decodedIdToken: IdTokenPayload | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  token: null,
  idToken: null,
  decodedToken: null,
  decodedIdToken: null,
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
      state.decodedToken = action.payload.decoded ?? null;
      state.decodedIdToken = action.payload.decodedIdToken ?? null;
      state.isAuthenticated = true;
      state.hydrated = true;
      state.error = null;
    },
    clearAuth: (state) => {
      state.token = null;
      state.idToken = null;
      state.decodedToken = null;
      state.decodedIdToken = null;
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
