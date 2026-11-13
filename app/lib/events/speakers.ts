export interface EventSpeakerLinkable {
  speakerIds?: string[];
  name: string | string[];
  company?: string | string[];
  profileId?: string | string[];
  url?: string | string[];
}

export interface ResolvedSpeakerLink {
  /** Id in speakers.json; absent for placeholders such as "TBA". */
  id?: string;
  name: string;
  /** URL segment of the speaker page; absent without an id. */
  slug?: string;
  company?: string;
  profileId?: string;
  url?: string;
}

export function speakerSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
}

/** Speaker ids look like user public ids: 22 base58 characters in two groups. */
const SPEAKER_ID_LENGTH = 23;

/** Speaker page URL segment: a readable name followed by the speaker's id. */
export function speakerPathSegment(name: string, id: string): string {
  const slug = speakerSlug(name);
  return slug ? `${slug}-${id}` : id;
}

export function speakerIdFromPathSegment(segment: string): string {
  return segment.slice(-SPEAKER_ID_LENGTH);
}

export function toStringArray(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function getSpeakerNames(name: string | string[]): string[] {
  return Array.isArray(name) ? name : [name];
}

export function primarySpeakerName(name: string | string[]): string {
  return Array.isArray(name) ? name[0] : name;
}

export function hasRenderableSpeakerName(name: string | string[]): boolean {
  return primarySpeakerName(name).trim().length > 0;
}

export function isTbaSpeakerName(name: string | string[]): boolean {
  return primarySpeakerName(name).trim().toUpperCase() === "TBA";
}

export function formatSpeakerNames(name: string | string[]): string {
  return getSpeakerNames(name).join(" & ");
}

export function withCompany(name: string, company?: string): string {
  return company ? `${name} (${company})` : name;
}

export function formatSpeakerNameWithCompany(
  name: string | string[],
  company?: string | string[],
): string {
  const names = getSpeakerNames(name);
  const companies = toStringArray(company);

  return names.map((speakerName, i) => withCompany(speakerName, companies[i])).join(" & ");
}

export function resolveSpeakerLinks(speaker: EventSpeakerLinkable): ResolvedSpeakerLink[] {
  const names = getSpeakerNames(speaker.name);
  const companies = toStringArray(speaker.company);
  const profileIds = toStringArray(speaker.profileId);
  const urls = toStringArray(speaker.url);

  return names.map((name, i) => ({
    id: speaker.speakerIds?.[i],
    name,
    slug: speaker.speakerIds?.[i] ? speakerPathSegment(name, speaker.speakerIds[i]) : undefined,
    company: companies[i] || undefined,
    profileId: profileIds[i] || undefined,
    url: urls[i] || undefined,
  }));
}
