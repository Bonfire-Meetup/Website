import "server-only";

import {
  getSpeakerRecord,
  getSpeakerTalkRecord,
  speakerAssetUrl,
} from "@/lib/events/speaker-records";
import type { EventItem } from "@/lib/events/types";

export interface SpeakerTalkImage {
  height: number;
  url: string;
  width: number;
}

export interface SpeakerMedia {
  photos: Record<string, string>;
  talkImages: Record<string, SpeakerTalkImage>;
}

export const speakerTalkKey = (speakerId: string, eventId: string) => `${speakerId}:${eventId}`;

export function buildSpeakerMedia(events: EventItem[]): SpeakerMedia {
  const media: SpeakerMedia = { photos: {}, talkImages: {} };

  for (const event of events) {
    for (const speakerId of event.speakers.flatMap((speaker) => speaker.speakerIds ?? [])) {
      const photo = speakerAssetUrl(getSpeakerRecord(speakerId)?.photo);
      const image = getSpeakerTalkRecord(speakerId, event.id)?.image;
      const imageUrl = speakerAssetUrl(image?.src);

      if (photo) {
        media.photos[speakerId] = photo;
      }

      if (image && imageUrl) {
        media.talkImages[speakerTalkKey(speakerId, event.id)] = {
          height: image.height,
          url: imageUrl,
          width: image.width,
        };
      }
    }
  }

  return media;
}
