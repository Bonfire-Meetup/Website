import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowRightIcon, ShieldIcon } from "@/components/shared/Icons";

interface LegalLinkButtonProps {
  children: ReactNode;
  href: string;
}

export function LegalLinkButton({ children, href }: LegalLinkButtonProps) {
  return (
    <Link
      href={href}
      className="mt-2 inline-flex items-center gap-2 rounded-full border border-neutral-300/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-white sm:text-sm dark:border-white/15 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-white/25 dark:hover:bg-white/10"
    >
      <span className="inline-flex items-center justify-center rounded-full bg-amber-500/14 p-1 text-amber-700 dark:bg-amber-400/18 dark:text-amber-300">
        <ShieldIcon className="h-3 w-3" aria-hidden="true" />
      </span>
      <span className="inline-flex items-center gap-1.5">{children}</span>
      <ArrowRightIcon className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
    </Link>
  );
}
