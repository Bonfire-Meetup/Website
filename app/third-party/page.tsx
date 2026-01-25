import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("attributions");

  return {
    description: t("subtitle"),
    title: t("title"),
  };
}

interface Technology {
  name: string;
  license: string;
  url?: string;
  description?: string;
}

const TECHNOLOGIES: Record<string, Technology[]> = {
  framework: [
    { name: "Next.js", license: "MIT", url: "https://nextjs.org" },
    { name: "React", license: "MIT", url: "https://react.dev" },
    { name: "TypeScript", license: "Apache-2.0", url: "https://www.typescriptlang.org" },
  ],
  state: [
    { name: "Redux Toolkit", license: "MIT", url: "https://redux-toolkit.js.org" },
    { name: "TanStack React Query", license: "MIT", url: "https://tanstack.com/query" },
  ],
  styling: [
    { name: "Tailwind CSS", license: "MIT", url: "https://tailwindcss.com" },
    { name: "tailwind-merge", license: "MIT", url: "https://github.com/dcastil/tailwind-merge" },
    { name: "clsx", license: "MIT", url: "https://github.com/lukeed/clsx" },
  ],
  database: [
    { name: "Neon Postgres", license: "Apache-2.0", url: "https://neon.tech" },
  ],
  i18n: [
    { name: "next-intl", license: "MIT", url: "https://next-intl-docs.vercel.app" },
  ],
  auth: [
    { name: "jose", license: "MIT", url: "https://github.com/panva/jose" },
  ],
  utilities: [
    { name: "mustache", license: "MIT", url: "https://github.com/janl/mustache.js" },
    { name: "qrcode", license: "MIT", url: "https://github.com/soldair/node-qrcode" },
    { name: "ua-parser-js", license: "MIT", url: "https://github.com/faisalman/ua-parser-js" },
    { name: "zod", license: "MIT", url: "https://zod.dev" },
  ],
  fonts: [
    { name: "Geist", license: "SIL Open Font License 1.1", url: "https://vercel.com/font" },
  ],
  build: [
    { name: "Bun", license: "MIT", url: "https://bun.sh" },
    { name: "PostCSS", license: "MIT", url: "https://postcss.org" },
    { name: "Sharp", license: "Apache-2.0", url: "https://sharp.pixelplumbing.com" },
    { name: "babel-plugin-react-compiler", license: "MIT", url: "https://react.dev/learn/react-compiler" },
  ],
  analytics: [
    { name: "Vercel Analytics", license: "Commercial", url: "https://vercel.com/analytics" },
    { name: "Vercel Speed Insights", license: "Commercial", url: "https://vercel.com/speed-insights" },
  ],
  security: [
    { name: "botid", license: "MIT", url: "https://botid.io" },
  ],
  linting: [
    { name: "oxlint", license: "MIT", url: "https://oxc-project.github.io" },
    { name: "oxfmt", license: "MIT", url: "https://oxc-project.github.io" },
    { name: "ESLint", license: "MIT", url: "https://eslint.org" },
    { name: "@stylistic/eslint-plugin", license: "MIT", url: "https://eslint.style" },
    { name: "@typescript-eslint/parser", license: "MIT", url: "https://typescript-eslint.io" },
  ],
};

export default async function ThirdPartyPage() {
  const t = await getTranslations("attributions");

  return (
    <>
      <Header />
      <main className="gradient-bg min-h-screen px-4 pt-32 pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
              {t("title")}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">{t("subtitle")}</p>
          </div>

          <div className="glass-card no-hover-pop space-y-8 p-8 sm:p-12">
            <div className="prose prose-neutral max-w-none dark:prose-invert">
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
                        className="flex flex-col gap-1 border-b border-neutral-200 pb-3 last:border-0 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex-1">
                          {tech.url ? (
                            <a
                              href={tech.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-neutral-900 transition-colors hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                            >
                              {tech.name}
                            </a>
                          ) : (
                            <span className="font-semibold text-neutral-900 dark:text-white">{tech.name}</span>
                          )}
                          {tech.description && (
                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{tech.description}</p>
                          )}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 sm:text-right">
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
      </main>
      <Footer />
    </>
  );
}
