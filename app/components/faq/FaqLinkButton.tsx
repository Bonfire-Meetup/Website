import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowRightIcon, InfoIcon } from "@/components/shared/Icons";

interface FaqLinkButtonProps {
  children: ReactNode;
  href: string;
}

export function FaqLinkButton({ children, href }: FaqLinkButtonProps) {
  return (
    <Link
      href={href}
      className="btn-outline mt-2 gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm"
    >
      <span className="inline-flex items-center justify-center rounded-full bg-sky-500/14 p-1 text-sky-700 dark:bg-sky-400/18 dark:text-sky-300">
        <InfoIcon className="h-3 w-3" aria-hidden="true" />
      </span>
      <span className="inline-flex items-center gap-1.5">{children}</span>
      <ArrowRightIcon className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
    </Link>
  );
}
