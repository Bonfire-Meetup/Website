import type { Metadata } from "next";

import { GuideShell } from "@/components/guides/GuideShell";
import { guideMdxComponents } from "@/components/guides/mdx/guide-mdx-components";
import { LocalizedContent } from "@/components/shared/markdown/LocalizedContent";
import { GUIDES, type GuideKey } from "@/content/guides";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { getBrandName } from "@/lib/metadata";

interface GuidePageProps {
  guide: GuideKey;
}

export function GuidePage({ guide }: GuidePageProps) {
  const { heroWord, heroWordSize, locales } = GUIDES[guide];
  const { Content: ContentCs, frontmatter: frontmatterCs } = locales.cs;
  const { Content: ContentEn, frontmatter: frontmatterEn } = locales.en;

  return (
    <GuideShell
      hero={{ cs: frontmatterCs, en: frontmatterEn }}
      heroWord={heroWord}
      heroWordSize={heroWordSize}
    >
      <LocalizedContent
        content={{
          cs: <ContentCs components={guideMdxComponents} />,
          en: <ContentEn components={guideMdxComponents} />,
        }}
      />
    </GuideShell>
  );
}

export async function buildGuideMetadata(guide: GuideKey): Promise<Metadata> {
  const { description, title } = GUIDES[guide].locales[DEFAULT_LOCALE].frontmatter;

  return { description, title: `${title} | ${await getBrandName()}` };
}
