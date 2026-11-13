import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowRightIcon, DocumentTextIcon } from "@/components/shared/Icons";

interface GuideLinkButtonProps {
  children: ReactNode;
  href: string;
}

export function GuideLinkButton({ children, href }: GuideLinkButtonProps) {
  return (
    <Link
      href={href}
      className="btn-outline mt-2 gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm"
    >
      <span className="bg-brand-500/12 text-brand-700 dark:bg-brand-400/18 dark:text-brand-300 inline-flex items-center justify-center rounded-full p-1">
        <DocumentTextIcon className="h-3 w-3" aria-hidden="true" />
      </span>
      <span className="inline-flex items-center gap-1.5">{children}</span>
      <ArrowRightIcon className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
    </Link>
  );
}
