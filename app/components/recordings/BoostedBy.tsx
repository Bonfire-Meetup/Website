"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { BoltIcon } from "@/components/shared/icons";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Link } from "@/i18n/navigation";
import { API_ROUTES } from "@/lib/api/routes";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { logError } from "@/lib/utils/log-client";
import { compressUuid } from "@/lib/utils/uuid-compress";

interface BoostedByProps {
  shortId: string;
}

interface BoostedUser {
  userId: string;
  name: string | null;
  emailHash: string;
}

interface BoostedByData {
  publicUsers: BoostedUser[];
  privateCount: number;
}

export function BoostedBy({ shortId }: BoostedByProps) {
  const t = useTranslations("recordings");
  const [boostedBy, setBoostedBy] = useState<BoostedByData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadBoostedBy = async () => {
      try {
        const response = await fetch(API_ROUTES.VIDEO.BOOSTS(shortId));

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          boostedBy?: BoostedByData;
        };

        if (isActive && data.boostedBy) {
          setBoostedBy(data.boostedBy);
        }
      } catch (error) {
        logError("boostedBy.load_failed", error, { shortId });
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadBoostedBy();

    return () => {
      isActive = false;
    };
  }, [shortId]);

  if (loading || !boostedBy) {
    return null;
  }

  const { publicUsers, privateCount } = boostedBy;
  const totalCount = publicUsers.length + privateCount;

  if (totalCount === 0) {
    return null;
  }

  const compressedUserIds = publicUsers.map((user) => compressUuid(user.userId));

  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-200/30 bg-neutral-50/30 px-3 py-2 dark:border-neutral-700/20 dark:bg-neutral-800/20">
      <div className="flex shrink-0 items-center gap-1.5">
        <BoltIcon
          className="h-3 w-3 text-emerald-600/70 dark:text-emerald-400/70"
          aria-hidden="true"
        />
        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
          {t("boostedBy")}
        </span>
      </div>
      <div className="flex flex-1 items-center gap-1.5">
        <div className="flex items-center gap-1.5">
          {publicUsers.slice(0, 5).map((user, index) => {
            const compressedId = compressedUserIds[index];
            if (!compressedId) {
              return null;
            }

            return (
              <Link
                key={user.userId}
                href={PAGE_ROUTES.USER(compressedId)}
                className="group relative transition-all hover:z-10 hover:scale-105"
                title={user.name || undefined}
              >
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded-full bg-emerald-200/30 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-emerald-500/20" />
                  <UserAvatar
                    emailHash={user.emailHash}
                    size={24}
                    name={user.name}
                    className="relative ring-1 ring-white/50 dark:ring-neutral-900/50"
                  />
                </div>
              </Link>
            );
          })}
        </div>
        {(publicUsers.length > 5 || privateCount > 0) && (
          <div className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
            {publicUsers.length > 5 && (
              <span className="text-neutral-400 dark:text-neutral-500">
                +{publicUsers.length - 5}
              </span>
            )}
            {privateCount > 0 && (
              <>
                {publicUsers.length > 0 && (
                  <span className="text-neutral-300 dark:text-neutral-600">•</span>
                )}
                <span className="text-neutral-400 dark:text-neutral-500">
                  {privateCount === 1
                    ? t("onePrivateBooster")
                    : t("multiplePrivateBoosters", { count: privateCount })}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
