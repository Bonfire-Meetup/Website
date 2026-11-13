import type { Metadata } from "next";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { LocalizedContent } from "@/components/shared/markdown/LocalizedContent";
import { MarkdownLink } from "@/components/shared/markdown/markdown-components";
import { MarkdownDocument } from "@/components/shared/markdown/MarkdownDocument";
import CodeOfConductCs from "@/content/legal/coc.cs.md";
import CodeOfConductEn from "@/content/legal/coc.en.md";
import PrivacyPolicyCs from "@/content/legal/privacy.cs.md";
import PrivacyPolicyEn from "@/content/legal/privacy.en.md";
import TermsOfServiceCs from "@/content/legal/terms.cs.md";
import TermsOfServiceEn from "@/content/legal/terms.en.md";
import type { Locale } from "@/lib/i18n/locales";
import { buildTitleSubtitleMetadata } from "@/lib/metadata";

import { ResetCookieBannerButton } from "./components/ResetCookieBannerButton";
import { LegalPageContent } from "./LegalPageContent";

const RESET_COOKIE_BANNER_HREF = "#reset-cookie-banner";

function PrivacyLink(props: ComponentPropsWithoutRef<"a">) {
  return props.href === RESET_COOKIE_BANNER_HREF ? (
    <ResetCookieBannerButton />
  ) : (
    <MarkdownLink {...props} />
  );
}

const PRIVACY_COMPONENTS = { a: PrivacyLink };

const DOCUMENTS: { id: string; content: Record<Locale, ReactNode> }[] = [
  {
    content: { cs: <CodeOfConductCs />, en: <CodeOfConductEn /> },
    id: "code-of-conduct",
  },
  {
    content: {
      cs: <PrivacyPolicyCs components={PRIVACY_COMPONENTS} />,
      en: <PrivacyPolicyEn components={PRIVACY_COMPONENTS} />,
    },
    id: "privacy-policy",
  },
  {
    content: { cs: <TermsOfServiceCs />, en: <TermsOfServiceEn /> },
    id: "terms-of-service",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return buildTitleSubtitleMetadata({ ns: "legal" });
}

export default function LegalPage() {
  return (
    <LegalPageContent>
      {DOCUMENTS.map(({ content, id }, index) => (
        <section
          key={id}
          id={id}
          className={
            index === 0
              ? "scroll-mt-24"
              : "scroll-mt-24 border-t border-neutral-200 pt-12 dark:border-white/10"
          }
        >
          <MarkdownDocument>
            <LocalizedContent content={content} />
          </MarkdownDocument>
        </section>
      ))}
    </LegalPageContent>
  );
}
