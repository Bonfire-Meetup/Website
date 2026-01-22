"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { CheckIcon, CloseIcon, MicIcon } from "../shared/icons";
import { submitTalkProposal, type TalkProposalFormState } from "@/lib/forms/form-actions";
import { SelectDropdown, type DropdownOption } from "@/components/ui/SelectDropdown";
import { TurnstileWidget } from "./TurnstileWidget";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { API_ROUTES } from "@/lib/api/routes";

const initialState: TalkProposalFormState = { success: false };

export function TalkProposalForm() {
  const t = useTranslations("talkProposalPage.form");
  const tCommon = useTranslations("common");
  const [state, formAction, isPending] = useActionState(submitTalkProposal, initialState);
  const [speakerName, setSpeakerName] = useState("");
  const [email, setEmail] = useState("");
  const [talkTitle, setTalkTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [experience, setExperience] = useState("");
  const [duration, setDuration] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("either");
  const [csrfToken, setCsrfToken] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const draft = localStorage.getItem(STORAGE_KEYS.DRAFT_TALK_PROPOSAL);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.speakerName) setSpeakerName(parsed.speakerName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.talkTitle) setTalkTitle(parsed.talkTitle);
        if (parsed.abstract) setAbstract(parsed.abstract);
        if (parsed.experience) setExperience(parsed.experience);
        if (parsed.duration) setDuration(parsed.duration);
        if (parsed.preferredLocation) setPreferredLocation(parsed.preferredLocation);
      }
    } catch {}
  }, []);

  const saveDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    if (state.success) {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_TALK_PROPOSAL);
      return;
    }

    const draft = {
      speakerName,
      email,
      talkTitle,
      abstract,
      experience,
      duration,
      preferredLocation,
    };

    const hasContent = Object.values(draft).some((value) => value && value.trim().length > 0);
    if (!hasContent) {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_TALK_PROPOSAL);
      return;
    }

    try {
      const existingDraft = localStorage.getItem(STORAGE_KEYS.DRAFT_TALK_PROPOSAL);
      if (existingDraft) {
        const parsed = JSON.parse(existingDraft);
        const isUnchanged =
          parsed.speakerName === draft.speakerName &&
          parsed.email === draft.email &&
          parsed.talkTitle === draft.talkTitle &&
          parsed.abstract === draft.abstract &&
          parsed.experience === draft.experience &&
          parsed.duration === draft.duration &&
          parsed.preferredLocation === draft.preferredLocation;
        if (isUnchanged) {
          return;
        }
      }
    } catch {}

    localStorage.setItem(STORAGE_KEYS.DRAFT_TALK_PROPOSAL, JSON.stringify(draft));
  }, [
    speakerName,
    email,
    talkTitle,
    abstract,
    experience,
    duration,
    preferredLocation,
    state.success,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timeoutId = setTimeout(saveDraft, 1500);
    return () => clearTimeout(timeoutId);
  }, [
    speakerName,
    email,
    talkTitle,
    abstract,
    experience,
    duration,
    preferredLocation,
    state.success,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleBeforeUnload = () => {
      saveDraft();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    speakerName,
    email,
    talkTitle,
    abstract,
    experience,
    duration,
    preferredLocation,
    state.success,
  ]);

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
    setSpeakerName("");
    setEmail("");
    setTalkTitle("");
    setAbstract("");
    setExperience("");
    setDuration("");
    setPreferredLocation("either");
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_TALK_PROPOSAL);
    }
  };

  const hasDraft =
    speakerName ||
    email ||
    talkTitle ||
    abstract ||
    experience ||
    duration ||
    preferredLocation !== "either";

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
            {t("submitAnother")}
          </Button>
        </div>
      </div>
    );
  }

  const getFieldError = (field: string) => {
    const errorKey = state.errors?.[field];
    if (!errorKey) return null;
    return t(`errors.${errorKey}`) || errorKey;
  };

  const inputBaseClass = "form-input-base";
  const inputNormalClass = "form-input";
  const inputErrorClass = "form-input-error";
  const durationOptions: DropdownOption[] = [
    { value: "", label: t("durationPlaceholder"), disabled: true },
    { value: "15", label: t("duration15") },
    { value: "30", label: t("duration30") },
    { value: "45", label: t("duration45") },
  ];
  const locationOptions: DropdownOption[] = [
    {
      value: "either",
      label: t("locationEither", { prague: tCommon("prague"), zlin: tCommon("zlin") }),
    },
    { value: "prague", label: tCommon("prague") },
    { value: "zlin", label: tCommon("zlin") },
  ];

  return (
    <form
      ref={formRef}
      action={formAction}
      className="glass-card no-hover-pop mx-auto max-w-2xl p-6 sm:p-10"
    >
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="form-header-icon">
            <MicIcon className="h-6 w-6 text-white" />
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
            <label htmlFor="speaker-name" className="form-label">
              {t("speakerName")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="speaker-name"
              name="speakerName"
              value={speakerName}
              onChange={(e) => setSpeakerName(e.target.value)}
              required
              minLength={2}
              autoComplete="name"
              className={`${inputBaseClass} ${state.errors?.speakerName ? inputErrorClass : inputNormalClass}`}
              placeholder={t("speakerNamePlaceholder")}
            />
            {state.errors?.speakerName && (
              <p className="form-error-text">{getFieldError("speakerName")}</p>
            )}
          </div>

          <div>
            <label htmlFor="speaker-email" className="form-label">
              {t("email")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              id="speaker-email"
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
          <label htmlFor="talk-title" className="form-label">
            {t("talkTitle")} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="talk-title"
            name="talkTitle"
            value={talkTitle}
            onChange={(e) => setTalkTitle(e.target.value)}
            required
            minLength={5}
            className={`${inputBaseClass} ${state.errors?.talkTitle ? inputErrorClass : inputNormalClass}`}
            placeholder={t("talkTitlePlaceholder")}
          />
          {state.errors?.talkTitle && (
            <p className="form-error-text">{getFieldError("talkTitle")}</p>
          )}
        </div>

        <div>
          <label htmlFor="talk-abstract" className="form-label">
            {t("abstract")} <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="talk-abstract"
            name="abstract"
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            rows={5}
            required
            minLength={50}
            className={`${inputBaseClass} resize-none ${state.errors?.abstract ? inputErrorClass : inputNormalClass}`}
            placeholder={t("abstractPlaceholder")}
          />
          <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
            {t("abstractHint")}
          </p>
          {state.errors?.abstract && (
            <p className="mt-1 text-sm text-rose-500">{getFieldError("abstract")}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="talk-duration" className="form-label">
              {t("duration")} <span className="text-rose-500">*</span>
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
              <p className="form-error-text">{getFieldError("duration")}</p>
            )}
          </div>

          <div>
            <label htmlFor="preferred-location" className="form-label">
              {t("preferredLocation")}
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
          <label htmlFor="speaker-experience" className="form-label">
            {t("experience")}
          </label>
          <textarea
            id="speaker-experience"
            name="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            rows={3}
            className={`${inputBaseClass} resize-none ${inputNormalClass}`}
            placeholder={t("experiencePlaceholder")}
          />
          <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
            {t("experienceHint")}
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
          <div className="form-error-alert">{t(`errors.${state.message}`) || state.message}</div>
        )}

        <TurnstileWidget className="flex justify-center" />

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
