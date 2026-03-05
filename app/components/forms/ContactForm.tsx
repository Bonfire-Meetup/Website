"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { type DropdownOption, SelectDropdown } from "@/components/ui/SelectDropdown";
import { useCsrfToken } from "@/lib/api/csrf";
import { type ContactFormState, submitContactForm } from "@/lib/forms/form-actions";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { useHaptics } from "@/lib/utils/haptics";
import {
  readLocalStorage,
  removeFromLocalStorage,
  writeLocalStorage,
} from "@/lib/utils/local-storage";

import { CheckIcon, CloseIcon, MailIcon } from "../shared/Icons";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";

import { TurnstileWidget, type TurnstileWidgetHandle } from "./TurnstileWidget";

const initialState: ContactFormState = { success: false };

function getStoredDraft(): {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  inquiryType?: string;
} | null {
  return readLocalStorage(STORAGE_KEYS.DRAFT_CONTACT_FORM);
}

function isDraftUnchanged(
  parsed: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    inquiryType?: string;
  },
  draft: { name: string; email: string; subject: string; message: string; inquiryType: string },
): boolean {
  if (parsed.name !== draft.name) {
    return false;
  }
  if (parsed.email !== draft.email) {
    return false;
  }
  if (parsed.subject !== draft.subject) {
    return false;
  }
  if (parsed.message !== draft.message) {
    return false;
  }
  if (parsed.inquiryType !== draft.inquiryType) {
    return false;
  }
  return true;
}

interface ContactFormInnerProps {
  onReset: () => void;
}

function ContactFormInner({ onReset }: ContactFormInnerProps) {
  const t = useTranslations("contactPage.form");
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);
  const [isTransitionPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const haptics = useHaptics();
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [turnstileExecuting, setTurnstileExecuting] = useState(false);
  const csrfToken = useCsrfToken();
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
    if (state.success) {
      removeFromLocalStorage(STORAGE_KEYS.DRAFT_CONTACT_FORM);
      return;
    }

    const draft = { email, inquiryType, message, name, subject };
    const hasContent = Object.values(draft).some((value) => value && value.trim().length > 0);

    if (!hasContent) {
      removeFromLocalStorage(STORAGE_KEYS.DRAFT_CONTACT_FORM);
      return;
    }

    const existing = getStoredDraft();
    if (existing && isDraftUnchanged(existing, draft)) {
      return;
    }

    writeLocalStorage(STORAGE_KEYS.DRAFT_CONTACT_FORM, draft);
  }, [name, email, subject, message, inquiryType, state.success]);

  useEffect(() => {
    const timeoutId = setTimeout(saveDraft, 1500);
    return () => clearTimeout(timeoutId);
  }, [name, email, subject, message, inquiryType, state.success, saveDraft]);

  useEffect(() => {
    window.addEventListener("beforeunload", saveDraft);
    return () => window.removeEventListener("beforeunload", saveDraft);
  }, [saveDraft]);

  const previousStateRef = useRef(state);
  useEffect(() => {
    if (previousStateRef.current === state) {
      return;
    }
    previousStateRef.current = state;
    if (state.message === "captchaFailed") {
      haptics.error();
      setTurnstileResetKey((prev) => prev + 1);
      setTurnstileExecuting(false);
    } else if (state.success) {
      haptics.success();
      setTurnstileExecuting(false);
    } else if (state.errors) {
      haptics.error();
      setTurnstileExecuting(false);
    } else if (state.message) {
      haptics.error();
      setTurnstileExecuting(false);
    }
  }, [haptics, state]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!turnstileRef.current) {
        return;
      }

      setTurnstileExecuting(true);

      try {
        const token = await turnstileRef.current.execute();

        if (!token) {
          haptics.error();
          setTurnstileResetKey((prev) => prev + 1);
          setTurnstileExecuting(false);
          return;
        }

        if (!formRef.current) {
          setTurnstileExecuting(false);
          return;
        }

        const formData = new FormData(formRef.current);
        formData.set("cf-turnstile-response", token);

        startTransition(() => {
          formAction(formData);
        });
      } catch {
        haptics.error();
        setTurnstileExecuting(false);
      }
    },
    [formAction, haptics, startTransition],
  );

  const clearDraft = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setInquiryType("general");
    removeFromLocalStorage(STORAGE_KEYS.DRAFT_CONTACT_FORM);
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
          <Button type="button" variant="plain" onClick={onReset}>
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
      onSubmit={handleSubmit}
      className="glass-card no-hover-pop mx-auto max-w-2xl p-6 sm:p-10"
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
            className="form-clear-button self-start sm:self-auto"
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
          ref={turnstileRef}
          mode="execute"
          className="flex justify-center"
          resetKey={state.message === "captchaFailed" ? turnstileResetKey : undefined}
        />

        <Button
          type="submit"
          variant="glass"
          disabled={isPending || isTransitionPending || turnstileExecuting || !csrfToken}
          className="w-full"
        >
          {isPending || isTransitionPending || turnstileExecuting ? (
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

export function ContactForm() {
  const [instanceKey, setInstanceKey] = useState(0);

  const handleReset = useCallback(() => {
    removeFromLocalStorage(STORAGE_KEYS.DRAFT_CONTACT_FORM);
    setInstanceKey((prev) => prev + 1);
  }, []);

  return <ContactFormInner key={instanceKey} onReset={handleReset} />;
}
