import { WEBSITE_URLS } from "@/lib/config/constants";
import type { Recording } from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { escapeXml } from "./sitemap-utils";

export interface VideosRssChannel {
  title: string;
  description: string;
  link: string;
  feedUrl: string;
  language?: string;
  managingEditor?: string;
}

function toRfc822Date(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toUTCString();
}

function absoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  return `${WEBSITE_URLS.BASE}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

function buildItemDescription(recording: Recording) {
  if (recording.description?.trim()) {
    return recording.description.trim();
  }

  const parts = [
    recording.speaker.length > 0 ? `Speakers: ${recording.speaker.join(", ")}` : null,
    recording.episode ? `Episode: ${recording.episode}` : null,
    recording.location ? `Location: ${recording.location}` : null,
    recording.tags.length > 0 ? `Tags: ${recording.tags.join(", ")}` : null,
  ].filter(Boolean);

  return parts.join(" · ") || recording.title;
}

function cdata(value: string) {
  return `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

function renderCategories(tags: string[]) {
  return tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n");
}

function renderCreators(speakers: string[]) {
  return speakers
    .map((speaker) => `      <dc:creator>${escapeXml(speaker)}</dc:creator>`)
    .join("\n");
}

function renderItem(recording: Recording) {
  const pageUrl = `${WEBSITE_URLS.BASE}${PAGE_ROUTES.WATCH(recording.slug, recording.shortId)}`;
  const thumbnailUrl = absoluteUrl(recording.thumbnail);
  const description = buildItemDescription(recording);
  const embedUrl = `${WEBSITE_URLS.EMBED.YOUTUBE_NOCOOKIE}/${recording.youtubeId}`;
  const categories = renderCategories(recording.tags);
  const creators = renderCreators(recording.speaker);

  return [
    "    <item>",
    `      <title>${escapeXml(recording.title)}</title>`,
    `      <link>${escapeXml(pageUrl)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(pageUrl)}</guid>`,
    `      <pubDate>${toRfc822Date(recording.date)}</pubDate>`,
    creators || null,
    categories || null,
    `      <description>${cdata(description)}</description>`,
    `      <content:encoded>${cdata(`<p>${escapeXml(description)}</p>`)}</content:encoded>`,
    `      <media:title>${escapeXml(recording.title)}</media:title>`,
    `      <media:description>${cdata(description)}</media:description>`,
    `      <media:thumbnail url="${escapeXml(thumbnailUrl)}" width="1280" height="720" />`,
    `      <media:content url="${escapeXml(recording.url)}" medium="video" type="text/html" isDefault="true">`,
    `        <media:player url="${escapeXml(embedUrl)}" />`,
    "      </media:content>",
    "    </item>",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildVideosRssXml(recordings: Recording[], channel: VideosRssChannel) {
  const lastBuildDate =
    recordings.length > 0 ? toRfc822Date(recordings[0].date) : new Date().toUTCString();
  const language = channel.language ?? "en";
  const items = recordings.map(renderItem).join("\n");

  const channelBody = [
    `    <title>${escapeXml(channel.title)}</title>`,
    `    <link>${escapeXml(channel.link)}</link>`,
    `    <description>${escapeXml(channel.description)}</description>`,
    `    <language>${escapeXml(language)}</language>`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    "    <generator>Bonfire Events</generator>",
    channel.managingEditor
      ? `    <managingEditor>${escapeXml(channel.managingEditor)}</managingEditor>`
      : null,
    `    <atom:link href="${escapeXml(channel.feedUrl)}" rel="self" type="application/rss+xml" />`,
    items || null,
  ]
    .filter(Boolean)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
${channelBody}
  </channel>
</rss>
`;
}
