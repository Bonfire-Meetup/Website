import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "@/lib/redux/store";

export const selectAccessTokenClaims = (state: RootState) => state.auth.decodedToken;

export const selectIdTokenClaims = (state: RootState) => state.auth.decodedIdToken;

const EMPTY_ROLES: string[] = [];

export const selectAuthUserId = createSelector(
  [selectAccessTokenClaims, selectIdTokenClaims],
  (accessTokenClaims, idTokenClaims) => accessTokenClaims?.sub ?? idTokenClaims?.sub,
);

export const selectAuthRoles = createSelector(
  [selectAccessTokenClaims],
  (accessTokenClaims) => accessTokenClaims?.rol ?? EMPTY_ROLES,
);

export const selectAuthMembershipTier = createSelector(
  [selectAccessTokenClaims],
  (accessTokenClaims) => accessTokenClaims?.mbt ?? 0,
);

export const selectAuthViewer = createSelector(
  [selectAuthUserId, selectIdTokenClaims],
  (userId, idTokenClaims) => ({
    email: idTokenClaims?.email,
    id: userId,
    name: idTokenClaims?.name,
    publicProfile: idTokenClaims?.publicProfile ?? false,
  }),
);
