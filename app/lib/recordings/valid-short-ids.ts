import pragueRecordingsData from "@/data/prague-recordings.json";
import zlinRecordingsData from "@/data/zlin-recordings.json";

const VALID_SHORT_IDS = new Set<string>([
  ...pragueRecordingsData.recordings.map((r: { shortId: string }) => r.shortId),
  ...zlinRecordingsData.recordings.map((r: { shortId: string }) => r.shortId),
]);

export function isValidRecordingShortId(shortId: string): boolean {
  return VALID_SHORT_IDS.has(shortId);
}
