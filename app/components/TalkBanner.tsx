import { getTranslations } from "next-intl/server";
import { Button } from "./Button";

export async function TalkBanner() {
  const t = await getTranslations("sections.talkBanner");
  const email = "hello+proposal@bnf.events";

  return (
    <section className="relative px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="glass-card relative overflow-hidden p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-500/20" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-fire-end/10 blur-3xl dark:bg-fire-end/20" />

          <div className="relative flex flex-col items-center justify-between gap-10 md:flex-row">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-gradient mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {t("title")}
              </h2>
              <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                {t("subtitle")}
              </p>
            </div>

            <div className="flex shrink-0">
              <Button
                href={`mailto:${email}`}
                variant="glass"
                external
                className="group flex items-center gap-3 px-8 py-4"
              >
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-sm font-medium opacity-90">{t("cta")}</span>
                  <span className="text-lg font-bold">{email}</span>
                </div>
                <svg
                  className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
