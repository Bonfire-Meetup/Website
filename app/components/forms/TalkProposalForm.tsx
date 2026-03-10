"use client";

import { useTranslations } from "next-intl";
import {
  type ComponentType,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { useCsrfToken } from "@/lib/api/csrf";
import { type TalkProposalFormState, submitTalkProposal } from "@/lib/forms/form-actions";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { useHaptics } from "@/lib/utils/haptics";
import {
  readLocalStorage,
  removeFromLocalStorage,
  writeLocalStorage,
} from "@/lib/utils/local-storage";

import {
  ArrowRightIcon,
  BoltIcon,
  BuildingIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  FireIcon,
  GlobeIcon,
  MapPinIcon,
  MicIcon,
} from "../shared/Icons";
import type { IconProps } from "../shared/icons/types";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";

import { TurnstileWidget, type TurnstileWidgetHandle } from "./TurnstileWidget";

const initialState: TalkProposalFormState = { success: false };

function isTalkDraftUnchanged(
  parsed: {
    speakerName?: string;
    email?: string;
    talkTitle?: string;
    abstract?: string;
    experience?: string;
    duration?: string;
    preferredLocation?: string;
  },
  draft: {
    speakerName: string;
    email: string;
    talkTitle: string;
    abstract: string;
    experience: string;
    duration: string;
    preferredLocation: string;
  },
): boolean {
  if (parsed.speakerName !== draft.speakerName) {
    return false;
  }
  if (parsed.email !== draft.email) {
    return false;
  }
  if (parsed.talkTitle !== draft.talkTitle) {
    return false;
  }
  if (parsed.abstract !== draft.abstract) {
    return false;
  }
  if (parsed.experience !== draft.experience) {
    return false;
  }
  if (parsed.duration !== draft.duration) {
    return false;
  }
  if (parsed.preferredLocation !== draft.preferredLocation) {
    return false;
  }
  return true;
}

interface TalkProposalFormInnerProps {
  onReset: () => void;
}

interface ChoiceTileOption {
  description: string;
  icon: ComponentType<IconProps>;
  label: string;
  value: string;
}

interface StepSectionHeadingProps {
  eyebrow: string;
  title: string;
}

interface ChoiceTileGroupProps {
  fieldName: "duration" | "preferredLocation";
  onChange: (nextValue: string) => void;
  options: ChoiceTileOption[];
  value: string;
}

function StepSectionHeading({ eyebrow, title }: StepSectionHeadingProps) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.3em] text-neutral-500 uppercase dark:text-neutral-400">
        {eyebrow}
      </p>
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h3>
    </div>
  );
}

