"use client";

import { ShareMenu } from "@/components/recordings/ShareMenu";

interface ProfileShareButtonProps {
  shareUrl: string;
  shareText: string;
}

export function ProfileShareButton({ shareUrl, shareText }: ProfileShareButtonProps) {
  return <ShareMenu shareUrl={shareUrl} shareText={shareText} />;
}
