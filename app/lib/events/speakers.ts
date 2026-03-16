export interface EventSpeakerLinkable {
  name: string | string[];
  company?: string | string[];
  profileId?: string | string[];
  url?: string | string[];
}

export interface ResolvedSpeakerLink {
  name: string;
  company?: string;
  profileId?: string;
  url?: string;
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
    name,
    company: companies[i],
    profileId: profileIds[i],
    url: urls[i],
  }));
}
