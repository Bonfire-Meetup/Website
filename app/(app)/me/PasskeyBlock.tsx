"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { CheckIcon, CloseIcon, KeyIcon, PlusIcon, TrashIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  invalidatePasskeysQuery,
  useDeletePasskeyMutation,
  usePasskeys,
} from "@/lib/api/user-profile";
import {
  isPlatformAuthenticatorAvailable,
  isWebAuthnSupported,
  registerPasskey,
} from "@/lib/auth/webauthn-client";
import { useAuthStatus } from "@/lib/redux/hooks";
import { formatShortDateUTC } from "@/lib/utils/locale";

import { AccountPanel, AccountPanelRow } from "./AccountPanel";

export function PasskeyBlock() {
  const t = useTranslations("account.passkeys");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const passkeysQuery = usePasskeys();
  const deletePasskeyMutation = useDeletePasskeyMutation();
  const authStatus = useAuthStatus();

  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [webAuthnSupported] = useState<boolean | null>(() => {
    if (typeof window !== "undefined") {
      return isWebAuthnSupported();
    }
    return null;
  });

  const handleRegister = async () => {
    setIsRegistering(true);
    setRegisterError(null);

    const available = await isPlatformAuthenticatorAvailable();
    if (!available) {
      setRegisterError(t("errorNotAvailable"));
      setIsRegistering(false);
      return;
    }

    const accessToken = authStatus.token;
    if (!accessToken) {
      setRegisterError(t("errorUnauthorized"));
      setIsRegistering(false);
      return;
    }

    const result = await registerPasskey(accessToken);

    if (!result.ok) {
      if (result.error !== "cancelled") {
        setRegisterError(result.error ?? t("errorRegistration"));
      }
      setIsRegistering(false);
      return;
    }

    await invalidatePasskeysQuery(queryClient);
    setIsRegistering(false);
  };

  const handleDelete = async (passkeyId: string) => {
    setDeletingId(passkeyId);
    setConfirmingId(null);
    try {
      await deletePasskeyMutation.mutateAsync(passkeyId);
    } catch {
      // Errors handled by mutation state
    }
    setDeletingId(null);
  };

  const passkeys = passkeysQuery.data?.items ?? [];
  const loading = passkeysQuery.isLoading;
  const error = passkeysQuery.isError ? t("errorLoading") : null;

  if (webAuthnSupported === false) {
    return null;
  }

  return (
    <AccountPanel
      title={
        <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
          <KeyIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          {t("title")}
        </h3>
      }
      action={
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRegister}
          disabled={isRegistering || loading}
          className="h-8 gap-1.5 border border-neutral-200/80 bg-white/90 px-2.5 text-xs text-neutral-700 shadow-sm shadow-neutral-200/50 hover:-translate-y-px hover:border-neutral-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 dark:shadow-none dark:hover:border-white/20 dark:hover:bg-white/8"
        >
          {isRegistering ? <LoadingSpinner size="sm" /> : <PlusIcon className="h-3.5 w-3.5" />}
          {t("addButton")}
        </Button>
      }
    >
      {registerError && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {registerError}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }, (_, skeletonIndex) => `passkey-skeleton-${skeletonIndex}`).map(
            (skeletonId) => (
              <AccountPanelRow key={skeletonId} className="animate-pulse">
                <div className="space-y-1.5">
                  <div className="h-3 w-32 rounded bg-neutral-200/70 dark:bg-white/10" />
                  <div className="h-2.5 w-24 rounded bg-neutral-200/50 dark:bg-white/5" />
                </div>
                <div className="h-6 w-6 rounded bg-neutral-200/50 dark:bg-white/5" />
              </AccountPanelRow>
            ),
          )}
        </div>
      ) : error ? (
        <div className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {error}
        </div>
      ) : passkeys.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("empty")}</p>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{t("emptyHint")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {passkeys.map((passkey) => (
            <AccountPanelRow
              key={passkey.id}
              className="hover:-translate-y-px hover:border-neutral-300/80 hover:shadow-neutral-200/50 dark:hover:border-white/12"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {passkey.name ?? t("defaultName")}
                  </span>
                  {passkey.backedUp && (
                    <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      {t("synced")}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {(() => {
                    const createdAtFormatted = passkey.createdAt
                      ? formatShortDateUTC(passkey.createdAt, locale)
                      : "";
                    const lastUsedAtFormatted = passkey.lastUsedAt
                      ? formatShortDateUTC(passkey.lastUsedAt, locale)
                      : "";
                    const parts: string[] = [];
                    if (createdAtFormatted) {
                      parts.push(t("createdAt", { date: createdAtFormatted }));
                    }
                    if (lastUsedAtFormatted) {
                      parts.push(t("lastUsed", { date: lastUsedAtFormatted }));
                    }
                    return parts.length > 0 ? parts.join(" · ") : null;
                  })()}
                </div>
              </div>
              {confirmingId === passkey.id ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(passkey.id)}
                    disabled={deletingId === passkey.id}
                    className="shrink-0 cursor-pointer rounded-lg p-1.5 text-emerald-500 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                    title={t("deleteButton")}
                  >
                    {deletingId === passkey.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <CheckIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    disabled={deletingId === passkey.id}
                    className="shrink-0 cursor-pointer rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                    title={t("cancelButton")}
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingId(passkey.id)}
                  disabled={deletingId === passkey.id}
                  className="shrink-0 cursor-pointer rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-rose-500 disabled:opacity-50 dark:hover:bg-white/5 dark:hover:text-rose-400"
                  title={t("deleteButton")}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </AccountPanelRow>
          ))}
        </div>
      )}
    </AccountPanel>
  );
}
