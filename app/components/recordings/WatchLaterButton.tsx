"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
  useVideoWatchlistStatus,
} from "@/lib/api/user-profile";
import { getHasValidToken } from "@/lib/auth/client";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { addToWatchlist, removeFromWatchlist } from "@/lib/redux/slices/profileSlice";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { logError } from "@/lib/utils/log-client";

import { BookmarkIcon, BookmarkFilledIcon } from "../shared/Icons";
import { Button } from "../ui/Button";

interface WatchLaterButtonProps {
  shortId: string;
  variant?: "icon" | "full";
  size?: "sm" | "md";
}

export function WatchLaterButton({
  shortId,
  variant = "full",
  size = "md",
}: WatchLaterButtonProps) {
  const t = useTranslations("recordings");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const watchlistFromRedux = useAppSelector((state) => state.profile.watchlist);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(getHasValidToken());
  }, []);

  const { data: watchlistStatus } = useVideoWatchlistStatus(shortId);
  const addMutation = useAddToWatchlistMutation();
  const removeMutation = useRemoveFromWatchlistMutation();

  useEffect(() => {
    if (watchlistStatus?.inWatchlist && !watchlistFromRedux.includes(shortId)) {
      dispatch(addToWatchlist(shortId));
    } else if (watchlistStatus?.inWatchlist === false && watchlistFromRedux.includes(shortId)) {
      dispatch(removeFromWatchlist(shortId));
    }
  }, [watchlistStatus, shortId, watchlistFromRedux, dispatch]);

  const inWatchlist = watchlistFromRedux.includes(shortId);
  const isLoading = addMutation.isPending || removeMutation.isPending;

  const handleClick = async () => {
    if (!hasToken) {
      router.push(PAGE_ROUTES.LOGIN);
      return;
    }

    try {
      if (inWatchlist) {
        dispatch(removeFromWatchlist(shortId));
        await removeMutation.mutateAsync(shortId);
      } else {
        dispatch(addToWatchlist(shortId));
        await addMutation.mutateAsync(shortId);
      }
    } catch (error) {
      if (inWatchlist) {
        dispatch(addToWatchlist(shortId));
      } else {
        dispatch(removeFromWatchlist(shortId));
      }
      logError("watchlist_update_failed", error, { shortId, wasInWatchlist: inWatchlist });
    }
  };

  const buttonSize = size === "sm" ? "h-10 text-sm" : "h-11 text-base";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs leading-none font-medium transition-all sm:leading-tight ${
          inWatchlist
            ? "bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:hover:bg-violet-950/50"
            : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
        } ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        aria-label={inWatchlist ? t("removeFromWatchLater") : t("addToWatchLater")}
      >
        {inWatchlist ? (
          <BookmarkFilledIcon className="h-3.5 w-3.5" />
        ) : (
          <BookmarkIcon className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline sm:translate-y-[1px]">
          {inWatchlist ? t("inWatchlist") : t("watchLater")}
        </span>
      </button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={`${buttonSize} ${inWatchlist ? "bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600" : "bg-neutral-800 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600"} gap-2 text-white transition-colors`}
    >
      {inWatchlist ? (
        <>
          <BookmarkFilledIcon className={iconSize} />
          <span>{t("inWatchlist")}</span>
        </>
      ) : (
        <>
          <BookmarkIcon className={iconSize} />
          <span>{t("watchLater")}</span>
        </>
      )}
    </Button>
  );
}
