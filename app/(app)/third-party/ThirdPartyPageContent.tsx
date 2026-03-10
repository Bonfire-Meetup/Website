"use client";

import { useTranslations } from "next-intl";

import { StaticPageHero } from "@/components/layout/StaticPageHero";
import { WEBSITE_URLS } from "@/lib/config/constants";

import { ShouldersOfGiants } from "./ShouldersOfGiants";

interface Technology {
  name: string;
  license: string;
  url?: string;
  description?: string;
}

const TECHNOLOGIES: Record<string, Technology[]> = {
  framework: [
    { name: "Next.js", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.NEXTJS },
    { name: "React", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.REACT },
    { name: "React DOM", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.REACT_DOM },
    { name: "TypeScript", license: "Apache-2.0", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.TYPESCRIPT },
  ],
  state: [
    { name: "Redux Toolkit", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.REDUX_TOOLKIT },
    { name: "React Redux", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.REACT_REDUX },
    {
      name: "TanStack React Query",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.TANSTACK_QUERY,
    },
  ],
  styling: [
    { name: "Tailwind CSS", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.TAILWINDCSS },
    {
      name: "@tailwindcss/postcss",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.TAILWINDCSS,
    },
    { name: "next-themes", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.NEXT_THEMES },
  ],
  database: [
    { name: "Neon Postgres", license: "Apache-2.0", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.NEON },
    {
      name: "@neondatabase/serverless",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.NEON_SERVERLESS,
    },
    { name: "Drizzle ORM", license: "Apache-2.0", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.DRIZZLE_ORM },
  ],
  i18n: [
    { name: "next-intl", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.NEXT_INTL },
    { name: "nuqs", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.NUQS },
  ],
  auth: [
    { name: "jose", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.JOSE },
    {
      name: "@simplewebauthn/browser",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.SIMPLE_WEBAUTHN,
    },
    {
      name: "@simplewebauthn/server",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.SIMPLE_WEBAUTHN,
    },
  ],
  utilities: [
    { name: "qrcode", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.QRCODE },
    {
      name: "qr-scanner",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.QR_SCANNER,
    },
    { name: "ua-parser-js", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.UA_PARSER },
    { name: "zod", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.ZOD },
  ],
  fonts: [
    {
      name: "Geist",
      license: "SIL Open Font License 1.1",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.GEIST_FONT,
    },
  ],
  build: [
    { name: "Bun", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.BUN },
    { name: "PostCSS", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.POSTCSS },
    { name: "cssnano", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.CSSNANO },
    { name: "Sharp", license: "Apache-2.0", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.SHARP },
    { name: "drizzle-kit", license: "Apache-2.0", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.DRIZZLE_ORM },
    {
      name: "babel-plugin-react-compiler",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.BABEL_REACT_COMPILER,
    },
    {
      name: "React Email",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.REACT_EMAIL,
    },
    {
      name: "@react-email/components",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.REACT_EMAIL_COMPONENTS,
    },
    {
      name: "@react-email/preview-server",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.REACT_EMAIL_CLI,
    },
  ],
  analytics: [
    {
      name: "Vercel Analytics",
      license: "Commercial",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.VERCEL_ANALYTICS,
    },
    {
      name: "Vercel Speed Insights",
      license: "Commercial",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.VERCEL_SPEED_INSIGHTS,
    },
    { name: "@rollbar/react", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.ROLLBAR_REACT },
    { name: "Rollbar", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.ROLLBAR },
  ],
  security: [{ name: "botid", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.BOTID }],
  linting: [
    { name: "oxlint", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.OXC },
    { name: "oxfmt", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.OXC },
    { name: "ESLint", license: "MIT", url: WEBSITE_URLS.ATTRIBUTIONS.TECH.ESLINT },
    {
      name: "@stylistic/eslint-plugin",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.ESLINT_STYLE,
    },
    {
      name: "@typescript-eslint/parser",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.TYPESCRIPT_ESLINT,
    },
    {
      name: "@types/node",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.DEFINITELY_TYPED,
    },
    {
      name: "@types/qrcode",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.DEFINITELY_TYPED,
    },
    {
      name: "@types/react",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.DEFINITELY_TYPED,
    },
    {
      name: "@types/react-dom",
      license: "MIT",
      url: WEBSITE_URLS.ATTRIBUTIONS.TECH.DEFINITELY_TYPED,
    },
  ],
};

export function ThirdPartyPageContent() {
  const t = useTranslations("attributions");

  return (
    <main className="gradient-bg min-h-screen pb-20">
      <StaticPageHero
        backgroundVariant="events"
        eyebrow={t("title")}
        heroWord="ATTRIBUTIONS"
        heroWordSize="xs"
        subtitle={t("subtitle")}
        subtitleClassName="mx-auto max-w-3xl text-lg text-neutral-600 dark:text-neutral-400"
        title={
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
            {t("title")}
          </h1>
        }
      />

      <div className="px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <ShouldersOfGiants />
          </div>

          <div className="glass-card no-hover-pop space-y-8 p-8 sm:p-12">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-neutral-600 dark:text-neutral-400">{t("intro")}</p>
            </div>

            <div className="space-y-10">
              {Object.entries(TECHNOLOGIES).map(([category, items]) => (
                <section key={category}>
                  <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">
                    {t(`categories.${category}`)}
                  </h2>
                  <div className="space-y-3">
                    {items.map((tech) => (
                      <div
                        key={tech.name}
                        className="flex flex-col gap-1 border-b border-neutral-200 pb-3 last:border-0 sm:flex-row sm:items-center sm:justify-between dark:border-white/10"
                      >
                        <div className="flex-1">
                          {tech.url ? (
                            <a
                              href={tech.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-brand-600 dark:hover:text-brand-400 font-semibold text-neutral-900 transition-colors dark:text-white"
                            >
                              {tech.name}
                            </a>
                          ) : (
                            <span className="font-semibold text-neutral-900 dark:text-white">
                              {tech.name}
                            </span>
                          )}
                          {tech.description && (
                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                              {tech.description}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-neutral-500 sm:text-right dark:text-neutral-400">
                          {tech.license}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-white/10">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t("footer")}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
