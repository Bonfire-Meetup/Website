"use client";

import { useState } from "react";
import { Button } from "./Button";
import { copyToClipboard } from "../../lib/utils/clipboard";

type CopyButtonProps = {
  text: string;
  label: string;
  copiedLabel: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "glass" | "plain" | "glass-secondary";
  size?: "xs" | "sm" | "md" | "lg";
  ariaLabel?: string;
};

export function CopyButton({
  text,
  label,
  copiedLabel,
  className = "",
  variant = "secondary",
  size = "sm",
  ariaLabel,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      className={className}
      ariaLabel={ariaLabel}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}
