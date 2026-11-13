import { allEvents } from "@/data/events-calendar";
import type { LocationValue } from "@/lib/config/constants";
import { getDevAccountFixture, getDevAccountFixtureForSpeaker } from "@/lib/dev/local-fixtures";
import {
  getSpeakerRecord,
  getSpeakerTalkRecord,
  speakerAssetUrl,
  type SpeakerTalkRecord,
} from "@/lib/events/speaker-records";
import { SOCIAL_FORMATS, type SocialFormat } from "@/lib/events/speaker-socials";
import {
  hasRenderableSpeakerName,
  isTbaSpeakerName,
  resolveSpeakerLinks,
  speakerIdFromPathSegment,
  speakerPathSegment,
} from "@/lib/events/speakers";

export interface SpeakerSocialImage {
  format: SocialFormat;
  url: string;
}

export interface SpeakerTalk {
  coSpeakers: { name: string; slug: string }[];
  group?: { name: string; slug: string };
  date: string;
  description?: string;
  eventId: string;
  eventTitle: string;
  company?: string;
  image?: { height: number; url: string; width: number };
  location: LocationValue;
  recordingId?: string;
  socials: SpeakerSocialImage[];
  startTime?: string;
  topic: string;
  venue: string;
}

export interface SpeakerProfile {
  company?: string;
  /** Id in speakers.json. */
  id: string;
  kind: "group" | "person";
  members?: { name: string; photoUrl?: string; slug: string }[];
  name: string;
  photoUrl?: string;
  profileId?: string;
  /** URL segment of the speaker page. */
  slug: string;
  talks: SpeakerTalk[];
  url?: string;
}

// A social image's format is its file name: ".../ig-post.png" is the "ig-post" format.
function toSocials(record: SpeakerTalkRecord | undefined): SpeakerSocialImage[] {
  const byFormat = new Map(
    (record?.socials ?? []).map((src) => [
      src
        .split("/")
        .pop()
        ?.replace(/\.\w+$/u, ""),
      src,
    ]),
  );

  return (Object.keys(SOCIAL_FORMATS) as SocialFormat[]).flatMap((format) => {
    const url = speakerAssetUrl(byFormat.get(format));
    return url ? [{ format, url }] : [];
  });
}

function toTalkImage(record: SpeakerTalkRecord | undefined): SpeakerTalk["image"] {
  const url = speakerAssetUrl(record?.image?.src);
  return record?.image && url
    ? { height: record.image.height, url, width: record.image.width }
    : undefined;
}

function buildSpeakerProfiles(): Map<string, SpeakerProfile> {
  const profiles = new Map<string, SpeakerProfile>();

  // Newest event first, so a speaker's latest company and links win.
  for (const event of [...allEvents].reverse()) {
    const namedSpeakers = event.speakers.filter(
      (speaker) => hasRenderableSpeakerName(speaker.name) && !isTbaSpeakerName(speaker.name),
    );

    for (const speaker of namedSpeakers) {
      const people = resolveSpeakerLinks(speaker).flatMap((person) =>
        person.id && person.slug ? [{ ...person, id: person.id, slug: person.slug }] : [],
      );
      const group = speaker.group
        ? {
            id: speaker.group.id,
            name: speaker.group.name,
            slug: speakerPathSegment(speaker.group.name, speaker.group.id),
          }
        : undefined;
      const groupTalk = group ? getSpeakerTalkRecord(group.id, event.id) : undefined;
      const talk = {
        date: event.date,
        description: speaker.description,
        eventId: event.id,
        eventTitle: event.title,
        location: event.location,
        recordingId: speaker.recordingId,
        startTime: speaker.startTime,
        topic: speaker.topic,
        venue: event.venue.split(",")[0]?.trim() ?? "",
      };

      // A group gets its own page; its members keep theirs and point to it.
      if (group) {
        const record = getSpeakerRecord(group.id);
        const groupProfile = profiles.get(group.id) ?? {
          id: group.id,
          kind: "group" as const,
          members: [],
          name: group.name,
          photoUrl: speakerAssetUrl(record?.photo),
          profileId: record?.communityId,
          slug: group.slug,
          talks: [],
          url: record?.url ?? speaker.group?.url,
        };
        for (const person of people) {
          if (!groupProfile.members?.some((member) => member.slug === person.slug)) {
            groupProfile.members?.push({
              name: person.name,
              photoUrl: speakerAssetUrl(getSpeakerRecord(person.id)?.photo),
              slug: person.slug,
            });
          }
        }
        groupProfile.talks.push({
          ...talk,
          coSpeakers: [],
          image: toTalkImage(groupTalk),
          socials: toSocials(groupTalk),
        });
        profiles.set(group.id, groupProfile);
      }

      for (const person of people) {
        const record = getSpeakerRecord(person.id);
        const ownTalk = getSpeakerTalkRecord(person.id, event.id);
        const profile = profiles.get(person.id) ?? {
          company: record?.company,
          id: person.id,
          kind: "person" as const,
          name: person.name,
          photoUrl: speakerAssetUrl(record?.photo),
          profileId: record?.communityId,
          slug: person.slug,
          talks: [],
          url: record?.url,
        };
        profile.talks.push({
          ...talk,
          coSpeakers: people
            .filter((other) => other.id !== person.id)
            .map((other) => ({ name: other.name, slug: other.slug })),
          company: person.company,
          group: group ? { name: group.name, slug: group.slug } : undefined,
          image: toTalkImage(ownTalk) ?? toTalkImage(groupTalk),
          socials: ownTalk?.socials ? toSocials(ownTalk) : toSocials(groupTalk),
        });
        profiles.set(person.id, profile);
      }
    }
  }

  return profiles;
}

const speakerProfiles = buildSpeakerProfiles();

function withDevAccount(profile: SpeakerProfile): SpeakerProfile {
  const fixture = getDevAccountFixtureForSpeaker(profile.id);
  return fixture ? { ...profile, profileId: fixture.publicId } : profile;
}

export function getAllSpeakerProfiles(): SpeakerProfile[] {
  return [...speakerProfiles.values()];
}

export function getSpeakerProfileById(id: string): SpeakerProfile | undefined {
  const profile = speakerProfiles.get(id);
  return profile ? withDevAccount(profile) : undefined;
}

export function getSpeakerProfileByUserId(profileId: string): SpeakerProfile | undefined {
  const fixtureSpeakerId = getDevAccountFixture(profileId)?.speaker;
  if (fixtureSpeakerId) {
    return getSpeakerProfileById(fixtureSpeakerId);
  }
  return getAllSpeakerProfiles().find((profile) => profile.profileId === profileId);
}

/** Looks a speaker up by page URL segment ("martin-pelikan-<id>"); only the id matters. */
export function getSpeakerProfile(pathSegment: string): SpeakerProfile | undefined {
  return getSpeakerProfileById(speakerIdFromPathSegment(pathSegment));
}