function ChoiceTileGroup({ fieldName, onChange, options, value }: ChoiceTileGroupProps) {
  return (
    <>
      <input id={fieldName} type="hidden" name={fieldName} value={value} />
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border p-3 text-left transition-colors sm:p-4 ${
                isSelected
                  ? "border-brand-500/40 bg-brand-50 dark:border-brand-400/30 dark:bg-brand-500/10 shadow-[0_18px_36px_-28px_rgba(244,63,94,0.32)]"
                  : "border-black/8 bg-white hover:border-black/14 dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-white/14"
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-black/4 text-neutral-700 sm:h-10 sm:w-10 dark:bg-white/8 dark:text-white">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span
                  className={`mt-1 inline-flex h-4 w-4 shrink-0 rounded-full border transition-colors ${
                    isSelected
                      ? "border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-400 shadow-[inset_0_0_0_3px_white] dark:shadow-[inset_0_0_0_3px_rgba(12,12,18,1)]"
                      : "border-black/18 bg-transparent dark:border-white/18"
                  }`}
                />
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {option.label}
                </div>
                <div className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                  {option.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function getStoredDraft(): {
  speakerName?: string;
  email?: string;
  talkTitle?: string;
  abstract?: string;
  experience?: string;
  duration?: string;
  preferredLocation?: string;
} | null {
  return readLocalStorage(STORAGE_KEYS.DRAFT_TALK_PROPOSAL);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALIDATABLE_FIELDS = ["speakerName", "email", "talkTitle", "abstract", "duration"] as const;
const FIELD_TO_STEP: Record<string, number> = {
  abstract: 1,
  duration: 2,
  email: 0,
  speakerName: 0,
  talkTitle: 1,
};

function validateStepFields(
  step: number,
  values: {
    speakerName: string;
    email: string;
    talkTitle: string;
    abstract: string;
    duration: string;
  },
): Record<string, string> {
  if (step === 0) {
    return {
      ...(values.speakerName.trim().length >= 2 ? {} : { speakerName: "nameRequired" }),
      ...(EMAIL_PATTERN.test(values.email.trim()) ? {} : { email: "emailInvalid" }),
    };
  }

  if (step === 1) {
    return {
      ...(values.talkTitle.trim().length >= 5 ? {} : { talkTitle: "titleRequired" }),
      ...(values.abstract.trim().length >= 50 ? {} : { abstract: "abstractRequired" }),
    };
  }

  if (step === 2) {
    return {
      ...(values.duration ? {} : { duration: "durationRequired" }),
    };
  }

  return {};
}

function TalkProposalFormInner({ onReset }: TalkProposalFormInnerProps) {
  const t = useTranslations("talkProposalPage.form");
  const tCommon = useTranslations("common");
  const [state, formAction, isPending] = useActionState(submitTalkProposal, initialState);
  const [isTransitionPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const haptics = useHaptics();
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [turnstileExecuting, setTurnstileExecuting] = useState(false);
  const csrfToken = useCsrfToken();

  const [speakerName, setSpeakerName] = useState("");
  const [email, setEmail] = useState("");
  const [talkTitle, setTalkTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [experience, setExperience] = useState("");
  const [duration, setDuration] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("either");
  const [currentStep, setCurrentStep] = useState(0);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

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
  }, []);

  const saveDraft = useCallback(() => {
    if (state.success) {
      removeFromLocalStorage(STORAGE_KEYS.DRAFT_TALK_PROPOSAL);
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
      removeFromLocalStorage(STORAGE_KEYS.DRAFT_TALK_PROPOSAL);
      return;
    }

    const existing = getStoredDraft();
    if (existing && isTalkDraftUnchanged(existing, draft)) {
      return;
    }

    writeLocalStorage(STORAGE_KEYS.DRAFT_TALK_PROPOSAL, draft);
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
      const firstField = Object.keys(state.errors)[0];
      if (firstField && FIELD_TO_STEP[firstField] !== undefined) {
        setCurrentStep(FIELD_TO_STEP[firstField]);
      }
      setTurnstileExecuting(false);
    } else if (state.message) {
      haptics.error();
      setTurnstileExecuting(false);
    }
  }, [haptics, state]);

  const validateCurrentStep = (step: number) => {
    const errors = validateStepFields(step, {
      abstract,
      duration,
      email,
      speakerName,
      talkTitle,
    });
    setClientErrors((prev) => {
      const next = { ...prev };
      for (const field of VALIDATABLE_FIELDS) {
        delete next[field];
      }
      return { ...next, ...errors };
    });
    return errors;
  };

  const clearClientError = (field: string) => {
    setClientErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleNextStep = () => {
    const errors = validateCurrentStep(currentStep);
    if (Object.keys(errors).length > 0) {
      haptics.error();
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      for (const step of [0, 1, 2]) {
        const errors = validateStepFields(step, {
          abstract,
          duration,
          email,
          speakerName,
          talkTitle,
        });
        if (Object.keys(errors).length > 0) {
          setClientErrors(errors);
          setCurrentStep(step);
          haptics.error();
          return;
        }
      }

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
    [abstract, duration, email, formAction, haptics, speakerName, startTransition, talkTitle],
  );

  const clearDraft = () => {
    setSpeakerName("");
    setEmail("");
    setTalkTitle("");
    setAbstract("");
    setExperience("");
    setDuration("");
    setPreferredLocation("either");
    removeFromLocalStorage(STORAGE_KEYS.DRAFT_TALK_PROPOSAL);
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
  const abstractLength = abstract.trim().length;
  const experienceLength = experience.trim().length;
  const stepItems = [t("stepper.speaker"), t("stepper.talk"), t("stepper.shape")];
  const helperItems = [
    {
      title: t("stepHelp.speaker.title"),
      points: [t("stepHelp.speaker.point1"), t("stepHelp.speaker.point2")],
    },
    {
      title: t("stepHelp.talk.title"),
      points: [t("stepHelp.talk.point1"), t("stepHelp.talk.point2")],
    },
    {
      title: t("stepHelp.shape.title"),
      points: [t("stepHelp.shape.point1"), t("stepHelp.shape.point2")],
    },
  ];
  const durationOptions: ChoiceTileOption[] = [
    {
      description: t("duration15Description"),
      icon: BoltIcon,
      label: t("duration15"),
      value: "15",
    },
    {
      description: t("duration30Description"),
      icon: ClockIcon,
      label: t("duration30"),
      value: "30",
    },
    {
      description: t("duration45Description"),
      icon: FireIcon,
      label: t("duration45"),
      value: "45",
    },
  ];
  const locationOptions: ChoiceTileOption[] = [
    {
      description: t("locationEitherDescription", {
        prague: tCommon("prague"),
        zlin: tCommon("zlin"),
      }),
      icon: GlobeIcon,
      label: t("locationEither", { prague: tCommon("prague"), zlin: tCommon("zlin") }),
      value: "either",
    },
    {
      description: t("locationPragueDescription"),
      icon: MapPinIcon,
      label: tCommon("prague"),
      value: "prague",
    },
    {
      description: t("locationZlinDescription"),
      icon: BuildingIcon,
      label: tCommon("zlin"),
      value: "zlin",
    },
  ];

  if (state.success) {
    return (
      <div className="glass-card no-hover-pop mx-auto max-w-3xl rounded-[32px] p-8 text-center sm:p-12">
        <div className="form-success-icon">
          <CheckIcon className="h-8 w-8 text-white" />
        </div>
        <p className="mb-3 text-xs font-semibold tracking-[0.34em] text-neutral-500 uppercase dark:text-neutral-400">
          {t("successEyebrow")}
        </p>
        <h2 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-white">
          {t("successTitle")}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">{t("successMessage")}</p>
        <div className="mt-6 flex justify-center">
          <Button type="button" variant="plain" onClick={onReset}>
            {t("submitAnother")}
          </Button>
        </div>
      </div>
    );
  }

  const getFieldError = (field: string) => {
    const errorKey = clientErrors[field] || state.errors?.[field];
    if (!errorKey) {
      return null;
    }
    try {
      return t(`errors.${errorKey}`);
    } catch {
      return errorKey;
    }
  };

  const hasFieldError = (field: string) => Boolean(clientErrors[field] || state.errors?.[field]);

  const inputBaseClass = "form-input-base";
  const inputNormalClass = "form-input";
  const inputErrorClass = "form-input-error";
  const currentHelper = helperItems[currentStep];

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl rounded-[24px] border border-black/8 bg-white p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.28)] sm:p-7 dark:border-white/10 dark:bg-white/4 dark:shadow-[0_18px_50px_-40px_rgba(0,0,0,0.55)]"
    >
      <div className="mb-7 border-b border-black/6 pb-5 dark:border-white/10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="form-header-icon">
              <MicIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.32em] text-neutral-500 uppercase dark:text-neutral-400">
                {t("intro.eyebrow")}
              </p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                {t("title")}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                {t("subtitle")}
              </p>
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
      </div>

      {hasDraft && <div className="form-draft-note">{t("draftNote")}</div>}

      <div className="mb-7">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold tracking-[0.24em] text-neutral-500 uppercase dark:text-neutral-400">
          <span>{t("stepper.progress")}</span>
          <span>{t("stepper.count", { current: currentStep + 1, total: stepItems.length })}</span>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-neutral-200/80 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 via-orange-500 to-rose-500 transition-[width] duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / stepItems.length) * 100}%` }}
          />
        </div>
        <div className="relative grid grid-cols-3 gap-2 sm:gap-3">
          <div className="pointer-events-none absolute top-3 right-3 left-3 h-px bg-black/8 dark:bg-white/10" />
          {stepItems.map((item, index) => {
            const isActive = index === currentStep;
            const isComplete = index < currentStep;

            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  if (index <= currentStep) {
                    setCurrentStep(index);
                  }
                }}
                className={`group flex flex-col items-center text-center transition-opacity ${
                  index <= currentStep ? "opacity-100" : "opacity-55"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold tracking-[0.18em] uppercase transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-orange-400 to-rose-500 text-white"
                        : isComplete
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                          : "bg-neutral-200 text-neutral-500 dark:bg-white/10 dark:text-neutral-500"
                    }`}
                  >
                    0{index + 1}
                  </span>
                </div>
                <div
                  className={`mt-2 text-xs font-semibold tracking-normal normal-case transition-colors sm:text-sm ${
                    isActive
                      ? "text-neutral-900 dark:text-white"
                      : isComplete
                        ? "text-neutral-700 dark:text-neutral-200"
                        : "text-neutral-400 dark:text-neutral-500"
                  }`}
                >
                  {item}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <section className="py-2" hidden={currentStep !== 0} aria-hidden={currentStep !== 0}>
          <div className="space-y-5">
            <StepSectionHeading
              eyebrow={t("sections.speaker.eyebrow")}
              title={t("sections.speaker.title")}
            />

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
                  onChange={(e) => {
                    setSpeakerName(e.target.value);
                    clearClientError("speakerName");
                  }}
                  required
                  minLength={2}
                  autoComplete="name"
                  className={`${inputBaseClass} ${hasFieldError("speakerName") ? inputErrorClass : inputNormalClass}`}
                  placeholder={t("speakerNamePlaceholder")}
                />
                {hasFieldError("speakerName") && (
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearClientError("email");
                  }}
                  required
                  autoComplete="email"
                  className={`${inputBaseClass} ${hasFieldError("email") ? inputErrorClass : inputNormalClass}`}
                  placeholder={t("emailPlaceholder")}
                />
                {hasFieldError("email") && (
                  <p className="form-error-text">{getFieldError("email")}</p>
                )}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="speaker-experience" className="form-label mb-0">
                  {t("experience")}
                </label>
                <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                  {t("experienceCount", { count: experienceLength })}
                </span>
              </div>
              <textarea
                id="speaker-experience"
                name="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={4}
                className={`${inputBaseClass} resize-y ${inputNormalClass}`}
                placeholder={t("experiencePlaceholder")}
              />
              <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                {t("experienceHint")}
              </p>
            </div>
          </div>
        </section>

        <section className="py-2" hidden={currentStep !== 1} aria-hidden={currentStep !== 1}>
          <div className="space-y-5">
            <StepSectionHeading
              eyebrow={t("sections.talk.eyebrow")}
              title={t("sections.talk.title")}
            />

            <div>
              <label htmlFor="talk-title" className="form-label">
                {t("talkTitle")} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="talk-title"
                name="talkTitle"
                value={talkTitle}
                onChange={(e) => {
                  setTalkTitle(e.target.value);
                  clearClientError("talkTitle");
                }}
                required
                minLength={5}
                className={`${inputBaseClass} ${hasFieldError("talkTitle") ? inputErrorClass : inputNormalClass}`}
                placeholder={t("talkTitlePlaceholder")}
              />
              {hasFieldError("talkTitle") && (
                <p className="form-error-text">{getFieldError("talkTitle")}</p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="talk-abstract" className="form-label mb-0">
                  {t("abstract")} <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                  {t("abstractCount", { count: abstractLength })}
                </span>
              </div>
              <textarea
                id="talk-abstract"
                name="abstract"
                value={abstract}
                onChange={(e) => {
                  setAbstract(e.target.value);
                  clearClientError("abstract");
                }}
                rows={6}
                required
                minLength={50}
                className={`${inputBaseClass} resize-y ${hasFieldError("abstract") ? inputErrorClass : inputNormalClass}`}
                placeholder={t("abstractPlaceholder")}
              />
              <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                {t("abstractHint")}
              </p>
              {hasFieldError("abstract") && (
                <p className="mt-1 text-sm text-rose-500">{getFieldError("abstract")}</p>
              )}
            </div>
          </div>
        </section>

        <section className="py-2" hidden={currentStep !== 2} aria-hidden={currentStep !== 2}>
          <div className="space-y-5">
            <StepSectionHeading
              eyebrow={t("sections.shape.eyebrow")}
              title={t("sections.shape.title")}
            />

            <div className="space-y-5">
              <div>
                <label htmlFor="talk-duration" className="form-label">
                  {t("duration")} <span className="text-rose-500">*</span>
                </label>
                <ChoiceTileGroup
                  fieldName="duration"
                  value={duration}
                  onChange={(nextValue) => {
                    setDuration(nextValue);
                    clearClientError("duration");
                  }}
                  options={durationOptions}
                />
                {hasFieldError("duration") && (
                  <p className="form-error-text">{getFieldError("duration")}</p>
                )}
              </div>

              <div>
                <label htmlFor="preferred-location" className="form-label">
                  {t("preferredLocation")}
                </label>
                <ChoiceTileGroup
                  fieldName="preferredLocation"
                  value={preferredLocation}
                  onChange={setPreferredLocation}
                  options={locationOptions}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-black/6 bg-neutral-50/80 px-4 py-4 dark:border-white/8 dark:bg-white/4">
          <p className="text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-400">
            {currentHelper.title}
          </p>
          <ul className="mt-3 space-y-2.5">
            {currentHelper.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="bg-brand-500 mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                <span className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {point}
                </span>
              </li>
            ))}
          </ul>
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
          className={currentStep === 2 ? "mt-6 flex justify-center" : "hidden"}
          resetKey={state.message === "captchaFailed" ? turnstileResetKey : undefined}
        />

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="plain"
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
            className="w-full justify-center rounded-xl border border-black/8 px-4 py-3 text-sm sm:w-auto sm:min-w-24 dark:border-white/10"
          >
            {t("back")}
          </Button>

          {currentStep < 2 ? (
            <Button
              key="next-step"
              type="button"
              variant="fire-primary"
              onClick={handleNextStep}
              className="w-full rounded-xl px-5 py-3 text-sm sm:w-auto sm:min-w-28"
            >
              {t("next")}
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              key="submit-form"
              type="submit"
              variant="fire-primary"
              disabled={isPending || isTransitionPending || turnstileExecuting || !csrfToken}
              className="w-full rounded-xl px-5 py-3 text-sm sm:w-auto sm:min-w-36"
            >
              {isPending || isTransitionPending || turnstileExecuting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="md" />
                  {t("submitting")}
                </span>
              ) : (
                <>
                  {t("submit")}
                  <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

export function TalkProposalForm() {
  const [instanceKey, setInstanceKey] = useState(0);

  const handleReset = useCallback(() => {
    removeFromLocalStorage(STORAGE_KEYS.DRAFT_TALK_PROPOSAL);
    setInstanceKey((prev) => prev + 1);
  }, []);

  return <TalkProposalFormInner key={instanceKey} onReset={handleReset} />;
}
