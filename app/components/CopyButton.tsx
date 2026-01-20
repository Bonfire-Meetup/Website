"use client";

import { useState } from "react";
import { Button } from "./Button";

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
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
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
