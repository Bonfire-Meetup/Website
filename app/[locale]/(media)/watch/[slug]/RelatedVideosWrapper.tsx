import type { RelatedRecording } from "@/components/recordings/RecordingPlayer";

import { RelatedVideosSection } from "@/components/recordings/RelatedVideosSection";

interface RelatedVideosWrapperProps {
  relatedRecordings: RelatedRecording[];
}

export function RelatedVideosWrapper({ relatedRecordings }: RelatedVideosWrapperProps) {
  return <RelatedVideosSection relatedRecordings={relatedRecordings} />;
}
