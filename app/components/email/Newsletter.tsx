import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { BRAND, FIRE_GRADIENT, FIRE_GRADIENT_DIAGONAL } from "./brand";

export interface NewsletterProps {
  appName: string;
  baseUrl: string;
  lang: string;
  logoUrl: string;
  previewText: string;
  sections: {
    ctaHref?: string;
    ctaLabel?: string;
    id: string;
    imageUrl?: string;
    text: string;
    title: string;
  }[];
  subject: string;
  unsubscribeUrl: string;
  viewUrlSlug?: string;
}

export function Newsletter({
  appName,
  baseUrl,
  lang,
  logoUrl,
  previewText,
  sections,
  subject,
  unsubscribeUrl,
  viewUrlSlug,
}: NewsletterProps) {
  return (
    <Html lang={lang}>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <title>{subject}</title>
      </Head>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="m-0 bg-neutral-50 p-0 font-sans antialiased">
          <Container className="max-w-[600px] px-4 py-10">
            <Section className="pb-8" style={{ paddingBottom: "32px" }}>
              <Row>
                <Column width={320} className="align-middle">
                  <Link href={baseUrl} style={{ textDecoration: "none" }}>
                    <Img src={logoUrl} alt={appName} width={100} height={52} className="block" />
                  </Link>
                </Column>
                <Column align="right" className="align-middle">
                  <Link
                    href={
                      viewUrlSlug ? `${baseUrl}/newsletter/${viewUrlSlug}` : `${baseUrl}/newsletter`
                    }
                    style={{ color: "#a3a3a3", fontSize: "12px", textDecoration: "none" }}
                  >
                    View online →
                  </Link>
                </Column>
              </Row>
            </Section>

            {sections.map((section, index) => (
              <Section
                key={section.id}
                className="mb-8 overflow-hidden rounded-2xl bg-white"
                style={{
                  border: "1px solid #e5e5e5",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
                  borderRadius: "16px",
                }}
              >
                <Section
                  className="h-1.5"
                  style={{
                    background: FIRE_GRADIENT,
                    height: "6px",
                  }}
                />

                {section.imageUrl && (
                  <Img
                    src={section.imageUrl}
                    width="600"
                    height="240"
                    alt={section.title}
                    className="block w-full"
                    style={{ display: "block" }}
                  />
                )}

                <Section
                  className="px-8 pt-8 pb-8"
                  style={{ padding: index === 0 ? "36px 32px 32px" : "32px" }}
                >
                  {!section.imageUrl && index === 0 && (
                    <Text
                      className="m-0 mb-3 text-[11px] font-bold tracking-[0.15em] uppercase"
                      style={{ color: BRAND.violet, margin: "0 0 12px" }}
                    >
                      Featured
                    </Text>
                  )}

                  {!section.imageUrl && index > 0 && (
                    <Text
                      className="m-0 mb-3 text-[11px] font-bold tracking-[0.15em] uppercase"
                      style={{ color: "#a3a3a3", margin: "0 0 12px" }}
                    >
                      Update {String(index).padStart(2, "0")}
                    </Text>
                  )}

                  <Heading
                    as="h2"
                    className="m-0 mb-4 font-bold tracking-[-0.3px] text-neutral-900"
                    style={{
                      fontSize: index === 0 ? "26px" : "22px",
                      lineHeight: "1.3",
                      margin: "0 0 16px",
                    }}
                  >
                    {section.title}
                  </Heading>

                  {section.text.split("\n\n").map((paragraph, pIndex, paragraphs) => (
                    <Text
                      key={`${section.id}-p-${pIndex}`}
                      className="m-0"
                      style={{
                        color: "#525252",
                        fontSize: index === 0 ? "16px" : "15px",
                        lineHeight: "1.7",
                        margin: 0,
                        marginBottom: pIndex === paragraphs.length - 1 ? "24px" : "16px",
                      }}
                    >
                      {paragraph}
                    </Text>
                  ))}

                  {section.ctaHref && section.ctaLabel && (
                    <Button
                      href={section.ctaHref}
                      className="inline-block text-[14px] font-semibold text-white"
                      style={{
                        background: FIRE_GRADIENT_DIAGONAL,
                        borderRadius: "10px",
                        padding: "12px 24px",
                        textDecoration: "none",
                        boxShadow: "0 2px 8px rgba(255,85,85,0.35), 0 1px 2px rgba(0,0,0,0.06)",
                      }}
                    >
                      {section.ctaLabel} →
                    </Button>
                  )}
                </Section>
              </Section>
            ))}

            <Section className="pt-8" style={{ paddingTop: "32px" }}>
              <Hr
                className="m-0 mb-6"
                style={{ border: "none", borderTop: "1px solid #e5e5e5", margin: "0 0 24px" }}
              />
              <Row>
                <Column>
                  <Text
                    className="m-0 text-[13px] font-semibold"
                    style={{ color: "#171717", margin: 0 }}
                  >
                    {appName}
                  </Text>
                  <Text className="m-0 text-[12px]" style={{ color: "#a3a3a3", margin: "4px 0 0" }}>
                    Community events for developers
                  </Text>
                </Column>
                <Column align="right" className="table-cell align-bottom">
                  <Link
                    href={unsubscribeUrl}
                    className="text-[12px]"
                    style={{ color: "#a3a3a3", textDecoration: "underline" }}
                  >
                    Unsubscribe
                  </Link>
                </Column>
              </Row>
              <Row style={{ marginTop: "20px" }}>
                <Column>
                  <Text className="m-0 text-[11px]" style={{ color: "#d4d4d4", margin: 0 }}>
                    © {new Date().getFullYear()} {appName}. All rights reserved.
                  </Text>
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

Newsletter.PreviewProps = {
  appName: "Bonfire",
  baseUrl: "https://bnf.events",
  lang: "en",
  logoUrl: "https://bnf.events/assets/brand/RGB_PNG_01_bonfire_black_gradient.png",
  previewText: "AI Agents update, new venues, and community spotlight.",
  subject: "Bonfire Weekly: The Future of AI Agents",
  unsubscribeUrl: "https://bnf.events/unsubscribe",
  sections: [
    {
      id: "hero",
      title: "The Rise of Autonomous Agents",
      text: "We are entering a new era of software where agents don't just chat—they do. In this week's update, we explore how Bonfire is integrating agentic workflows into our core event loop, making organizing seamless.",
      imageUrl:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
      ctaLabel: "Read Full Article",
      ctaHref: "https://bnf.events/blog/agents",
    },
    {
      id: "community",
      title: "Community Spotlight: Prague Python",
      text: "Big shoutout to the Pyvo community for hosting their 100th meetup! It's incredible to see the longevity and passion in the local tech scene. Check out the photo gallery from the event.",
      ctaLabel: "View Gallery",
      ctaHref: "https://bnf.events/gallery/pyvo-100",
    },
    {
      id: "update",
      title: "Platform Update: fast-checkin",
      text: "No more queues. Our new QR based check-in is live and rolling out to all organizers next week. It's built on our new high-performance Zig backend.",
    },
  ],
} satisfies NewsletterProps;

export default Newsletter;
