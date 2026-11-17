import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const dataDir = path.join(repoRoot, "app/data");
const eventsDir = path.resolve(import.meta.dirname, "../events");

const SITE_URL = "https://www.bnf.events";
const DEFAULT_FOCAL = { x: 0.5, y: 0.4 };

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

/** Accepts an event id (looked up in ./events) or a path to a flier config. */
export async function resolveFlierFile(arg) {
  const candidates = arg.endsWith(".json")
    ? [path.resolve(arg)]
    : [path.join(eventsDir, `${arg}.json`)];
  for (const file of candidates) {
    try {
      await fs.access(file);
      return file;
    } catch {
      // Try the next candidate.
    }
  }
  throw new Error(`No flier config for "${arg}". Add scripts/fliers/events/${arg}.json.`);
}

function splitVenue(venue) {
  const [name, ...rest] = venue.split(",").map((part) => part.trim());
  return { name, address: rest.join(", ") };
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Builds the flier for one event: date, venue and talks come from the site data
 * (app/data/events-calendar.json and speakers.json); the flier config adds the
 * photos, partners and any wording that should differ from the defaults.
 */
export async function loadFlierConfig(file) {
  const flier = await readJson(file);
  const id = flier.event ?? path.basename(file, ".json");
  const [calendar, speakerData] = await Promise.all([
    readJson(path.join(dataDir, "events-calendar.json")),
    readJson(path.join(dataDir, "speakers.json")),
  ]);

  const event = calendar.events.find((item) => item.id === id);
  if (!event) {
    throw new Error(`Event "${id}" is not in app/data/events-calendar.json.`);
  }
  const records = new Map(speakerData.speakers.map((record) => [record.id, record]));
  const record = (speakerId) => {
    const found = records.get(speakerId);
    if (!found) {
      throw new Error(`Speaker "${speakerId}" of ${id} is not in app/data/speakers.json.`);
    }
    return found;
  };
  const talkOf = (speaker) => speaker.talks?.find((talk) => talk.eventId === id);

  const talks = event.speakers.map((slot) => {
    const people = (Array.isArray(slot.speaker) ? slot.speaker : [slot.speaker]).map(record);
    const group = slot.group ? record(slot.group) : undefined;
    const label = group?.name ?? people.map((person) => person.name).join(" & ");
    const override = flier.talks?.[label] ?? {};
    const pictured = [group, ...people].find((item) => item?.photo);

    let photo;
    if (override.photo !== false) {
      const source =
        override.file || override.album
          ? {}
          : pictured && {
              url: `${speakerData.baseUrl}/${talkOf(pictured)?.photo ?? pictured.photo}`,
            };
      if (source) {
        photo = {
          ...source,
          ...(override.file && { file: path.resolve(repoRoot, override.file) }),
          ...(override.album && { album: override.album, index: override.index }),
          button: override.button,
          focal: override.focal ?? DEFAULT_FOCAL,
          zoom: override.zoom,
        };
      }
    }

    return {
      time: slot.startTime ?? slot.start,
      title: override.title ?? slot.topic,
      group: group?.name,
      speakers: people.map((person) => ({
        name: person.name,
        company: talkOf(person)?.company ?? person.company,
      })),
      photo,
    };
  });

  // Placeholders hold the empty slots until the whole lineup is announced.
  if (event.announcementStatus !== "full") {
    const taken = new Set(talks.map((talk) => talk.time));
    for (const time of flier.tba ?? []) {
      if (!taken.has(time)) {
        talks.push({ time, tba: true });
      }
    }
  }
  talks.sort((a, b) => (a.time && b.time ? toMinutes(a.time) - toMinutes(b.time) : 0));

  return {
    ...flier,
    id,
    chapter: event.location.toLowerCase(),
    eventName: event.title.split(" - ")[0],
    date: event.date,
    time: event.time,
    venue: flier.venue ?? splitVenue(event.venue),
    url: flier.url ?? `${SITE_URL}/events/${id}`,
    lineup: talks,
  };
}
