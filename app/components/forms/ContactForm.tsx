"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { CheckIcon, CloseIcon, MailIcon } from "../shared/icons";
import { submitContactForm, type ContactFormState } from "@/lib/forms/form-actions";
import { SelectDropdown, type DropdownOption } from "@/components/ui/SelectDropdown";
import { TurnstileWidget } from "./TurnstileWidget";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { API_ROUTES } from "@/lib/api/routes";

type Translations = {
  form: {
    title: string;
    subtitle: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    inquiryType: string;
    inquiryTypeGeneral: string;
    inquiryTypePress: string;
    inquiryTypeCrew: string;
    inquiryTypeConduct: string;
    inquiryTypeFeature: string;
    inquiryTypeSupport: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successMessage: string;
    sendAnother: string;
    clearDraft: string;
    draftNote: string;
    errors: Record<string, string>;
  };
};

const initialState: ContactFormState = { success: false };

export function ContactForm({ t }: { t: Translations }) {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [inquiryType, setInquiryType] = useState("general");
  const [csrfToken, setCsrfToken] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const inquiryOptions = useMemo<DropdownOption[]>(
    () => [
      { value: "general", label: t.form.inquiryTypeGeneral },
      { value: "feature", label: t.form.inquiryTypeFeature },
      { value: "support", label: t.form.inquiryTypeSupport },
      { value: "press", label: t.form.inquiryTypePress },
      { value: "crew", label: t.form.inquiryTypeCrew },
      { value: "coc", label: t.form.inquiryTypeConduct },
    ],
    [
      t.form.inquiryTypeConduct,
      t.form.inquiryTypeCrew,
      t.form.inquiryTypeFeature,
      t.form.inquiryTypeGeneral,
      t.form.inquiryTypePress,
      t.form.inquiryTypeSupport,
    ],
  );

  useEffect(() => {
    try {
      const draft = localStorage.getItem(STORAGE_KEYS.DRAFT_CONTACT_FORM);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.subject) setSubject(parsed.subject);
        if (parsed.message) setMessage(parsed.message);
        if (parsed.inquiryType && inquiryOptions.some((option) => option.value === parsed.inquiryType)) {
          setInquiryType(parsed.inquiryType);
        }
      }
    } catch {
    }
  }, [inquiryOptions]);

  useEffect(() => {
    const nextType = searchParams.get("type");
    if (!nextType) return;
    if (inquiryOptions.some((option) => option.value === nextType)) {
      setInquiryType(nextType);
    }
  }, [searchParams, inquiryOptions]);

  useEffect(() => {
    if (state.success) {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_CONTACT_FORM);
      return;
    }

    const timeoutId = setTimeout(() => {
      const draft = {
        name,
        email,
        subject,
        message,
        inquiryType,
      };
      
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
      } catch {
      }

      localStorage.setItem(STORAGE_KEYS.DRAFT_CONTACT_FORM, JSON.stringify(draft));
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [name, email, subject, message, inquiryType, state.success]);

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

  const clearDraft = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setInquiryType("general");
    localStorage.removeItem(STORAGE_KEYS.DRAFT_CONTACT_FORM);
  };

  const hasDraft = name || email || subject || message || inquiryType !== "general";

  if (state.success) {
    return (
      <div className="glass-card no-hover-pop mx-auto max-w-2xl p-8 text-center sm:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30">
          <CheckIcon className="h-8 w-8 text-white" />
        </div>
        <h2 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-white">
          {t.form.successTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">{t.form.successMessage}</p>
        <div className="mt-6 flex justify-center">
          <Button type="button" variant="plain" onClick={() => window.location.reload()}>
            {t.form.sendAnother}
          </Button>
        </div>
      </div>
    );
  }

  const getFieldError = (field: string) => {
    const errorKey = state.errors?.[field];
    if (!errorKey) return null;
    return t.form.errors[errorKey] || errorKey;
  };

  const inputBaseClass =
    "w-full rounded-xl border bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-white/5 dark:text-white dark:placeholder-neutral-500";
  const inputNormalClass =
    "border-neutral-200 focus:border-brand-500 focus:ring-brand-500/20 dark:border-white/10 dark:focus:border-brand-400";
  const inputErrorClass = "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20";

  return (
    <form ref={formRef} action={formAction} className="glass-card no-hover-pop mx-auto max-w-2xl p-6 sm:p-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-rose-500 shadow-lg shadow-brand-500/30">
            <MailIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{t.form.title}</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.form.subtitle}</p>
          </div>
        </div>
        {hasDraft && (
          <Button
            type="button"
            variant="plain"
            size="sm"
            onClick={clearDraft}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200/70 bg-white/60 px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm transition-colors hover:border-neutral-300 hover:bg-white hover:text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-neutral-200"
          >
            <CloseIcon className="h-3.5 w-3.5" />
            {t.form.clearDraft}
          </Button>
        )}
      </div>

      {hasDraft && (
        <div className="mb-5 rounded-lg border border-neutral-200/50 bg-neutral-50/50 px-3 py-2 text-xs text-neutral-500 dark:border-white/5 dark:bg-white/5 dark:text-neutral-400">
          {t.form.draftNote}
        </div>
      )}

      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contact-name"
              className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              {t.form.name} <span className="text-rose-500">*</span>
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
              placeholder={t.form.namePlaceholder}
            />
            {state.errors?.name && (
              <p className="mt-1.5 text-sm text-rose-500">{getFieldError("name")}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              {t.form.email} <span className="text-rose-500">*</span>
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
              placeholder={t.form.emailPlaceholder}
            />
            {state.errors?.email && (
              <p className="mt-1.5 text-sm text-rose-500">{getFieldError("email")}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="contact-inquiry"
            className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
          >
            {t.form.inquiryType}
          </label>
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
        </div>

        <div>
          <label
            htmlFor="contact-subject"
            className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
          >
            {t.form.subject} <span className="text-rose-500">*</span>
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
            placeholder={t.form.subjectPlaceholder}
          />
          {state.errors?.subject && (
            <p className="mt-1.5 text-sm text-rose-500">{getFieldError("subject")}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
          >
            {t.form.message} <span className="text-rose-500">*</span>
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
            placeholder={t.form.messagePlaceholder}
          />
          {state.errors?.message && (
            <p className="mt-1.5 text-sm text-rose-500">{getFieldError("message")}</p>
          )}
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
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
            {t.form.errors[state.message] || state.message}
          </div>
        )}

        <TurnstileWidget className="flex justify-center" />

        <Button type="submit" variant="glass" disabled={isPending || !csrfToken} className="w-full">
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size="md" />
              {t.form.submitting}
            </span>
          ) : (
            t.form.submit
          )}
        </Button>
      </div>
    </form>
  );
}
