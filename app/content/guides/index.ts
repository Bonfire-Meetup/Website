import type { MDXProps } from "mdx/types";
import type { ReactNode } from "react";
import { z } from "zod";

import type { HeroWordSize } from "@/components/layout/hero-presets";
import type { Locale } from "@/lib/i18n/locales";

import * as accountDeletionCs from "./account-deletion.cs.mdx";
import * as accountDeletionEn from "./account-deletion.en.mdx";
import * as checkInCs from "./check-in.cs.mdx";
import * as checkInEn from "./check-in.en.mdx";
import * as engagementSignalsCs from "./engagement-signals.cs.mdx";
import * as engagementSignalsEn from "./engagement-signals.en.mdx";
import * as eventRsvpCs from "./event-rsvp.cs.mdx";
import * as eventRsvpEn from "./event-rsvp.en.mdx";
import * as guildSubscriptionCs from "./guild-subscription.cs.mdx";
import * as guildSubscriptionEn from "./guild-subscription.en.mdx";
import * as profilePrivacyCs from "./profile-privacy.cs.mdx";
import * as profilePrivacyEn from "./profile-privacy.en.mdx";
import * as registrationCs from "./registration.cs.mdx";
import * as registrationEn from "./registration.en.mdx";
import * as speakingCs from "./speaking.cs.mdx";
import * as speakingEn from "./speaking.en.mdx";
import * as ticketScanningCs from "./ticket-scanning.cs.mdx";
import * as ticketScanningEn from "./ticket-scanning.en.mdx";

const guideFrontmatterSchema = z.object({
  cardDescription: z.string().min(1),
  cardTitle: z.string().min(1),
  description: z.string().min(1),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  heroLead: z.string().min(1).optional(),
  heroSublead: z.string().min(1).optional(),
  subtitle: z.string().min(1),
  title: z.string().min(1),
});

export type GuideFrontmatter = z.infer<typeof guideFrontmatterSchema>;

interface GuideModule {
  default: (props: MDXProps) => ReactNode;
  frontmatter: unknown;
}

interface GuideConfig {
  heroWord: string;
  heroWordSize?: HeroWordSize;
}

const loadGuide = ({ default: Content, frontmatter }: GuideModule) => ({
  Content,
  frontmatter: guideFrontmatterSchema.parse(frontmatter),
});

const defineGuide = (config: GuideConfig, modules: Record<Locale, GuideModule>) => ({
  ...config,
  locales: { cs: loadGuide(modules.cs), en: loadGuide(modules.en) },
});

export const GUIDES = {
  accountDeletion: defineGuide(
    { heroWord: "DELETE" },
    { cs: accountDeletionCs, en: accountDeletionEn },
  ),
  checkIn: defineGuide({ heroWord: "CHECK-IN" }, { cs: checkInCs, en: checkInEn }),
  engagementSignals: defineGuide(
    { heroWord: "SIGNALS" },
    { cs: engagementSignalsCs, en: engagementSignalsEn },
  ),
  eventRsvp: defineGuide(
    { heroWord: "RSVP", heroWordSize: "xl" },
    { cs: eventRsvpCs, en: eventRsvpEn },
  ),
  guildSubscription: defineGuide(
    { heroWord: "GUILD" },
    { cs: guildSubscriptionCs, en: guildSubscriptionEn },
  ),
  profilePrivacy: defineGuide(
    { heroWord: "PRIVACY" },
    { cs: profilePrivacyCs, en: profilePrivacyEn },
  ),
  registration: defineGuide({ heroWord: "SIGN-IN" }, { cs: registrationCs, en: registrationEn }),
  speaking: defineGuide({ heroWord: "SPEAK" }, { cs: speakingCs, en: speakingEn }),
  ticketScanning: defineGuide({ heroWord: "SCAN" }, { cs: ticketScanningCs, en: ticketScanningEn }),
};

export type GuideKey = keyof typeof GUIDES;

export interface GuideCardCopy {
  description: string;
  title: string;
}

/** Title and description of every guide per locale, for the guides index page. */
export function getGuideCards(): Record<GuideKey, Record<Locale, GuideCardCopy>> {
  const toCard = ({ cardDescription, cardTitle }: GuideFrontmatter): GuideCardCopy => ({
    description: cardDescription,
    title: cardTitle,
  });

  return Object.fromEntries(
    Object.entries(GUIDES).map(([key, { locales }]) => [
      key,
      { cs: toCard(locales.cs.frontmatter), en: toCard(locales.en.frontmatter) },
    ]),
  ) as Record<GuideKey, Record<Locale, GuideCardCopy>>;
}
