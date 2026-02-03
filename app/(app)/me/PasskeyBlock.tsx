"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { CheckIcon, CloseIcon, KeyIcon, PlusIcon, TrashIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  invalidatePasskeysQuery,
  useDeletePasskeyMutation,
  usePasskeys,
} from "@/lib/api/user-profile";
import { readAccessToken } from "@/lib/auth/client";
import {
  isPlatformAuthenticatorAvailable,
  isWebAuthnSupported,
  registerPasskey,
} from "@/lib/auth/webauthn-client";
import { formatShortDateUTC } from "@/lib/utils/locale";

export function PasskeyBlock() {
  const t = useTranslations("account.passkeys");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const passkeysQuery = usePasskeys();
  const deletePasskeyMutation = useDeletePasskeyMutation();

  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [webAuthnSupported, setWebAuthnSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWebAuthnSupported(isWebAuthnSupported());
    }
  }, []);

  const handleRegister = async () => {
    setIsRegistering(true);
    setRegisterError(null);

    const available = await isPlatformAuthenticatorAvailable();
    if (!available) {
      setRegisterError(t("errorNotAvailable"));
      setIsRegistering(false);
      return;
    }

    const accessToken = readAccessToken();
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
    } finally {
      setDeletingId(null);
    }
  };

  const passkeys = passkeysQuery.data?.items ?? [];
  const loading = passkeysQuery.isLoading;
  const error = passkeysQuery.isError ? t("errorLoading") : null;

  if (webAuthnSupported === false) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-white/5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
          <KeyIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          {t("title")}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRegister}
          disabled={isRegistering || loading}
          className="h-8 gap-1.5 px-2.5 text-xs"
        >
          {isRegistering ? <LoadingSpinner size="sm" /> : <PlusIcon className="h-3.5 w-3.5" />}
          {t("addButton")}
        </Button>
      </div>

      <div className="p-4">
        {registerError && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {registerError}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`passkey-skeleton-${index}`}
                className="flex animate-pulse items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5 dark:bg-white/5"
              >
                <div className="space-y-1.5">
                  <div className="h-3 w-32 rounded bg-neutral-200/70 dark:bg-white/10" />
                  <div className="h-2.5 w-24 rounded bg-neutral-200/50 dark:bg-white/5" />
                </div>
                <div className="h-6 w-6 rounded bg-neutral-200/50 dark:bg-white/5" />
              </div>
            ))}
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
              <div
                key={passkey.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2.5 dark:bg-white/5"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
