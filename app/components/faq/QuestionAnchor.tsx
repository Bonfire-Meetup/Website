"use client";

import { useState } from "react";

import { CheckIcon, LinkIcon } from "@/components/shared/Icons";
import { copyToClipboard } from "@/lib/utils/clipboard";

interface QuestionAnchorProps {
  id: string;
}

export function QuestionAnchor({ id }: QuestionAnchorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = new URL(window.location.href);
    url.hash = id;

    await copyToClipboard(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`ml-2 inline-flex items-center justify-center transition-all duration-300 ${
        copied
          ? "scale-110 text-emerald-500"
          : "text-neutral-300 opacity-0 group-hover:opacity-100 hover:text-emerald-500"
      }`}
      title="Copy link to this question"
      aria-label="Copy link to this question"
    >
      {copied ? <CheckIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
    </button>
  );
}
