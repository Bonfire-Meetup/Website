"use client";

import { useEffect, useMemo, useState } from "react";

import { CheckIcon, LinkedInIcon, LinkIcon, ShareIcon, XIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";

interface ShareEventButtonProps {
  sectionTitle: string;
  title: string;
  copyLabel: string;
  copiedLabel: string;
  shareLabel: string;
  shareXLabel: string;
  shareLinkedInLabel: string;
  shareMessage: string;
  shortPath?: string;
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
  shortPath,
}: ShareEventButtonProps) {
  const [copied, setCopied] = useState(false);
  const [nativeShareSupported, setNativeShareSupported] = useState(false);
  const [eventUrl, setEventUrl] = useState("");

  useEffect(() => {
    setNativeShareSupported(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
    if (typeof window !== "undefined") {
      setEventUrl(shortPath ? `${window.location.origin}${shortPath}` : window.location.href);
    }
  }, [shortPath]);

  const shareUrlX = useMemo(() => {
    if (!eventUrl) {
      return "";
    }
    const params = new URLSearchParams({
      text: shareMessage,
      url: eventUrl,
    });
    return `https://x.com/intent/tweet?${params.toString()}`;
  }, [eventUrl, shareMessage]);

  const shareUrlLinkedIn = useMemo(() => {
    if (!eventUrl) {
      return "";
    }
    const params = new URLSearchParams({
      url: eventUrl,
    });
    return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
  }, [eventUrl]);

  const handleClick = () => {
    if (!eventUrl) {
      return;
    }

    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!nativeShareSupported || !eventUrl) {
      return;
    }

    try {
      await navigator.share({
        title,
        text: shareMessage,
        url: eventUrl,
      });
    } catch {
      // Ignore dismiss/share cancellation.
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
          href={shareUrlX || undefined}
          external
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          size="sm"
          disabled={!eventUrl}
          className="w-full gap-2"
        >
          <XIcon className="h-4 w-4" />
          {shareXLabel}
        </Button>

        <Button
          href={shareUrlLinkedIn || undefined}
          external
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          size="sm"
          disabled={!eventUrl}
          className="w-full gap-2 sm:col-span-2"
        >
          <LinkedInIcon className="h-4 w-4" />
          {shareLinkedInLabel}
        </Button>
      </div>
    </div>
  );
}
