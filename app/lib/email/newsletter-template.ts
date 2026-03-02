import { render } from "@react-email/render";
import React from "react";

import { Newsletter, type NewsletterProps } from "@/components/email/Newsletter";
import { WEBSITE_URLS } from "@/lib/config/constants";

const BASE_URL = process.env.PROD_URL ?? WEBSITE_URLS.BASE;
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

function appendUtmParams(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", "newsletter");
    parsed.searchParams.set("utm_medium", "email");
    return parsed.toString();
  } catch {
    return url;
  }
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

  const sectionsWithUtm = sections.map((section) => ({
    ...section,
    ctaHref: section.ctaHref ? appendUtmParams(section.ctaHref) : undefined,
  }));

  const props: NewsletterProps = {
    appName,
    baseUrl: BASE_URL,
    lang,
    logoUrl: LOGO_URL,
    previewText,
    sections: sectionsWithUtm,
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
    ...sectionsWithUtm.flatMap((section) => [
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
