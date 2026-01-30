import { render } from "@react-email/render";
import React from "react";

import { Newsletter, type NewsletterProps } from "@/components/email/Newsletter";

const BASE_URL = process.env.PROD_URL ?? "https://www.bnf.events";
const LOGO_URL = `${BASE_URL}/assets/brand/RGB_PNG_01_bonfire_black_gradient.png`;

export interface RenderNewsletterInput {
  subject: string;
  previewText: string;
  sections: {
    id: string;
    title: string;
    text: string;
    imageUrl?: string;
    ctaLabel?: string;
    ctaHref?: string;
  }[];
  lang?: string;
  unsubscribeUrl: string;
  viewUrlSlug?: string;
}

export const renderNewsletterTemplate = async ({
  subject,
  previewText,
  sections,
  lang = "en",
  unsubscribeUrl,
  viewUrlSlug,
}: RenderNewsletterInput): Promise<{ html: string; text: string }> => {
  const appName = "Bonfire";

  const props: NewsletterProps = {
    appName,
    baseUrl: BASE_URL,
    lang,
    logoUrl: LOGO_URL,
    previewText,
    sections,
    subject,
    unsubscribeUrl,
    viewUrlSlug,
  };

  const html = await render(React.createElement(Newsletter, props));

  const text = [
    subject,
    "",
    previewText,
    "",
    ...sections.flatMap((section) => [
      section.title,
      "",
      section.text,
      "",
      section.ctaLabel && section.ctaHref ? `${section.ctaLabel}: ${section.ctaHref}` : null,
      "",
    ]),
    "---",
    `${appName} - Community events for developers`,
    `Unsubscribe: ${unsubscribeUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { html, text };
};
