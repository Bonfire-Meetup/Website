"use client";

import { ShareMenu } from "@/components/recordings/ShareMenu";

export function AlbumShareButton({ shareUrl, shareText }: { shareUrl: string; shareText: string }) {
  return <ShareMenu shareUrl={shareUrl} shareText={shareText} />;
}
