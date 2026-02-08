"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
  useVideoWatchlistStatus,
} from "@/lib/api/user-profile";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { addToWatchlist, removeFromWatchlist } from "@/lib/redux/slices/profileSlice";
import { LOGIN_REASON, PAGE_ROUTES } from "@/lib/routes/pages";
import { logError } from "@/lib/utils/log-client";

import { BookmarkIcon, BookmarkFilledIcon } from "../shared/Icons";
import { Button } from "../ui/Button";

interface WatchLaterButtonProps {
  shortId: string;
  variant?: "icon" | "full";
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function WatchLaterButton({
  shortId,
  variant = "full",
  size = "md",
  showLabel = true,
}: WatchLaterButtonProps) {
  const t = useTranslations("recordings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const watchlistFromRedux = useAppSelector((state) => state.profile.watchlist);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
  const isResolvingAuth = mounted && auth.loading && !auth.hydrated;
  const isAuthed = mounted && auth.isAuthenticated && auth.hydrated;
  const isLoading = addMutation.isPending || removeMutation.isPending;

  const handleClick = async () => {
    if (isResolvingAuth) {
      return;
    }

    if (!isAuthed) {
      const query = searchParams.toString();
      const returnPath = `${pathname}${query ? `?${query}` : ""}`;
      router.push(PAGE_ROUTES.LOGIN_WITH_REASON_AND_RETURN(LOGIN_REASON.WATCH_LATER, returnPath));
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
    const isIconOnly = !showLabel;
    const layoutClasses = isIconOnly
      ? "h-8 w-8 rounded-full p-0 justify-center"
      : "rounded-lg px-3 py-1.5";
    const gapClasses = isIconOnly ? "gap-0" : "gap-1.5";
    const iconOnlyColors = inWatchlist
      ? "bg-violet-600/80 text-white hover:bg-violet-600 dark:bg-violet-500/80 dark:hover:bg-violet-500"
      : "bg-black/40 text-white hover:bg-black/55 dark:bg-white/20 dark:text-white dark:hover:bg-white/30";
    const iconLabelColors = inWatchlist
      ? "bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:hover:bg-violet-950/50"
      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white";

    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading || isResolvingAuth}
        className={`inline-flex items-center text-xs leading-none font-medium transition-all sm:leading-tight ${layoutClasses} ${gapClasses} ${
          isIconOnly ? iconOnlyColors : iconLabelColors
        } ${isLoading || isResolvingAuth ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        aria-label={inWatchlist ? t("removeFromWatchLater") : t("addToWatchLater")}
      >
        {inWatchlist ? (
          <BookmarkFilledIcon className="h-3.5 w-3.5" />
        ) : (
          <BookmarkIcon className="h-3.5 w-3.5" />
        )}
        {showLabel ? (
          <span className="hidden sm:inline sm:translate-y-[1px]">
            {inWatchlist ? t("inWatchlist") : t("watchLater")}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || isResolvingAuth}
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
