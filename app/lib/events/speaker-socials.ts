export const SOCIAL_PLATFORMS = ["instagram", "facebook", "linkedin"] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_FORMATS = {
  "ig-post": { height: 1350, labelKey: "instagramPost", platform: "instagram", width: 1080 },
  "ig-story": { height: 1920, labelKey: "instagramStory", platform: "instagram", width: 1080 },
  "fb-post": { height: 630, labelKey: "facebookPost", platform: "facebook", width: 1200 },
  "fb-story": { height: 1920, labelKey: "facebookStory", platform: "facebook", width: 1080 },
  "linkedin-post": { height: 627, labelKey: "linkedinPost", platform: "linkedin", width: 1200 },
} as const;

export type SocialFormat = keyof typeof SOCIAL_FORMATS;
