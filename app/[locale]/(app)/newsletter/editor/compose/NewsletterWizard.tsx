"use client";

import type { NewsletterSection, NewsletterWizardData, WizardStep } from "./types";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { logWarn } from "@/lib/utils/log-client";

import { AudienceStep } from "./AudienceStep";
import { ConfirmationStep } from "./ConfirmationStep";
import { EditorStep } from "./EditorStep";
import { WizardProgress } from "./WizardProgress";

const STORAGE_KEY = "newsletter-draft";
const STEPS: WizardStep[] = ["editor", "audience", "confirmation"];

function getInitialData(): NewsletterWizardData {
  return {
    primaryNews: {
      id: "primary",
      title: "",
      text: "",
    },
    secondaryNews: [],
    subject: "",
    previewText: "",
    audience: {
      type: "all",
      manualEmails: [],
    },
  };
}

function loadDraft(): NewsletterWizardData | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as NewsletterWizardData;
    }
  } catch (error) {
    logWarn("newsletter.load_draft_failed", { error: String(error) });
  }

  return null;
}

function saveDraft(data: NewsletterWizardData): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    logWarn("newsletter.save_draft_failed", { error: String(error) });
  }
}

function clearDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    logWarn("newsletter.clear_draft_failed", { error: String(error) });
  }
}

interface NewsletterWizardProps {
  onComplete?: () => void;
}

export function NewsletterWizard({ onComplete }: NewsletterWizardProps) {
  const t = useTranslations("newsletterEditor");
  const [currentStep, setCurrentStep] = useState<WizardStep>("editor");
  const [data, setData] = useState<NewsletterWizardData>(getInitialData);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const draft = loadDraft();
    if (draft) {
      setData(draft);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      saveDraft(data);
    }
  }, [data, mounted]);

  const currentStepIndex = STEPS.indexOf(currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const handleUpdatePrimaryNews = (updates: Partial<NewsletterSection>) => {
    setData((prev) => ({
      ...prev,
      primaryNews: { ...prev.primaryNews, ...updates },
    }));
  };

  const handleAddSecondaryNews = () => {
    const newSection: NewsletterSection = {
      id: `secondary-${Date.now()}`,
      title: "",
      text: "",
    };
    setData((prev) => ({
      ...prev,
      secondaryNews: [...prev.secondaryNews, newSection],
    }));
  };

  const handleUpdateSecondaryNews = (id: string, updates: Partial<NewsletterSection>) => {
    setData((prev) => ({
      ...prev,
      secondaryNews: prev.secondaryNews.map((section) =>
        section.id === id ? { ...section, ...updates } : section,
      ),
    }));
  };

  const handleRemoveSecondaryNews = (id: string) => {
    setData((prev) => ({
      ...prev,
      secondaryNews: prev.secondaryNews.filter((section) => section.id !== id),
    }));
  };

  const handleUpdateSubject = (subject: string) => {
    setData((prev) => ({ ...prev, subject }));
  };

  const handleUpdatePreviewText = (previewText: string) => {
    setData((prev) => ({ ...prev, previewText }));
  };

  const handleUpdateAudience = (audience: NewsletterWizardData["audience"]) => {
    setData((prev) => ({ ...prev, audience }));
  };

  const handleSendComplete = () => {
    clearDraft();
    onComplete?.();
  };

  const isStepValid = (step: WizardStep): boolean => {
    switch (step) {
      case "editor":
        return (
          data.subject.trim().length > 0 &&
          data.primaryNews.title.trim().length > 0 &&
          data.primaryNews.text.trim().length > 0
        );
      case "audience":
        if (data.audience.type === "manual") {
          return data.audience.manualEmails.length > 0;
        }
        return true;
      case "confirmation":
        return true;
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);

  if (!mounted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" className="text-fuchsia-600 dark:text-fuchsia-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <WizardProgress currentStep={currentStep} steps={STEPS} />

      <div className="glass-card no-hover-pop overflow-hidden rounded-[24px] p-6 sm:p-8">
        {currentStep === "editor" && (
          <EditorStep
            data={data}
            onUpdatePrimaryNews={handleUpdatePrimaryNews}
            onAddSecondaryNews={handleAddSecondaryNews}
            onUpdateSecondaryNews={handleUpdateSecondaryNews}
            onRemoveSecondaryNews={handleRemoveSecondaryNews}
            onUpdateSubject={handleUpdateSubject}
            onUpdatePreviewText={handleUpdatePreviewText}
          />
        )}

        {currentStep === "audience" && (
          <AudienceStep data={data.audience} onUpdate={handleUpdateAudience} />
        )}

        {currentStep === "confirmation" && (
          <ConfirmationStep data={data} onSendComplete={handleSendComplete} />
        )}
      </div>

      <nav
        className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-white/60 px-3 py-2.5 sm:px-4 dark:border-white/10 dark:bg-white/5"
        aria-label={t("stepNavigation")}
      >
        <Button
          variant={currentStepIndex === 0 ? "ghost" : "glass-secondary"}
          size="sm"
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          className="min-w-[5.5rem] gap-1.5 !px-4 !py-2 text-sm text-neutral-600 disabled:opacity-40 sm:min-w-[6rem] dark:text-neutral-400"
          aria-label={t("back")}
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 shrink-0" />
          {t("back")}
        </Button>

        {currentStep !== "confirmation" && (
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            variant="primary"
            size="sm"
            className="min-w-[5.5rem] gap-1.5 sm:min-w-[6rem]"
            aria-label={t("next")}
          >
            {t("next")}
            <ArrowRightIcon className="h-3.5 w-3.5 shrink-0" />
          </Button>
        )}
      </nav>
    </div>
  );
}
