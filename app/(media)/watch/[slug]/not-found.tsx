import Link from "next/link";

import { ArrowRightIcon, PlayIcon } from "@/components/shared/Icons";
import { BackLink } from "@/components/ui/BackLink";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export default function WatchNotFound() {
  return (
    <div className="gradient-bg flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <PlayIcon className="text-brand-500 h-24 w-24 opacity-20" />
            <span className="text-brand-500 absolute inset-0 flex items-center justify-center text-4xl font-black">
              ?
            </span>
          </div>
        </div>

        <h1 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
          Recording not found
        </h1>
        <p className="mb-8 max-w-md text-lg text-neutral-600 dark:text-neutral-400">
          This recording doesn&apos;t exist or may have been removed from our library.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <BackLink href={PAGE_ROUTES.HOME} className="px-8 py-3">
            Back to Home
          </BackLink>
          <Link
            href={PAGE_ROUTES.LIBRARY}
            className="btn-outline gap-2 rounded-full px-8 py-3 text-sm"
          >
            Browse Library
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
