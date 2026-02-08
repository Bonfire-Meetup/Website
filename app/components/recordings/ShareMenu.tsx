"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

import { copyToClipboard } from "@/lib/utils/clipboard";

import { CheckIcon, FacebookIcon, LinkIcon, LinkedInIcon, ShareIcon, XIcon } from "../shared/Icons";

interface ShareMenuProps {
  shareUrl: string;
  shareText: string;
  buttonClassName?: string;
  iconClassName?: string;
  showLabel?: boolean;
}

export function ShareMenu({
  shareUrl,
  shareText,
  buttonClassName = "",
  iconClassName = "h-3.5 w-3.5",
  showLabel = true,
}: ShareMenuProps) {
  const t = useTranslations("recordings");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const firstItemRef = useRef<HTMLButtonElement | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const timeoutId of timeoutsRef.current) {
        window.clearTimeout(timeoutId);
      }
      timeoutsRef.current = [];
    },
    [],
  );

  useEffect(() => {
    if (!showShareMenu) {
      return;
    }

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      setShowShareMenu(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("keydown", keyHandler);
    firstItemRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", keyHandler);
    };
  }, [showShareMenu]);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    x: `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
          title: shareText.split(" - ")[0],
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
    timeoutsRef.current.push(
      window.setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
        triggerRef.current?.focus();
      }, 1500),
    );
    timeoutsRef.current.push(window.setTimeout(() => setShowCopyToast(false), 2000));
  };

  const closeShareMenu = () => {
    setShowShareMenu(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleShare}
          aria-controls={showShareMenu ? menuId : undefined}
          aria-expanded={showShareMenu}
          aria-haspopup="menu"
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs leading-none font-medium text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900 sm:leading-tight dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white ${buttonClassName}`}
        >
          <ShareIcon className={iconClassName} />
          {showLabel ? (
            <span className="hidden sm:inline sm:translate-y-[1px]">{t("share")}</span>
          ) : null}
        </button>
        {showShareMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeShareMenu} />
            <div
              id={menuId}
              role="menu"
              className="absolute top-full right-0 z-50 mt-1 w-48 overflow-hidden rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
            >
              <button
                ref={firstItemRef}
                type="button"
                role="menuitem"
                onClick={handleCopyLink}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                {copied ? t("copied") : t("copyLink")}
              </button>
              <div className="my-1 h-px bg-neutral-200 dark:bg-white/10" />
              <a
                href={shareLinks.x}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={closeShareMenu}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
              >
                <XIcon className="h-4 w-4" />X
              </a>
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={closeShareMenu}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
              >
                <FacebookIcon className="h-4 w-4" />
                Facebook
              </a>
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={closeShareMenu}
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
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-neutral-900/90 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-white uppercase shadow-lg shadow-black/30 backdrop-blur"
        >
          {t("copied")}
        </div>
      )}
    </>
  );
}
