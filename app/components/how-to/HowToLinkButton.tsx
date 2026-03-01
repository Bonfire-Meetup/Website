import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowRightIcon, DocumentTextIcon } from "@/components/shared/Icons";

interface HowToLinkButtonProps {
  children: ReactNode;
  href: string;
}

export function HowToLinkButton({ children, href }: HowToLinkButtonProps) {
  return (
    <Link
      href={href}
      className="mt-2 inline-flex items-center gap-2 rounded-full border border-neutral-300/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-white sm:text-sm dark:border-white/15 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-white/25 dark:hover:bg-white/10"
    >
      <span className="bg-brand-500/12 text-brand-700 dark:bg-brand-400/18 dark:text-brand-300 inline-flex items-center justify-center rounded-full p-1">
        <DocumentTextIcon className="h-3 w-3" aria-hidden="true" />
      </span>
      <span className="inline-flex items-center gap-1.5">{children}</span>
      <ArrowRightIcon className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
    </Link>
  );
}
