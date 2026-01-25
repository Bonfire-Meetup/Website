import type { AccessTokenPayload } from "@/lib/auth/client";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  user: {
    id?: string;
    email?: string;
    decodedToken?: AccessTokenPayload | null;
  } | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  token: null,
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
    setToken: (state, action: PayloadAction<{ token: string; decoded?: AccessTokenPayload }>) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.hydrated = true;
      if (action.payload.decoded) {
        state.user = {
          ...state.user,
          id: action.payload.decoded.sub,
          decodedToken: action.payload.decoded,
        };
      }
      state.error = null;
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.hydrated = true;
    },
    setUser: (state, action: PayloadAction<Partial<AuthState["user"]>>) => {
      state.user = state.user
        ? { ...state.user, ...action.payload }
        : (action.payload as AuthState["user"]);
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
});

export const { setToken, clearAuth, setUser, setAuthLoading, setAuthError, setIsAuthenticated } =
  authSlice.actions;

export default authSlice.reducer;
