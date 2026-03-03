"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getValidAccessTokenAsync } from "@/lib/api/query-utils";
import { API_ROUTES } from "@/lib/api/routes";
import { createJsonAuthHeaders } from "@/lib/utils/http";
import { readLocalStorage, writeLocalStorage } from "@/lib/utils/local-storage";

import { AudienceStep } from "./AudienceStep";
import { ConfirmationStep } from "./ConfirmationStep";
import { DraftSelector } from "./DraftSelector";
import { EditorStep } from "./EditorStep";
import type {
  AudienceCounts,
  NewsletterDraft,
  NewsletterSection,
  NewsletterWizardData,
  WizardStep,
} from "./types";
import { WizardProgress } from "./WizardProgress";

const DRAFTS_KEY = "newsletter-drafts";
const ACTIVE_DRAFT_KEY = "newsletter-draft-active";
const LEGACY_KEY = "newsletter-draft";

const STEPS: WizardStep[] = ["editor", "audience", "confirmation"];
const RESEND_STEPS: WizardStep[] = ["audience", "confirmation"];

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

function createDraft(data?: NewsletterWizardData): NewsletterDraft {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    data: data ?? getInitialData(),
  };
}

function loadDraftsFromStorage(): NewsletterDraft[] {
  return readLocalStorage<NewsletterDraft[]>(DRAFTS_KEY) ?? [];
}

function saveDraftsToStorage(drafts: NewsletterDraft[]): void {
  writeLocalStorage(DRAFTS_KEY, drafts);
}

function saveActiveIdToStorage(id: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(ACTIVE_DRAFT_KEY, id);
}

function initializeDrafts(): { drafts: NewsletterDraft[]; activeDraftId: string } {
  let drafts = loadDraftsFromStorage();

  if (drafts.length === 0) {
    const legacyData = readLocalStorage<NewsletterWizardData>(LEGACY_KEY);
    if (legacyData) {
      drafts = [createDraft(legacyData)];
      localStorage.removeItem(LEGACY_KEY);
      saveDraftsToStorage(drafts);
    }
  }

  if (drafts.length === 0) {
    const empty = createDraft();
    drafts = [empty];
    saveDraftsToStorage(drafts);
  }

  const savedActiveId = localStorage.getItem(ACTIVE_DRAFT_KEY) ?? "";
  const activeDraftId = drafts.find((d) => d.id === savedActiveId)?.id ?? drafts[0].id;

  return { drafts, activeDraftId };
}

interface NewsletterWizardProps {
  /** When set, the wizard enters resend mode: content is immutable, only audience is editable. */
  resendSlug?: string;
  resendData?: NewsletterWizardData;
}

export function NewsletterWizard({ resendSlug, resendData }: NewsletterWizardProps) {
  const t = useTranslations("newsletterEditor");
  const isResend = Boolean(resendSlug);
  const steps = isResend ? RESEND_STEPS : STEPS;

  const [currentStep, setCurrentStep] = useState<WizardStep>(isResend ? "audience" : "editor");
  const [data, setData] = useState<NewsletterWizardData>(resendData ?? getInitialData);
  const [drafts, setDrafts] = useState<NewsletterDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [audienceCounts, setAudienceCounts] = useState<AudienceCounts | null>(null);

  useEffect(() => {
    if (isResend) {
      setMounted(true);
      return;
    }
    const { drafts: initialDrafts, activeDraftId: initialActiveId } = initializeDrafts();
    const activeDraft = initialDrafts.find((d) => d.id === initialActiveId);
    setDrafts(initialDrafts);
    setActiveDraftId(initialActiveId);
    if (activeDraft) {
      setData(activeDraft.data);
    }
    setMounted(true);
  }, [isResend]);

  useEffect(() => {
    const fetchCounts = async () => {
      const token = await getValidAccessTokenAsync();
      if (!token) {
        return;
      }
      try {
        const res = await fetch(API_ROUTES.NEWSLETTER.AUDIENCE_COUNTS, {
          headers: createJsonAuthHeaders(token),
        });
        if (res.ok) {
          setAudienceCounts((await res.json()) as AudienceCounts);
        }
      } catch {
        // Counts are optional; silently skip on failure
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    if (isResend || !mounted || !activeDraftId) {
      return;
    }
    setDrafts((prev) => {
      const updated = prev.map((d) =>
        d.id === activeDraftId ? { ...d, data, updatedAt: Date.now() } : d,
      );
      saveDraftsToStorage(updated);
      return updated;
    });
  }, [data, mounted, activeDraftId, isResend]);

  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleSelectDraft = (id: string) => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft) {
      return;
    }
    setActiveDraftId(id);
    saveActiveIdToStorage(id);
    setData(draft.data);
    setCurrentStep("editor");
  };

  const handleNewDraft = () => {
    const newDraft = createDraft();
    const updated = [...drafts, newDraft];
    saveDraftsToStorage(updated);
    setDrafts(updated);
    setActiveDraftId(newDraft.id);
    saveActiveIdToStorage(newDraft.id);
    setData(getInitialData());
    setCurrentStep("editor");
  };

  const handleDeleteDraft = (id: string) => {
    const remaining = drafts.filter((d) => d.id !== id);
    const final = remaining.length > 0 ? remaining : [createDraft()];
    saveDraftsToStorage(final);
    setDrafts(final);

    if (id === activeDraftId) {
      const next = final[0];
      setActiveDraftId(next.id);
      saveActiveIdToStorage(next.id);
      setData(next.data);
      setCurrentStep("editor");
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

  const handleMoveSecondaryNews = (id: string, direction: "up" | "down") => {
    setData((prev) => {
      const idx = prev.secondaryNews.findIndex((s) => s.id === id);
      if (idx === -1) {
        return prev;
      }
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.secondaryNews.length) {
        return prev;
      }
      const updated = [...prev.secondaryNews];
      [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
      return { ...prev, secondaryNews: updated };
    });
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

  const recipientCount =
    data.audience.type === "manual"
      ? data.audience.manualEmails.length
      : (audienceCounts?.[data.audience.type] ?? null);

  if (!mounted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" className="text-rose-600 dark:text-rose-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <WizardProgress currentStep={currentStep} steps={steps} />
        {!isResend && (
          <DraftSelector
            drafts={drafts}
            activeDraftId={activeDraftId}
            onSelect={handleSelectDraft}
            onNew={handleNewDraft}
            onDelete={handleDeleteDraft}
          />
        )}
      </div>

      <div className="glass-card no-hover-pop overflow-hidden rounded-[24px] p-6 sm:p-8">
        {currentStep === "editor" && !isResend && (
          <EditorStep
            data={data}
            onUpdatePrimaryNews={handleUpdatePrimaryNews}
            onAddSecondaryNews={handleAddSecondaryNews}
            onUpdateSecondaryNews={handleUpdateSecondaryNews}
            onRemoveSecondaryNews={handleRemoveSecondaryNews}
            onMoveSecondaryNews={handleMoveSecondaryNews}
            onUpdateSubject={handleUpdateSubject}
            onUpdatePreviewText={handleUpdatePreviewText}
          />
        )}

        {currentStep === "audience" && (
          <AudienceStep
            data={data.audience}
            onUpdate={handleUpdateAudience}
            counts={audienceCounts}
          />
        )}

        {currentStep === "confirmation" && (
          <ConfirmationStep
            data={data}
            recipientCount={recipientCount}
            onSendAnother={!isResend ? handleNewDraft : undefined}
            resendSlug={resendSlug}
          />
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
