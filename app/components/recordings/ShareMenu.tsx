"use client";

import { useState } from "react";
import { CheckIcon, FacebookIcon, LinkIcon, LinkedInIcon, ShareIcon, XIcon } from "../shared/icons";
import { copyToClipboard } from "../../lib/utils/clipboard";

type ShareMenuLabels = {
  share: string;
  copyLink: string;
  copied: string;
};

type ShareMenuProps = {
  shareUrl: string;
  shareText: string;
  labels: ShareMenuLabels;
};

export function ShareMenu({ shareUrl, shareText, labels }: ShareMenuProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const shareLinks = {
    x: `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText.split(" - ")[0],
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setShowShareMenu(true);
        }
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const handleCopyLink = async () => {
    await copyToClipboard(shareUrl);
    setCopied(true);
    setShowCopyToast(true);
    setTimeout(() => {
      setCopied(false);
      setShowShareMenu(false);
    }, 1500);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 transition-all cursor-pointer hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
        >
          <ShareIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{labels.share}</span>
        </button>
        {showShareMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
            <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                {copied ? labels.copied : labels.copyLink}
              </button>
              <div className="my-1 h-px bg-neutral-200 dark:bg-white/10" />
              <a
                href={shareLinks.x}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowShareMenu(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
              >
                <XIcon className="h-4 w-4" />X
              </a>
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowShareMenu(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
              >
                <FacebookIcon className="h-4 w-4" />
                Facebook
              </a>
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowShareMenu(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
              >
                <LinkedInIcon className="h-4 w-4" />
                LinkedIn
              </a>
            </div>
          </>
        )}
      </div>
      {showCopyToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-neutral-900/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-black/30 backdrop-blur"
        >
          {labels.copied}
        </div>
      )}
    </>
  );
}
