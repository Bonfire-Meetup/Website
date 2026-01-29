import { relations } from "drizzle-orm/relations";
import { appUser, authAttempt, userBoostAllocation, userWatchlist, checkIn, authPasskey, authToken, authRefreshToken, videoBoosts, authPasskeyChallenge } from "./schema";

export const authAttemptRelations = relations(authAttempt, ({one}) => ({
	appUser: one(appUser, {
		fields: [authAttempt.userId],
		references: [appUser.id]
	}),
}));

export const appUserRelations = relations(appUser, ({many}) => ({
	authAttempts: many(authAttempt),
	userBoostAllocations: many(userBoostAllocation),
	userWatchlists: many(userWatchlist),
	checkIns: many(checkIn),
	authPasskeys: many(authPasskey),
	authTokens: many(authToken),
	authRefreshTokens: many(authRefreshToken),
	videoBoosts: many(videoBoosts),
	authPasskeyChallenges: many(authPasskeyChallenge),
}));

export const userBoostAllocationRelations = relations(userBoostAllocation, ({one}) => ({
	appUser: one(appUser, {
		fields: [userBoostAllocation.userId],
		references: [appUser.id]
	}),
}));

export const userWatchlistRelations = relations(userWatchlist, ({one}) => ({
	appUser: one(appUser, {
		fields: [userWatchlist.userId],
		references: [appUser.id]
	}),
}));

export const checkInRelations = relations(checkIn, ({one}) => ({
	appUser: one(appUser, {
		fields: [checkIn.userId],
		references: [appUser.id]
	}),
}));

export const authPasskeyRelations = relations(authPasskey, ({one}) => ({
	appUser: one(appUser, {
		fields: [authPasskey.userId],
		references: [appUser.id]
	}),
}));

export const authTokenRelations = relations(authToken, ({one}) => ({
	appUser: one(appUser, {
		fields: [authToken.userId],
		references: [appUser.id]
	}),
}));

export const authRefreshTokenRelations = relations(authRefreshToken, ({one, many}) => ({
	appUser: one(appUser, {
		fields: [authRefreshToken.userId],
		references: [appUser.id]
	}),
	authRefreshToken: one(authRefreshToken, {
		fields: [authRefreshToken.parentId],
		references: [authRefreshToken.id],
		relationName: "authRefreshToken_parentId_authRefreshToken_id"
	}),
	authRefreshTokens: many(authRefreshToken, {
		relationName: "authRefreshToken_parentId_authRefreshToken_id"
	}),
}));

export const videoBoostsRelations = relations(videoBoosts, ({one}) => ({
	appUser: one(appUser, {
		fields: [videoBoosts.userId],
		references: [appUser.id]
	}),
}));

export const authPasskeyChallengeRelations = relations(authPasskeyChallenge, ({one}) => ({
	appUser: one(appUser, {
		fields: [authPasskeyChallenge.userId],
		references: [appUser.id]
	}),
}));