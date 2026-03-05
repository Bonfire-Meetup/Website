import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowLeftIcon } from "@/components/shared/Icons";

interface BackLinkProps {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  href: string;
  prefetch?: boolean;
}

const BASE_BACK_LINK_CLASS =
  "inline-flex items-center gap-2 rounded-full border border-neutral-300/90 bg-white/70 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-white hover:text-neutral-900 dark:border-white/15 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white";

export function BackLink({ ariaLabel, children, className, href, prefetch }: BackLinkProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      aria-label={ariaLabel}
      className={`${BASE_BACK_LINK_CLASS} ${className ?? ""}`}
    >
      <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
      {children}
    </Link>
  );
}
