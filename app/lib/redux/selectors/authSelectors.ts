import type { RootState } from "@/lib/redux/store";

export const selectAccessTokenClaims = (state: RootState) => state.auth.decodedToken;

export const selectIdTokenClaims = (state: RootState) => state.auth.decodedIdToken;

export const selectAuthUserId = (state: RootState) =>
  state.auth.decodedToken?.sub ?? state.auth.decodedIdToken?.sub;

export const selectAuthRoles = (state: RootState) => state.auth.decodedToken?.rol ?? [];

export const selectAuthMembershipTier = (state: RootState) => state.auth.decodedToken?.mbt ?? 0;

export const selectAuthViewer = (state: RootState) => ({
  email: state.auth.decodedIdToken?.email,
  id: selectAuthUserId(state),
  name: state.auth.decodedIdToken?.name,
  publicProfile: state.auth.decodedIdToken?.publicProfile ?? false,
});
