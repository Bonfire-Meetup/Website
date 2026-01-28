"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { QuestionAnchor } from "@/components/faq/QuestionAnchor";
import { BoltIcon, FireIcon, GuildIcon } from "@/components/shared/icons";
import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export function FaqPageContent() {
  const t = useTranslations("faqPage");
  const tRecordings = useTranslations("recordings");

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-4 pt-32 pb-14 sm:min-h-[65vh] sm:pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
          <div className="absolute top-28 right-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,var(--color-orange-glow),transparent_62%)]" />
          <div className="absolute bottom-10 left-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,var(--color-rose-glow),transparent_65%)]" />
        </div>

        <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap select-none">
          <span className="text-outline block text-[15vw] leading-none font-black opacity-[0.03] sm:text-[11vw] dark:opacity-[0.02]">
            FAQ
          </span>
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="text-brand-600 dark:text-brand-300 mb-6 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.4em] uppercase sm:gap-3 sm:text-sm sm:tracking-[0.5em]">
            <span className="to-brand-400 h-px w-8 bg-gradient-to-r from-transparent sm:w-12" />
            {t("eyebrow")}
            <span className="to-brand-400 h-px w-8 bg-gradient-to-l from-transparent sm:w-12" />
          </p>

          <h1 className="mb-5 text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
            <span className="block">{t("titlePart1")}</span>
            <span className="text-gradient-static block">{t("titleHighlight")}</span>
          </h1>

          <p className="mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl px-4 pb-24">
        <div className="space-y-16">
          {[
            { key: "general", questions: ["whatIsBonfire", "howOften", "entryFee"] },
            { key: "participation", questions: ["howToSpeaker", "howToJoin"] },
            { key: "community", questions: ["isRecorded", "discord", "photos"] },
            {
              key: "technical",
              questions: ["howToRegister", "howToSignIn", "passkeyFlow", "howToDelete"],
            },
          ].map((section) => (
            <div key={section.key} className="space-y-6">
              <h2 className="flex items-center gap-3 px-2 text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                <span className="bg-brand-500 h-5 w-1 rounded-full" />
                {t(`sections.${section.key}`)}
              </h2>
              <div className="grid gap-4 sm:grid-cols-1">
                {section.questions.map((qKey) => {
                  const anchorId = qKey.replace(/[A-Z]/g, (l) => `-${l.toLowerCase()}`);
                  return (
                    <div
                      key={qKey}
                      id={anchorId}
                      className="group hover:border-brand-500/30 dark:hover:border-brand-500/20 scroll-mt-32 rounded-3xl border border-neutral-200/70 bg-white/50 p-6 transition-all duration-300 hover:bg-white sm:p-8 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      <h3 className="group-hover:text-brand-600 dark:group-hover:text-brand-400 mb-3 flex items-center text-lg font-bold text-neutral-900 transition-colors dark:text-neutral-100">
                        {t(`questions.${qKey}.title`)}
                        <QuestionAnchor id={anchorId} />
                      </h3>
                      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {t.rich(`questions.${qKey}.answer`, {
                          bold: (chunks) => (
                            <strong className="text-neutral-900 dark:text-white">{chunks}</strong>
                          ),
                          link: (chunks) => {
                            let href: string = PAGE_ROUTES.HOME;
                            if (qKey === "howToSpeaker") {
                              href = PAGE_ROUTES.SPEAK;
                            }
                            if (qKey === "howToJoin") {
                              href = PAGE_ROUTES.CONTACT_WITH_TYPE("crew");
                            }
                            if (qKey === "photos") {
                              href = PAGE_ROUTES.CONTACT_WITH_TYPE("press");
                            }
                            if (qKey === "howToDelete") {
                              href = PAGE_ROUTES.ME;
                            }
                            if (qKey === "passkeyFlow") {
                              href = PAGE_ROUTES.ME;
                            }
                            if (qKey === "discord") {
                              return (
                                <a
                                  href="https://discord.com/invite/8Tqm7vAd4h"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-600 decoration-brand-500/30 hover:text-brand-500 hover:decoration-brand-500 dark:text-brand-400 dark:decoration-brand-400/30 dark:hover:text-brand-300 font-semibold underline underline-offset-4 transition-colors"
                                >
                                  {chunks}
                                </a>
                              );
                            }
                            return (
                              <Link
                                href={href}
                                className="text-brand-600 decoration-brand-500/30 hover:text-brand-500 hover:decoration-brand-500 dark:text-brand-400 dark:decoration-brand-400/30 dark:hover:text-brand-300 font-semibold underline underline-offset-4 transition-colors"
                              >
                                {chunks}
                              </Link>
                            );
                          },
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="space-y-6">
            <h2 className="flex items-center gap-3 px-2 text-xl font-black tracking-tight text-neutral-900 dark:text-white">
              <span className="h-5 w-1 rounded-full bg-orange-500" />
              {t("sections.engagement")}
            </h2>
            <div className="grid gap-6">
              <div
                id="sparks"
                className="group scroll-mt-32 rounded-3xl border border-neutral-200/70 bg-white/50 p-6 transition-all duration-300 hover:border-rose-500/30 hover:bg-white sm:p-8 dark:border-white/5 dark:bg-white/5 dark:hover:border-rose-500/20 dark:hover:bg-white/10"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="flex items-center text-lg font-bold text-neutral-900 transition-colors group-hover:text-rose-600 dark:text-neutral-100 dark:group-hover:text-rose-400">
                    {t("sparks.title")}
                    <QuestionAnchor id="sparks" />
                  </h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                    <FireIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {tRecordings("spark")}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {t("sparks.body")}
                </p>
                <div className="mt-6 rounded-2xl border border-neutral-200/60 bg-neutral-50/70 px-4 py-3 text-sm text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    {t("impact.title")}
                  </div>
                  <div className="mt-1">{t("sparks.impact")}</div>
                </div>
              </div>

              <div
                id="boosts"
                className="group scroll-mt-32 rounded-3xl border border-neutral-200/70 bg-white/50 p-6 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white sm:p-8 dark:border-white/5 dark:bg-white/5 dark:hover:border-emerald-500/20 dark:hover:bg-white/10"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="flex items-center text-lg font-bold text-neutral-900 transition-colors group-hover:text-emerald-600 dark:text-neutral-100 dark:group-hover:text-emerald-400">
                    {t("boosts.title")}
                    <QuestionAnchor id="boosts" />
                  </h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                    <BoltIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {tRecordings("boost")}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {t("boosts.body")}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-200/60 bg-neutral-50/70 px-4 py-3 text-sm text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                    <div className="font-semibold text-neutral-900 dark:text-white">
                      {t("impact.title")}
                    </div>
                    <div className="mt-1">{t("boosts.impact")}</div>
                  </div>
                  <div className="rounded-2xl border border-neutral-200/60 bg-neutral-50/70 px-4 py-3 text-sm text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                    <div className="font-semibold text-neutral-900 dark:text-white">
                      {t("boosts.limitsTitle")}
                    </div>
                    <div className="mt-1">{t("boosts.limits")}</div>
                  </div>
                </div>
              </div>

              <div
                id="guild"
                className={`group scroll-mt-32 rounded-3xl border border-neutral-200/70 bg-white/50 p-6 transition-all duration-300 ${ENGAGEMENT_BRANDING.guild.classes.cardHover} sm:p-8 dark:border-white/5 dark:bg-white/5`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3
                    className={`flex items-center text-lg font-bold text-neutral-900 transition-colors ${ENGAGEMENT_BRANDING.guild.classes.titleHover} dark:text-neutral-100`}
                  >
                    {t("guild.title")}
                    <QuestionAnchor id="guild" />
                  </h3>
                  <span className={ENGAGEMENT_BRANDING.guild.classes.badge}>
                    <GuildIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("guild.badge", { defaultValue: "Guild" })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {t("guild.body")}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {t("guild.description")}
                </p>
                <div className="mt-6 rounded-2xl border border-neutral-200/60 bg-neutral-50/70 px-4 py-3 text-sm text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    {t("guild.featuresTitle", { defaultValue: "What You Get" })}
                  </div>
                  <div className="mt-1">{t("guild.features")}</div>
                </div>
                <div className={`mt-3 ${ENGAGEMENT_BRANDING.guild.classes.infoBox}`}>
                  <div className={ENGAGEMENT_BRANDING.guild.classes.infoBoxTitle}>
                    {t("guild.stayTunedTitle", { defaultValue: "Stay Tuned" })}
                  </div>
                  <div className="mt-1">{t("guild.comingSoon")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
