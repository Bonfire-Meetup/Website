"use client";

import type { NewsletterSection, NewsletterWizardData, WizardStep } from "./types";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <WizardProgress currentStep={currentStep} steps={STEPS} />

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/50">
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

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          className="text-neutral-600 disabled:opacity-40 dark:text-neutral-400"
        >
          {t("back")}
        </Button>

        {currentStep !== "confirmation" && (
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="bg-gradient-to-r from-violet-600 to-rose-500 text-white hover:from-violet-700 hover:to-rose-600 disabled:opacity-50"
          >
            {t("next")}
          </Button>
        )}
      </div>
    </div>
  );
}
