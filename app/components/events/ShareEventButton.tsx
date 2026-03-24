"use client";

import { useEffect, useState } from "react";

import { CheckIcon, LinkedInIcon, LinkIcon, ShareIcon, XIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import { WEBSITE_URLS } from "@/lib/config/constants";

interface ShareEventButtonProps {
  sectionTitle: string;
  title: string;
  copyLabel: string;
  copiedLabel: string;
  shareLabel: string;
  shareXLabel: string;
  shareLinkedInLabel: string;
  shareMessage: string;
  shareUrl: string;
}

export function ShareEventButton({
  sectionTitle,
  title,
  copyLabel,
  copiedLabel,
  shareLabel,
  shareXLabel,
  shareLinkedInLabel,
  shareMessage,
  shareUrl,
}: ShareEventButtonProps) {
  const [copied, setCopied] = useState(false);
  const [nativeShareSupported, setNativeShareSupported] = useState(false);

  useEffect(() => {
    setNativeShareSupported(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  const shareUrlX = `${WEBSITE_URLS.SHARE.X}?${new URLSearchParams({
    text: shareMessage,
    url: shareUrl,
  }).toString()}`;
  const shareUrlLinkedIn = `${WEBSITE_URLS.SHARE.LINKEDIN}?${new URLSearchParams({
    url: shareUrl,
  }).toString()}`;

  const handleClick = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!nativeShareSupported) {
      return;
    }

    try {
      await navigator.share({
        title,
        text: shareMessage,
        url: shareUrl,
      });
    } catch {
      // Share sheet dismissal is expected.
    }
  };

  return (
    <div className="glass rounded-3xl p-6">
      <p className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">{sectionTitle}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {nativeShareSupported && (
          <Button
            variant="primary"
            size="sm"
            className="w-full gap-2 sm:col-span-2"
            onClick={handleNativeShare}
          >
            <ShareIcon className="h-4 w-4" />
            {shareLabel}
          </Button>
        )}

        <Button
          variant={copied ? "primary" : "secondary"}
          size="sm"
          className="w-full gap-2 transition-all duration-300"
          onClick={handleClick}
        >
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4" />
              {copiedLabel}
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4" />
              {copyLabel}
            </>
          )}
        </Button>

        <Button
          href={shareUrlX}
          external
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          size="sm"
          className="w-full gap-2"
        >
          <XIcon className="h-4 w-4" />
          {shareXLabel}
        </Button>

        <Button
          href={shareUrlLinkedIn}
          external
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          size="sm"
          className="w-full gap-2 sm:col-span-2"
        >
          <LinkedInIcon className="h-4 w-4" />
          {shareLinkedInLabel}
        </Button>
      </div>
    </div>
  );
}
