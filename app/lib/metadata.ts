import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const META_NS = "meta";
const COMMON_NS = "common";

const FULL_COMMON_KEYS = ["brandName", "country", "prague", "zlin"] as const;

export type MetaPageKey =
  | "home"
  | "crew"
  | "faq"
  | "contact"
  | "talkProposal"
  | "press"
  | "timeline"
  | "upcomingEvents"
  | "library"
  | "photos"
  | "watchLater";

export interface BuildMetaPageMetadataOptions {
  commonValues?: "full" | "brandOnly";
}

async function getMetaAndCommon() {
  const [t, tCommon] = await Promise.all([getTranslations(META_NS), getTranslations(COMMON_NS)]);
  return { t, tCommon, brandName: tCommon("brandName") };
}

function toMetadata(title: string, description: string): Metadata {
  return {
    description,
    openGraph: { description, title, type: "website" },
    title,
    twitter: { card: "summary_large_image", description, title },
  };
}

export async function buildMetaPageMetadata(
  metaKey: MetaPageKey,
  options: BuildMetaPageMetadataOptions = {},
): Promise<Metadata> {
  const { commonValues: commonMode = "full" } = options;
  const { t, tCommon } = await getMetaAndCommon();

  const commonValues =
    commonMode === "brandOnly"
      ? { brandName: tCommon("brandName") }
      : (Object.fromEntries(FULL_COMMON_KEYS.map((k) => [k, tCommon(k)])) as Record<
          string,
          string
        >);

  const title = t(`${metaKey}Title`, commonValues);
  const description = t(`${metaKey}Description`, commonValues);
  return toMetadata(title, description);
}

export interface BuildTitleSubtitleMetadataOptions {
  ns: string;
  titleKey?: string;
  subtitleKey?: string;
}

export async function buildTitleSubtitleMetadata(
  options: BuildTitleSubtitleMetadataOptions,
): Promise<Metadata> {
  const { ns, titleKey = "title", subtitleKey = "subtitle" } = options;
  const [t, brandName] = await Promise.all([getTranslations(ns), getBrandName()]);
  return {
    description: t(subtitleKey),
    title: `${t(titleKey)} | ${brandName}`,
  };
}

export interface BuildSimplePageMetadataOptions {
  ns: string;
  titleKey?: string;
  descriptionKey?: string;
}

export async function buildSimplePageMetadata(
  options: BuildSimplePageMetadataOptions,
): Promise<Metadata> {
  const { ns, titleKey = "title", descriptionKey = "description" } = options;
  const [t, brandName] = await Promise.all([getTranslations(ns), getBrandName()]);
  return {
    description: t(descriptionKey),
    title: t(titleKey, { brandName }),
  };
}

export async function buildNotFoundTitleMetadata(metaKey: string): Promise<Metadata> {
  const { t, brandName } = await getMetaAndCommon();
  return { title: t(metaKey, { brandName }) };
}

export async function getMetaTitleSuffix(): Promise<string> {
  const { t, brandName } = await getMetaAndCommon();
  return t("titleSuffix", { brandName });
}

export async function getBrandName(): Promise<string> {
  const tCommon = await getTranslations(COMMON_NS);
  return tCommon("brandName");
}
