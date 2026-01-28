import type { CatalogRecording } from "./RecordingsCatalogTypes";
import { Suspense } from "react";

import { PAGE_ROUTES } from "@/lib/routes/pages";

import { InfoIcon } from "../shared/icons";
import { TrendingRailSkeleton } from "../shared/Skeletons";
import { Button } from "../ui/Button";

import { FeaturedRecordingServer } from "./FeaturedRecordingServer";
import { RecordingRailServer } from "./RecordingRailServer";
import {
  HiddenGemsRailServer,
  HotPicksRailServer,
  MemberPicksRailServer,
} from "./TrendingRailsServer";

interface LibraryRow {
  key: string;
  title: string;
  items: CatalogRecording[];
}

interface LibraryRowsContentProps {
  recordings: CatalogRecording[];
  rows: LibraryRow[];
  locale: string;
  labels: {
    scrollLeft: string;
    scrollRight: string;
    previousFeatured: string;
    nextFeatured: string;
    browseAll: string;
    noteLabel: string;
    disclaimer: string;
    epShort: string;
  };
}

export function LibraryRowsContent({ recordings, rows, locale, labels }: LibraryRowsContentProps) {
  const featuredCandidates = recordings.slice(0, 5);
  const featured = featuredCandidates[0];

  if (recordings.length === 0) {
    return null;
  }

  return (
    <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-2 sm:mb-6" />

        {featured && (
          <>
            <FeaturedRecordingServer
              candidates={featuredCandidates}
              locale={locale}
              previousLabel={labels.previousFeatured}
              nextLabel={labels.nextFeatured}
            />
            <div className="section-divider mb-10" />
          </>
        )}

        <div className="min-h-[700px]">
          <div className="space-y-12">
            <div className="flex justify-center">
              <Button
                href={PAGE_ROUTES.LIBRARY_BROWSE}
                variant="primary"
                size="xs"
                className="from-brand-500 shadow-brand-500/20 rounded-full bg-gradient-to-r to-rose-500 text-white shadow-lg"
              >
                {labels.browseAll}
              </Button>
            </div>

            <Suspense fallback={<TrendingRailSkeleton />}>
              <MemberPicksRailServer
                scrollLeftLabel={labels.scrollLeft}
                scrollRightLabel={labels.scrollRight}
              />
            </Suspense>

            <Suspense fallback={<TrendingRailSkeleton />}>
              <HotPicksRailServer
                scrollLeftLabel={labels.scrollLeft}
                scrollRightLabel={labels.scrollRight}
              />
            </Suspense>

            <Suspense fallback={<TrendingRailSkeleton />}>
              <HiddenGemsRailServer
                scrollLeftLabel={labels.scrollLeft}
                scrollRightLabel={labels.scrollRight}
              />
            </Suspense>

            {rows.map((row) => (
              <RecordingRailServer
                key={row.key}
                title={row.title}
                recordings={row.items}
                locale={locale}
                epShortLabel={labels.epShort}
                scrollLeftLabel={labels.scrollLeft}
                scrollRightLabel={labels.scrollRight}
              />
            ))}

            <div className="flex justify-center">
              <Button
                href={PAGE_ROUTES.LIBRARY_BROWSE}
                variant="primary"
                size="xs"
                className="from-brand-500 shadow-brand-500/20 rounded-full bg-gradient-to-r to-rose-500 text-white shadow-lg"
              >
                {labels.browseAll}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-20 flex justify-center">
          <div className="glass-card no-hover-pop relative inline-flex items-center gap-4 px-6 py-4">
            <div className="bg-brand-500/10 text-brand-500 dark:bg-brand-500/20 dark:text-brand-400 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <InfoIcon className="h-5 w-5" />
            </div>
            <p className="max-w-4xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              <span className="mr-1.5 font-semibold text-neutral-900 dark:text-white">
                {labels.noteLabel}
              </span>
              {labels.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
