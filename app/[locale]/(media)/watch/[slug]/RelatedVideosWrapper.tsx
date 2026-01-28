import type { RelatedRecording } from "@/components/recordings/RecordingPlayer";
import { Suspense } from "react";

import { RelatedVideosSection } from "@/components/recordings/RelatedVideosSection";

import { RelatedVideosSkeleton } from "./RelatedVideosSkeleton";

interface RelatedVideosWrapperProps {
  relatedRecordings: RelatedRecording[];
}

export function RelatedVideosWrapper({ relatedRecordings }: RelatedVideosWrapperProps) {
  return (
    <Suspense fallback={<RelatedVideosSkeleton />}>
      <RelatedVideosSection relatedRecordings={relatedRecordings} />
    </Suspense>
  );
}
