"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "./Button";
import { CheckIcon, MailIcon } from "./icons";
import { submitContactForm, type ContactFormState } from "../lib/form-actions";
import { SelectDropdown, type DropdownOption } from "./SelectDropdown";
import { TurnstileWidget } from "./TurnstileWidget";

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
    submit: string;
    submitting: string;
    successTitle: string;
    successMessage: string;
    sendAnother: string;
    errors: Record<string, string>;
  };
};

const initialState: ContactFormState = { success: false };

export function ContactForm({ t }: { t: Translations }) {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);
  const searchParams = useSearchParams();
  const [inquiryType, setInquiryType] = useState("general");
  const [csrfToken, setCsrfToken] = useState("");

  const inquiryOptions = useMemo<DropdownOption[]>(
    () => [
      { value: "general", label: t.form.inquiryTypeGeneral },
      { value: "press", label: t.form.inquiryTypePress },
      { value: "crew", label: t.form.inquiryTypeCrew },
      { value: "coc", label: t.form.inquiryTypeConduct },
    ],
    [
      t.form.inquiryTypeConduct,
      t.form.inquiryTypeCrew,
      t.form.inquiryTypeGeneral,
      t.form.inquiryTypePress,
    ],
  );

  useEffect(() => {
    const nextType = searchParams.get("type");
    if (!nextType) return;
    if (inquiryOptions.some((option) => option.value === nextType)) {
      setInquiryType(nextType);
    }
  }, [searchParams, inquiryOptions]);

  useEffect(() => {
    let isActive = true;
    fetch("/api/v1/csrf")
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
    <form action={formAction} className="glass-card no-hover-pop mx-auto max-w-2xl p-6 sm:p-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-rose-500 shadow-lg shadow-brand-500/30">
          <MailIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{t.form.title}</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.form.subtitle}</p>
        </div>
      </div>

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
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
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
