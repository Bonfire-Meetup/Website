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

const COLORS = {
  bonfire: "#ff5555",
  violet: "#8b5cf6",
  magenta: "#f43f5e",
  coral: "#f59e0b",
};

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
            <Section className="pb-8">
              <Row>
                <Column width={320} className="align-middle">
                  <Link href={baseUrl} style={{ textDecoration: "none" }}>
                    <Img src={logoUrl} alt={appName} width={110} height={58} className="block" />
                  </Link>
                </Column>
                <Column align="right" className="align-middle">
                  <Link
                    href={
                      viewUrlSlug ? `${baseUrl}/newsletter/${viewUrlSlug}` : `${baseUrl}/newsletter`
                    }
                    className="text-[13px] font-medium text-neutral-500"
                    style={{ textDecoration: "none" }}
                  >
                    View online →
                  </Link>
                </Column>
              </Row>
            </Section>

            {sections.map((section, index) => (
              <Section
                key={section.id}
                className="mb-6 overflow-hidden rounded-lg border border-neutral-200 bg-white"
                style={{
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border={0}>
                  <tr>
                    <td
                      style={{
                        backgroundColor: COLORS.bonfire,
                        fontSize: "4px",
                        lineHeight: "4px",
                      }}
                    >
                      &nbsp;
                    </td>
                  </tr>
                </table>

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

                <Section className="px-8 pt-8 pb-8">
                  {!section.imageUrl && index > 0 && (
                    <Text
                      className="m-0 mb-3 text-[11px] font-bold tracking-[0.2em] uppercase"
                      style={{ color: COLORS.coral }}
                    >
                      Update {String(index).padStart(2, "0")}
                    </Text>
                  )}

                  {index === 0 && !section.imageUrl && (
                    <Text
                      className="m-0 mb-3 text-[11px] font-bold tracking-[0.2em] uppercase"
                      style={{ color: COLORS.coral }}
                    >
                      Featured
                    </Text>
                  )}

                  <Heading
                    as="h2"
                    className="m-0 mb-5 text-[24px] leading-[1.25] font-bold tracking-[-0.3px] text-neutral-900"
                    style={{
                      fontSize: index === 0 ? "28px" : "24px",
                      lineHeight: "1.25",
                    }}
                  >
                    {section.title}
                  </Heading>

                  {section.text.split("\n\n").map((paragraph, pIndex, paragraphs) => (
                    <Text
                      key={`${section.id}-p-${pIndex}`}
                      className="m-0 text-neutral-600"
                      style={{
                        fontSize: index === 0 ? "16px" : "15px",
                        lineHeight: "1.7",
                        marginBottom: pIndex === paragraphs.length - 1 ? "24px" : "16px",
                      }}
                    >
                      {paragraph}
                    </Text>
                  ))}

                  {section.ctaHref && section.ctaLabel && (
                    <Button
                      href={section.ctaHref}
                      className="inline-block rounded-lg px-6 py-3 text-[14px] font-semibold text-white"
                      style={{
                        backgroundColor: COLORS.magenta,
                        textDecoration: "none",
                        boxShadow: "0 2px 8px rgba(244, 63, 94, 0.35)",
                      }}
                    >
                      {section.ctaLabel}
                    </Button>
                  )}
                </Section>
              </Section>
            ))}

            <Section className="pt-6">
              <Hr className="m-0 mb-6 border-t border-neutral-200" />
              <Row>
                <Column>
                  <Text className="m-0 text-[14px] font-bold text-neutral-900">{appName}</Text>
                  <Text className="m-0 mt-1 text-[13px] text-neutral-500">
                    Community events for developers
                  </Text>
                </Column>
                <Column align="right" className="table-cell align-bottom">
                  <Link
                    href={unsubscribeUrl}
                    className="text-[12px] text-neutral-400"
                    style={{ textDecoration: "underline" }}
                  >
                    Unsubscribe
                  </Link>
                </Column>
              </Row>
              <Row className="mt-6">
                <Column>
                  <Text className="m-0 text-[11px] text-neutral-400">
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
