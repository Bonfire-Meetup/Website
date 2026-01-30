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
            body, .email-root { background-color: #f8fafc !important; color: #0f172a !important; }
          }
          @media (max-width: 480px) {
            .code-box { padding: 22px 20px !important; }
            .code-text { font-size: 32px !important; letter-spacing: 6px !important; }
          }
        `}</style>
      </Head>
      <Preview>{formattedCode} is your verification code.</Preview>
      <Tailwind>
        <Body className="email-root m-0 bg-slate-100 p-0 font-sans antialiased">
          <Container className="max-w-[520px] px-4 py-12">
            <Section className="pb-10">
              <Row>
                <Column width={280} className="align-middle">
                  <Link href={baseUrl}>
                    <Img src={logoUrl} alt={brandName} width={120} height={63} className="block" />
                  </Link>
                </Column>
                <Column align="right" className="align-middle">
                  <Link
                    href={`${baseUrl}/library`}
                    className="text-sm font-semibold text-red-600 no-underline"
                  >
                    Library
                  </Link>
                  {" · "}
                  <Link
                    href={`${baseUrl}/faq`}
                    className="text-sm font-semibold text-red-600 no-underline"
                  >
                    FAQ
                  </Link>
                </Column>
              </Row>
            </Section>
            <Section className="overflow-hidden rounded-[18px] border border-gray-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.05)]">
              <Section className="bg-slate-50 px-8 pt-0">
                <Hr className="m-0 h-1.5 rounded-full bg-[linear-gradient(90deg,#ff5555,#f43f5e,#f59e0b)] indent-[-9999px]" />
              </Section>
              <Section className="bg-slate-50 px-8 pt-10 pb-8">
                <Heading
                  as="h1"
                  className="m-0 mb-3 text-[26px] leading-tight font-bold tracking-[-0.3px] text-slate-900"
                >
                  {title}
                </Heading>
                <Text className="m-0 mb-8 text-[15px] leading-relaxed text-slate-500">
                  {subtitle}
                </Text>
                <Row>
                  <Column align="center" className="pb-0 text-center">
                    <Section
                      align="center"
                      width="auto"
                      className="mx-auto w-auto overflow-hidden rounded-xl bg-red-600 bg-[linear-gradient(135deg,#dc2626_0%,#f43f5e_100%)] shadow-[0_4px_12px_rgba(220,38,38,0.3)]"
                    >
                      <Section
                        className="code-box bg-red-600 px-10 py-7 text-center"
                        align="center"
                      >
                        <span className="code-text inline-block font-mono text-[42px] leading-none font-bold tracking-[8px] whitespace-nowrap text-white">
                          {formattedCode}
                        </span>
                      </Section>
                    </Section>
                  </Column>
                </Row>
                <Text className="mt-6 text-center text-sm leading-normal text-slate-500">
                  {expires}
                </Text>
                {requestFrom && (
                  <Text className="m-0 mt-2 text-center text-[13px] text-slate-400">
                    Requested from {requestFrom}
                  </Text>
                )}
              </Section>
              <Section className="px-8 pb-8">
                <Section className="rounded-lg border border-red-300 bg-red-50">
                  <Section className="px-4 py-3.5">
                    <Text className="m-0 text-center text-[13px] leading-relaxed text-red-900">
                      {securityTip}
                    </Text>
                  </Section>
                </Section>
              </Section>
            </Section>
            <Section className="pt-8">
              <Row>
                <Column>
                  <Text className="my-2 text-[13px] leading-5 font-semibold text-slate-900">
                    {footer}
                  </Text>
                </Column>
                <Column align="right" className="table-cell align-bottom">
                  <Text className="my-2 text-right text-[11px] leading-4 text-slate-500">
                    {ignore}
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

EmailCode.PreviewProps = {
  baseUrl: "https://bnf.events",
  brandName: "Bonfire Events",
  codeLabel: "Your verification code:",
  expires: "This code expires in 10 minutes.",
  footer: "Bonfire Events",
  formattedCode: "123 456",
  ignore: "If you didn't request this code, you can safely ignore this email.",
  lang: "en",
  logoUrl: "https://bnf.events/assets/brand/RGB_PNG_01_bonfire_black_gradient.png",
  requestFrom: "Chrome on macOS, Prague, CZ",
  securityTip:
    "Never share this code. Bonfire will never ask for it via phone, chat, or social media.",
  subject: "Your Bonfire verification code",
  subtitle: "Enter this code to complete your sign-in to Bonfire.",
  title: "Verify your email",
} satisfies EmailCodeProps;

export default EmailCode;
