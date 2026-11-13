import type { MDXComponents } from "mdx/types";

import { GuideSectionCard } from "@/components/guides/GuideSectionCard";

import {
  Callout,
  CardGrid,
  Cta,
  FeatureCard,
  FeatureGrid,
  GuideLink,
  InfoPanel,
  Section,
  SectionList,
  StatusCard,
  Surface,
  Term,
  Terms,
  Timeline,
  TimelineStep,
} from "./blocks";
import { GuideParagraph } from "./children";
import { GuildStatus } from "./GuildStatus";
import { OrderedList, Steps, UnorderedList } from "./lists";

/**
 * Everything a guide MDX file can use: markdown elements restyled for guides, plus the named
 * blocks (`<Section>`, `<Steps>`, `<Callout>`, `<Cta>`, ...) available without imports.
 */
export const guideMdxComponents: MDXComponents = {
  Callout,
  CardGrid,
  Cta,
  FeatureCard,
  FeatureGrid,
  GuildStatus,
  InfoPanel,
  Section,
  SectionList,
  Sections: GuideSectionCard,
  StatusCard,
  Steps,
  Surface,
  Term,
  Terms,
  Timeline,
  TimelineStep,
  a: GuideLink,
  ol: OrderedList,
  p: GuideParagraph,
  ul: UnorderedList,
};
