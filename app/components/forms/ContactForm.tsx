"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { type DropdownOption, SelectDropdown } from "@/components/ui/SelectDropdown";
import { API_ROUTES } from "@/lib/api/routes";
import { type ContactFormState, submitContactForm } from "@/lib/forms/form-actions";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { logError } from "@/lib/utils/log-client";

import { CheckIcon, CloseIcon, MailIcon } from "../shared/icons";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";

import { TurnstileWidget } from "./TurnstileWidget";

const initialState: ContactFormState = { success: false };

function getStoredDraft(): {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  inquiryType?: string;
} | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const draft = localStorage.getItem(STORAGE_KEYS.DRAFT_CONTACT_FORM);
    return draft ? JSON.parse(draft) : null;
  } catch {
    return null;
  }
}

export function ContactForm() {
  const t = useTranslations("contactPage.form");
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [csrfToken, setCsrfToken] = useState("");
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [inquiryType, setInquiryType] = useState("general");

  const inquiryOptions = useMemo<DropdownOption[]>(
    () => [
      { label: t("inquiryTypeGeneral"), value: "general" },
      { label: t("inquiryTypeFeature"), value: "feature" },
      { label: t("inquiryTypeSupport"), value: "support" },
      { label: t("inquiryTypePress"), value: "press" },
      { label: t("inquiryTypeCrew"), value: "crew" },
      { label: t("inquiryTypeConduct"), value: "coc" },
    ],
    [t],
  );

  useEffect(() => {
    const draft = getStoredDraft();
    const hasDraftInquiryType = draft?.inquiryType;

    if (draft) {
      if (draft.name) {
        setName(draft.name);
      }
      if (draft.email) {
        setEmail(draft.email);
      }
      if (draft.subject) {
        setSubject(draft.subject);
      }
      if (draft.message) {
        setMessage(draft.message);
      }
      if (
        hasDraftInquiryType &&
        inquiryOptions.some((option) => option.value === hasDraftInquiryType)
      ) {
        setInquiryType(hasDraftInquiryType);
      }
    }

    if (!hasDraftInquiryType) {
      const nextType = searchParams.get("type");
      if (nextType && inquiryOptions.some((option) => option.value === nextType)) {
        setInquiryType(nextType);
      }
    }

    setMounted(true);
  }, [inquiryOptions, searchParams]);

  const saveDraft = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (state.success) {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_CONTACT_FORM);
      return;
    }

    const draft = { email, inquiryType, message, name, subject };
    const hasContent = Object.values(draft).some((value) => value && value.trim().length > 0);

    if (!hasContent) {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_CONTACT_FORM);
      return;
    }

    try {
      const existingDraft = localStorage.getItem(STORAGE_KEYS.DRAFT_CONTACT_FORM);
      if (existingDraft) {
        const parsed = JSON.parse(existingDraft);
        const isUnchanged =
          parsed.name === draft.name &&
          parsed.email === draft.email &&
          parsed.subject === draft.subject &&
          parsed.message === draft.message &&
          parsed.inquiryType === draft.inquiryType;
        if (isUnchanged) {
          return;
        }
      }
    } catch (error) {
      logError("contactForm.draft_parse_failed", error);
    }

    localStorage.setItem(STORAGE_KEYS.DRAFT_CONTACT_FORM, JSON.stringify(draft));
  }, [name, email, subject, message, inquiryType, state.success]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const timeoutId = setTimeout(saveDraft, 1500);
    return () => clearTimeout(timeoutId);
  }, [name, email, subject, message, inquiryType, state.success, saveDraft]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.addEventListener("beforeunload", saveDraft);
    return () => window.removeEventListener("beforeunload", saveDraft);
  }, [saveDraft]);

  useEffect(() => {
    let isActive = true;
    fetch(API_ROUTES.CSRF)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (isActive && data?.token) {
          setCsrfToken(data.token);
        }
      })
      .catch(() => {
        if (isActive) {
          setCsrfToken("");
        }
      });
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (state.message === "captchaFailed") {
      setTurnstileResetKey((prev) => prev + 1);
    }
  }, [state.message]);

  const clearDraft = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setInquiryType("general");
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_CONTACT_FORM);
    }
  };

  const hasName = Boolean(name);
  const hasEmail = Boolean(email);
  const hasSubject = Boolean(subject);
  const hasMessage = Boolean(message);
  const isNotDefaultInquiryType = inquiryType !== "general";
  const hasDraft = hasName || hasEmail || hasSubject || hasMessage || isNotDefaultInquiryType;

  if (state.success) {
    return (
      <div className="glass-card no-hover-pop mx-auto max-w-2xl p-8 text-center sm:p-12">
        <div className="form-success-icon">
          <CheckIcon className="h-8 w-8 text-white" />
        </div>
        <h2 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-white">
          {t("successTitle")}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">{t("successMessage")}</p>
        <div className="mt-6 flex justify-center">
          <Button type="button" variant="plain" onClick={() => window.location.reload()}>
            {t("sendAnother")}
          </Button>
        </div>
      </div>
    );
  }

  const getFieldError = (field: string) => {
    const errorKey = state.errors?.[field];
    if (!errorKey) {
      return null;
    }
    return t(`errors.${errorKey}`) || errorKey;
  };

  const inputBaseClass = "form-input-base";
  const inputNormalClass = "form-input";
  const inputErrorClass = "form-input-error";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="glass-card no-hover-pop mx-auto max-w-2xl p-6 sm:p-10"
    >
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="form-header-icon">
            <MailIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{t("title")}</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("subtitle")}</p>
          </div>
        </div>
        {hasDraft && (
          <Button
            type="button"
            variant="plain"
            size="sm"
            onClick={clearDraft}
            className="form-clear-button"
          >
            <CloseIcon className="h-3.5 w-3.5" />
            {t("clearDraft")}
          </Button>
        )}
      </div>

      {hasDraft && <div className="form-draft-note">{t("draftNote")}</div>}

      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="form-label">
              {t("name")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="contact-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              autoComplete="name"
              className={`${inputBaseClass} ${state.errors?.name ? inputErrorClass : inputNormalClass}`}
              placeholder={t("namePlaceholder")}
            />
            {state.errors?.name && <p className="form-error-text">{getFieldError("name")}</p>}
          </div>

          <div>
            <label htmlFor="contact-email" className="form-label">
              {t("email")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              id="contact-email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={`${inputBaseClass} ${state.errors?.email ? inputErrorClass : inputNormalClass}`}
              placeholder={t("emailPlaceholder")}
            />
            {state.errors?.email && <p className="form-error-text">{getFieldError("email")}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="contact-inquiry" className="form-label">
            {t("inquiryType")}
          </label>
          {mounted ? (
            <SelectDropdown
              id="contact-inquiry"
              name="inquiryType"
              value={inquiryType}
              options={inquiryOptions}
              onChange={setInquiryType}
              nativeOnMobile
              buttonClassName={`${inputBaseClass} ${inputNormalClass}`}
              nativeClassName={`${inputBaseClass} ${inputNormalClass}`}
              activeOptionClassName="bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300"
            />
          ) : (
            <div className={`${inputBaseClass} ${inputNormalClass} flex items-center`}>
              {inquiryOptions.find((o) => o.value === "general")?.label}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="contact-subject" className="form-label">
            {t("subject")} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="contact-subject"
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            minLength={3}
            className={`${inputBaseClass} ${state.errors?.subject ? inputErrorClass : inputNormalClass}`}
            placeholder={t("subjectPlaceholder")}
          />
          {state.errors?.subject && <p className="form-error-text">{getFieldError("subject")}</p>}
        </div>

        <div>
          <label htmlFor="contact-message" className="form-label">
            {t("message")} <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
            minLength={10}
            className={`${inputBaseClass} resize-none ${state.errors?.message ? inputErrorClass : inputNormalClass}`}
            placeholder={t("messagePlaceholder")}
          />
          {state.errors?.message && <p className="form-error-text">{getFieldError("message")}</p>}
        </div>

        <input
          type="text"
          name="website"
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />
        <input type="hidden" name="csrfToken" value={csrfToken} />

        {state.message && (
          <div className="form-error-alert">{t(`errors.${state.message}`) || state.message}</div>
        )}

        <TurnstileWidget
          className="flex justify-center"
          resetKey={state.message === "captchaFailed" ? turnstileResetKey : undefined}
        />

        <Button type="submit" variant="glass" disabled={isPending || !csrfToken} className="w-full">
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size="md" />
              {t("submitting")}
            </span>
          ) : (
            t("submit")
          )}
        </Button>
      </div>
    </form>
  );
}
