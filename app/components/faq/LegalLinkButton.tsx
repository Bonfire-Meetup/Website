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
      className="btn-outline mt-2 gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm"
    >
      <span className="inline-flex items-center justify-center rounded-full bg-amber-500/14 p-1 text-amber-700 dark:bg-amber-400/18 dark:text-amber-300">
        <ShieldIcon className="h-3 w-3" aria-hidden="true" />
      </span>
      <span className="inline-flex items-center gap-1.5">{children}</span>
      <ArrowRightIcon className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
    </Link>
  );
}
