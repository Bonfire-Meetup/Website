import {
  Body,
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

export interface EmailCodeProps {
  baseUrl: string;
  brandName: string;
  codeLabel: string;
  expires: string;
  footer: string;
  formattedCode: string;
  ignore: string;
  lang: string;
  logoUrl: string;
  requestFrom?: string;
  securityTip: string;
  subject: string;
  subtitle: string;
  title: string;
}

export function EmailCode({
  baseUrl,
  brandName,
  codeLabel: _codeLabel,
  expires,
  footer,
  formattedCode,
  ignore,
  lang,
  logoUrl,
  requestFrom,
  securityTip,
  subject,
  subtitle,
  title,
}: EmailCodeProps) {
  return (
    <Html lang={lang}>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <title>{subject}</title>
        <style>{`
          :root, html { color-scheme: light; }
          @media (prefers-color-scheme: dark) {
            body, .email-root { background-color: #fafafa !important; color: #0f172a !important; }
          }
          @media (max-width: 480px) {
            .code-container { padding: 24px 16px !important; }
            .code-text { font-size: 28px !important; letter-spacing: 0.15em !important; }
          }
        `}</style>
      </Head>
      <Preview>{formattedCode} is your verification code.</Preview>
      <Tailwind>
        <Body className="email-root m-0 bg-neutral-50 p-0 font-sans antialiased">
          <Container className="max-w-[480px] px-4 py-10">
            <Section className="pb-8 text-center">
              <Link href={baseUrl}>
                <Img
                  src={logoUrl}
                  alt={brandName}
                  width={100}
                  height={52}
                  className="mx-auto block"
                />
              </Link>
            </Section>

            <Section
              className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white"
              style={{
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
              }}
            >
              <Section className="h-1 bg-[linear-gradient(90deg,#8b5cf6_0%,#f43f5e_50%,#f59e0b_100%)]" />

              <Section className="code-container px-8 pt-10 pb-8 text-center">
                <Section className="mb-6">
                  <Section
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(244, 63, 94, 0.1) 100%)",
                    }}
                  >
                    <Text className="m-0 text-2xl">🔐</Text>
                  </Section>
                </Section>

                <Heading
                  as="h1"
                  className="m-0 mb-2 text-[24px] leading-tight font-semibold tracking-[-0.3px] text-neutral-900"
                >
                  {title}
                </Heading>

                <Text className="m-0 mb-8 text-[15px] leading-relaxed text-neutral-500">
                  {subtitle}
                </Text>

                <Row>
                  <Column align="center" className="pb-0 text-center">
                    <Section
                      align="center"
                      width="auto"
                      className="mx-auto w-auto overflow-hidden rounded-2xl"
                      style={{
                        background: "linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)",
                        border: "1px solid #e5e5e5",
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)",
                      }}
                    >
                      <Section className="px-8 py-5 text-center" align="center">
                        <span className="code-text inline-block font-mono text-[36px] leading-none font-bold tracking-[0.25em] whitespace-nowrap text-neutral-900">
                          {formattedCode}
                        </span>
                      </Section>
                    </Section>
                  </Column>
                </Row>
                <Section className="h-6" />

                <Text className="m-0 text-[13px] text-neutral-400">{expires}</Text>

                {requestFrom && (
                  <Section className="mt-4 inline-block rounded-full bg-neutral-100 px-4 py-2">
                    <Text className="m-0 text-[12px] text-neutral-500">📍 {requestFrom}</Text>
                  </Section>
                )}
              </Section>

              <Section className="border-t border-neutral-100 bg-neutral-50 px-8 py-5">
                <Row>
                  <Column width={28} className="align-top">
                    <Text className="m-0 text-sm">🛡️</Text>
                  </Column>
                  <Column className="align-top">
                    <Text className="m-0 text-[12px] leading-relaxed text-neutral-500">
                      {securityTip}
                    </Text>
                  </Column>
                </Row>
              </Section>
            </Section>

            <Section className="pt-8 text-center">
              <Text className="m-0 text-[13px] font-medium text-neutral-700">{footer}</Text>
              <Hr className="mx-auto my-5 w-12 border-t border-neutral-200" />
              <Text className="m-0 text-[11px] leading-relaxed text-neutral-400">{ignore}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

EmailCode.PreviewProps = {
  baseUrl: "https://bnf.events",
  brandName: "Bonfire Events",
  codeLabel: "Your verification code:",
  expires: "This code expires in 10 minutes",
  footer: "Bonfire Events",
  formattedCode: "123 456",
  ignore: "If you didn't request this code, you can safely ignore this email.",
  lang: "en",
  logoUrl: "https://bnf.events/assets/brand/RGB_PNG_01_bonfire_black_gradient.png",
  requestFrom: "Chrome on macOS · Prague, CZ",
  securityTip:
    "Never share this code. Bonfire will never ask for it via phone, chat, or social media.",
  subject: "Your Bonfire verification code",
  subtitle: "Enter this code to complete your sign-in to Bonfire",
  title: "Verify your email",
} satisfies EmailCodeProps;

export default EmailCode;
