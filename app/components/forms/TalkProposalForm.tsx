"use client";

import { useTranslations } from "next-intl";
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
import { API_ROUTES } from "@/lib/api/routes";
import { type TalkProposalFormState, submitTalkProposal } from "@/lib/forms/form-actions";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { logError } from "@/lib/utils/log-client";

import { CheckIcon, CloseIcon, MicIcon } from "../shared/icons";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";

import { TurnstileWidget, type TurnstileWidgetHandle } from "./TurnstileWidget";

const initialState: TalkProposalFormState = { success: false };

function getStoredDraft(): {
  speakerName?: string;
  email?: string;
  talkTitle?: string;
  abstract?: string;
  experience?: string;
  duration?: string;
  preferredLocation?: string;
} | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const draft = localStorage.getItem(STORAGE_KEYS.DRAFT_TALK_PROPOSAL);
    return draft ? JSON.parse(draft) : null;
  } catch {
    return null;
  }
}

export function TalkProposalForm() {
  const t = useTranslations("talkProposalPage.form");
  const tCommon = useTranslations("common");
  const [state, formAction, isPending] = useActionState(submitTalkProposal, initialState);
  const [isTransitionPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [turnstileExecuting, setTurnstileExecuting] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [mounted, setMounted] = useState(false);

  const [speakerName, setSpeakerName] = useState("");
  const [email, setEmail] = useState("");
  const [talkTitle, setTalkTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [experience, setExperience] = useState("");
  const [duration, setDuration] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("either");

  const durationOptions = useMemo<DropdownOption[]>(
    () => [
      { disabled: true, label: t("durationPlaceholder"), value: "" },
      { label: t("duration15"), value: "15" },
      { label: t("duration30"), value: "30" },
      { label: t("duration45"), value: "45" },
    ],
    [t],
  );

  const locationOptions = useMemo<DropdownOption[]>(
    () => [
      {
        label: t("locationEither", { prague: tCommon("prague"), zlin: tCommon("zlin") }),
        value: "either",
      },
      { label: tCommon("prague"), value: "prague" },
      { label: tCommon("zlin"), value: "zlin" },
    ],
    [t, tCommon],
  );

  useEffect(() => {
    const draft = getStoredDraft();
    if (draft) {
      if (draft.speakerName) {
        setSpeakerName(draft.speakerName);
      }
      if (draft.email) {
        setEmail(draft.email);
      }
      if (draft.talkTitle) {
        setTalkTitle(draft.talkTitle);
      }
      if (draft.abstract) {
        setAbstract(draft.abstract);
      }
      if (draft.experience) {
        setExperience(draft.experience);
      }
      if (draft.duration) {
        setDuration(draft.duration);
      }
      if (draft.preferredLocation) {
        setPreferredLocation(draft.preferredLocation);
      }
    }
    setMounted(true);
  }, []);

  const saveDraft = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (state.success) {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_TALK_PROPOSAL);
      return;
    }

    const draft = {
      abstract,
      duration,
      email,
      experience,
      preferredLocation,
      speakerName,
      talkTitle,
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
    } catch (error) {
      logError("talkProposalForm.draft_parse_failed", error);
    }

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
    if (typeof window === "undefined") {
      return;
    }
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
    saveDraft,
  ]);

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
      setTurnstileExecuting(false);
    } else if (state.success || state.errors || state.message) {
      // Reset loading state on any state change (success, errors, or messages like rateLimited)
      setTurnstileExecuting(false);
    }
  }, [state.message, state.success, state.errors]);

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
        setTurnstileExecuting(false);
      }
    },
    [formAction, startTransition],
  );

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

  const hasSpeakerName = Boolean(speakerName);
  const hasEmail = Boolean(email);
  const hasTalkTitle = Boolean(talkTitle);
  const hasAbstract = Boolean(abstract);
  const hasExperience = Boolean(experience);
  const hasDuration = Boolean(duration);
  const isLocationSelected = preferredLocation !== "either";
  const hasDraft =
    hasSpeakerName ||
    hasEmail ||
    hasTalkTitle ||
    hasAbstract ||
    hasExperience ||
    hasDuration ||
    isLocationSelected;

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
            {mounted ? (
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
            ) : (
              <div
                className={`${inputBaseClass} ${inputNormalClass} flex items-center text-neutral-400 dark:text-neutral-500`}
              >
                {durationOptions.find((o) => o.value === "")?.label}
              </div>
            )}
            {state.errors?.duration && (
              <p className="form-error-text">{getFieldError("duration")}</p>
            )}
          </div>

          <div>
            <label htmlFor="preferred-location" className="form-label">
              {t("preferredLocation")}
            </label>
            {mounted ? (
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
            ) : (
              <div className={`${inputBaseClass} ${inputNormalClass} flex items-center`}>
                {locationOptions.find((o) => o.value === "either")?.label}
              </div>
            )}
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
