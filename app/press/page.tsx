import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SectionHeader } from "../components/SectionHeader";
import { CopyButton } from "../components/CopyButton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("pressTitle"),
    description: t("pressDescription"),
    openGraph: {
      title: t("pressTitle"),
      description: t("pressDescription"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("pressTitle"),
      description: t("pressDescription"),
    },
  };
}

export default async function PressPage() {
  const t = await getTranslations("press");
  const tHero = await getTranslations("hero");

  const aboutText = t("about.body");

  const logoGroups = [
    {
      title: t("logos.brands.bonfire"),
      variants: [
        {
          label: t("logos.variants.black"),
          bg: "bg-white",
          png: "/press-kit/brand/RGB_PNG_01_bonfire_black.png",
          svg: "/press-kit/brand/RGB_SVG_01_bonfire_black.svg",
        },
        {
          label: t("logos.variants.gray"),
          bg: "bg-neutral-100",
          png: "/press-kit/brand/RGB_PNG_02_bonfire_gray.png",
          svg: "/press-kit/brand/RGB_SVG_02_bonfire_gray.svg",
        },
        {
          label: t("logos.variants.white"),
          bg: "bg-neutral-900",
          png: "/press-kit/brand/RGB_PNG_03_bonfire_white.png",
          svg: "/press-kit/brand/RGB_SVG_03_bonfire_white.svg",
        },
      ],
    },
    {
      title: t("logos.brands.prague"),
      variants: [
        {
          label: t("logos.variants.black"),
          bg: "bg-white",
          png: "/press-kit/brand/RGB_PNG_04_bonfire-prague_black.png",
          svg: "/press-kit/brand/RGB_SVG_04_bonfire-prague_black.svg",
        },
        {
          label: t("logos.variants.gray"),
          bg: "bg-neutral-100",
          png: "/press-kit/brand/RGB_PNG_05_bonfire-prague_gray.png",
          svg: "/press-kit/brand/RGB_SVG_05_bonfire-prague_gray.svg",
        },
        {
          label: t("logos.variants.white"),
          bg: "bg-neutral-900",
          png: "/press-kit/brand/RGB_PNG_06_bonfire-prague_white.png",
          svg: "/press-kit/brand/RGB_SVG_06_bonfire-prague_white.svg",
        },
      ],
    },
    {
      title: t("logos.brands.zlin"),
      variants: [
        {
          label: t("logos.variants.black"),
          bg: "bg-white",
          png: "/press-kit/brand/RGB_PNG_07_bonfire-zlin_black.png",
          svg: "/press-kit/brand/RGB_SVG_07_bonfire-zlin_black.svg",
        },
        {
          label: t("logos.variants.gray"),
          bg: "bg-neutral-100",
          png: "/press-kit/brand/RGB_PNG_08_bonfire-zlin_gray.png",
          svg: "/press-kit/brand/RGB_SVG_08_bonfire-zlin_gray.svg",
        },
        {
          label: t("logos.variants.white"),
          bg: "bg-neutral-900",
          png: "/press-kit/brand/RGB_PNG_09_bonfire-zlin_white.png",
          svg: "/press-kit/brand/RGB_SVG_09_bonfire-zlin_white.svg",
        },
      ],
    },
  ];

  const colors = [
    { name: t("colors.brand"), hex: "#8b5cf6" },
    { name: t("colors.brandDeep"), hex: "#6d28d9" },
    { name: t("colors.fireMid"), hex: "#d946ef" },
    { name: t("colors.fireEnd"), hex: "#f43f5e" },
  ];

  const stats = [
    { label: tHero("stats.locations"), value: tHero("stats.locationsValue"), emphasis: "xl" },
    { label: tHero("stats.talks"), value: tHero("stats.talksValue"), emphasis: "xl" },
    { label: tHero("stats.attendees"), value: tHero("stats.attendeesValue"), emphasis: "xl" },
    { label: t("stats.firstPragueLabel"), value: t("stats.firstPragueDate"), emphasis: "sm" },
    { label: t("stats.firstZlinLabel"), value: t("stats.firstZlinDate"), emphasis: "sm" },
  ];

  return (
    <>
      <Header />
      <main className="gradient-bg min-h-screen pt-28 pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400">
              {t("eyebrow")}
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">{t("subtitle")}</p>
          </div>

          <section className="glass-card no-hover-pop p-8 sm:p-12">
            <div className="flex flex-col gap-4">
              <div className="max-w-3xl space-y-4">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {t("about.title")}
                </h2>
                <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {aboutText}
                </p>
              </div>
              <CopyButton
                text={aboutText}
                label={t("about.copy")}
                copiedLabel={t("about.copied")}
                className="self-start"
              />
            </div>
          </section>

          <section>
            <SectionHeader title={t("stats.title")} subtitle={t("stats.subtitle")} />
            <div className="glass-card no-hover-pop p-6 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center sm:text-left">
                    <div
                      className={`font-bold text-neutral-900 dark:text-white ${
                        stat.emphasis === "sm" ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"
                      }`}
                    >
                      {stat.value}
                    </div>
                    <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <SectionHeader title={t("logos.title")} subtitle={t("logos.subtitle")} />
            <div className="space-y-10">
              {logoGroups.map((group) => (
                <div key={group.title} className="glass-card no-hover-pop p-6 sm:p-8">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    {group.title}
                  </h3>
                  <div className="mt-6 grid gap-6 md:grid-cols-3">
                    {group.variants.map((variant) => (
                      <div
                        key={`${group.title}-${variant.label}`}
                        className="overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-white/10"
                      >
                        <div className={`flex items-center justify-center p-6 ${variant.bg}`}>
                          <Image
                            src={variant.png}
                            alt={`${group.title} ${variant.label}`}
                            width={260}
                            height={90}
                            className="h-16 w-auto object-contain"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3 p-4">
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {variant.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <a
                              href={variant.png}
                              download
                              className="inline-flex items-center justify-center rounded-lg bg-white/80 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm ring-1 ring-black/5 transition hover:bg-white dark:bg-white/10 dark:text-neutral-200 dark:ring-white/10 dark:hover:bg-white/20"
                            >
                              {t("logos.downloadPng")}
                            </a>
                            <a
                              href={variant.svg}
                              download
                              className="inline-flex items-center justify-center rounded-lg bg-white/80 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm ring-1 ring-black/5 transition hover:bg-white dark:bg-white/10 dark:text-neutral-200 dark:ring-white/10 dark:hover:bg-white/20"
                            >
                              {t("logos.downloadSvg")}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="glass-card no-hover-pop p-8 sm:p-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                    {t("logos.downloadAllTitle")}
                  </h3>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    {t("logos.downloadAllSubtitle")}
                  </p>
                </div>
                <a
                  href="/press-kit/bonfire-press-kit.zip"
                  download
                  className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500 dark:bg-brand-500 dark:shadow-brand-500/30 dark:hover:bg-brand-400"
                >
                  {t("logos.downloadAllCta")}
                </a>
              </div>
            </div>
          </section>

          <section>
            <SectionHeader title={t("colors.title")} subtitle={t("colors.subtitle")} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {colors.map((color) => (
                <div key={color.hex} className="glass-card no-hover-pop p-6 text-center">
                  <div
                    className="mx-auto h-20 w-20 rounded-2xl border border-white/40 shadow-inner"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">
                    {color.name}
                  </div>
                  <div className="mt-1 text-xs font-mono text-neutral-600 dark:text-neutral-400">
                    {color.hex}
                  </div>
                  <CopyButton
                    text={color.hex}
                    label={t("colors.copy")}
                    copiedLabel={t("colors.copied")}
                    size="xs"
                    className="mt-4 w-full"
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title={t("guidelines.title")} subtitle={t("guidelines.subtitle")} />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="glass-card no-hover-pop p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {t("guidelines.doTitle")}
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-white/50">•</span>
                    <span>{t("guidelines.do1")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-white/50">•</span>
                    <span>{t("guidelines.do2")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-white/50">•</span>
                    <span>{t("guidelines.do3")}</span>
                  </li>
                </ul>
              </div>
              <div className="glass-card no-hover-pop p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {t("guidelines.dontTitle")}
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-white/50">•</span>
                    <span>{t("guidelines.dont1")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-white/50">•</span>
                    <span>{t("guidelines.dont2")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-white/50">•</span>
                    <span>{t("guidelines.dont3")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <SectionHeader title={t("brandName.title")} subtitle={t("brandName.subtitle")} />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="glass-card no-hover-pop p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {t("brandName.doTitle")}
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-white/50">•</span>
                    <span>{t("brandName.do1")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-white/50">•</span>
                    <span>{t("brandName.do2")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-white/50">•</span>
                    <span>{t("brandName.do3")}</span>
                  </li>
                </ul>
              </div>
              <div className="glass-card no-hover-pop p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {t("brandName.dontTitle")}
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-white/50">•</span>
                    <span>{t("brandName.dont1")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-white/50">•</span>
                    <span>{t("brandName.dont2")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-white/50">•</span>
                    <span>{t("brandName.dont3")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="glass-card no-hover-pop p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {t("photos.title")}
            </h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">{t("photos.body")}</p>
            <div className="mt-4">
              <a
                href={t("photos.link")}
                className="inline-flex items-center gap-2 font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                {t("photos.cta")}
              </a>
            </div>
          </section>

          <section className="glass-card no-hover-pop p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {t("help.title")}
            </h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              {t("help.body")}{" "}
              <a
                href={`mailto:${t("help.email")}`}
                className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                {t("help.email")}
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
