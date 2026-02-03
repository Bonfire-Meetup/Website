"use client";

import { useState } from "react";

import { CheckIcon, LinkIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";

interface ShareEventButtonProps {
  sectionTitle: string;
  copyLabel: string;
  copiedLabel: string;
}

export function ShareEventButton({ sectionTitle, copyLabel, copiedLabel }: ShareEventButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-3xl p-6">
      <p className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">{sectionTitle}</p>
      <div className="flex gap-2">
        <Button
          variant={copied ? "primary" : "secondary"}
          size="sm"
          className="flex-1 gap-2 transition-all duration-300"
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
      </div>
    </div>
  );
}
