"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { CheckIcon, MicIcon } from "../shared/icons";
import { submitTalkProposal, type TalkProposalFormState } from "../../lib/forms/form-actions";
import { SelectDropdown, type DropdownOption } from "../ui/SelectDropdown";
import { TurnstileWidget } from "./TurnstileWidget";

type Translations = {
  form: {
    title: string;
    subtitle: string;
    speakerName: string;
    speakerNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    talkTitle: string;
    talkTitlePlaceholder: string;
    abstract: string;
    abstractPlaceholder: string;
    abstractHint: string;
    duration: string;
    durationPlaceholder: string;
    duration15: string;
    duration30: string;
    duration45: string;
    preferredLocation: string;
    locationEither: string;
    locationPrague: string;
    locationZlin: string;
    experience: string;
    experiencePlaceholder: string;
    experienceHint: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successMessage: string;
    submitAnother: string;
    errors: Record<string, string>;
  };
};

const initialState: TalkProposalFormState = { success: false };

export function TalkProposalForm({ t }: { t: Translations }) {
  const [state, formAction, isPending] = useActionState(submitTalkProposal, initialState);
  const [duration, setDuration] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("either");
  const [csrfToken, setCsrfToken] = useState("");

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
            {t.form.submitAnother}
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
  const durationOptions: DropdownOption[] = [
    { value: "", label: t.form.durationPlaceholder, disabled: true },
    { value: "15", label: t.form.duration15 },
    { value: "30", label: t.form.duration30 },
    { value: "45", label: t.form.duration45 },
  ];
  const locationOptions: DropdownOption[] = [
    { value: "either", label: t.form.locationEither },
    { value: "prague", label: t.form.locationPrague },
    { value: "zlin", label: t.form.locationZlin },
  ];

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

  return (
    <form action={formAction} className="glass-card no-hover-pop mx-auto max-w-2xl p-6 sm:p-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-rose-500 shadow-lg shadow-brand-500/30">
          <MicIcon className="h-6 w-6 text-white" />
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
              htmlFor="speaker-name"
              className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              {t.form.speakerName} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="speaker-name"
              name="speakerName"
              required
              minLength={2}
              autoComplete="name"
              className={`${inputBaseClass} ${state.errors?.speakerName ? inputErrorClass : inputNormalClass}`}
              placeholder={t.form.speakerNamePlaceholder}
            />
            {state.errors?.speakerName && (
              <p className="mt-1.5 text-sm text-rose-500">{getFieldError("speakerName")}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="speaker-email"
              className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              {t.form.email} <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              id="speaker-email"
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
            htmlFor="talk-title"
            className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
          >
            {t.form.talkTitle} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="talk-title"
            name="talkTitle"
            required
            minLength={5}
            className={`${inputBaseClass} ${state.errors?.talkTitle ? inputErrorClass : inputNormalClass}`}
            placeholder={t.form.talkTitlePlaceholder}
          />
          {state.errors?.talkTitle && (
            <p className="mt-1.5 text-sm text-rose-500">{getFieldError("talkTitle")}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="talk-abstract"
            className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
          >
            {t.form.abstract} <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="talk-abstract"
            name="abstract"
            rows={5}
            required
            minLength={50}
            className={`${inputBaseClass} resize-none ${state.errors?.abstract ? inputErrorClass : inputNormalClass}`}
            placeholder={t.form.abstractPlaceholder}
          />
          <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
            {t.form.abstractHint}
          </p>
          {state.errors?.abstract && (
            <p className="mt-1 text-sm text-rose-500">{getFieldError("abstract")}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="talk-duration"
              className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              {t.form.duration} <span className="text-rose-500">*</span>
            </label>
            <SelectDropdown
              id="talk-duration"
              name="duration"
              value={duration}
              options={durationOptions}
              onChange={setDuration}
              ariaInvalid={Boolean(state.errors?.duration)}
              nativeOnMobile
              required
              buttonClassName={`${inputBaseClass} ${state.errors?.duration ? inputErrorClass : inputNormalClass} ${
                duration
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
              nativeClassName={`${inputBaseClass} ${state.errors?.duration ? inputErrorClass : inputNormalClass} ${
                duration
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
              activeOptionClassName="bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300"
            />
            {state.errors?.duration && (
              <p className="mt-1.5 text-sm text-rose-500">{getFieldError("duration")}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="preferred-location"
              className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              {t.form.preferredLocation}
            </label>
            <SelectDropdown
              id="preferred-location"
              name="preferredLocation"
              value={preferredLocation}
              options={locationOptions}
              onChange={setPreferredLocation}
              nativeOnMobile
              buttonClassName={`${inputBaseClass} ${inputNormalClass}`}
              nativeClassName={`${inputBaseClass} ${inputNormalClass}`}
              activeOptionClassName="bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="speaker-experience"
            className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
          >
            {t.form.experience}
          </label>
          <textarea
            id="speaker-experience"
            name="experience"
            rows={3}
            className={`${inputBaseClass} resize-none ${inputNormalClass}`}
            placeholder={t.form.experiencePlaceholder}
          />
          <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
            {t.form.experienceHint}
          </p>
        </div>

        <input
          type="text"
          name="company"
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
