import type { NewsletterSection } from "@/lib/types/newsletter";

export type { NewsletterSection };

export interface NewsletterAudience {
  type: "all" | "subscribers" | "registered" | "manual";
  manualEmails: string[];
}

export interface NewsletterWizardData {
  primaryNews: NewsletterSection;
  secondaryNews: NewsletterSection[];
  subject: string;
  previewText: string;
  audience: NewsletterAudience;
}

export type WizardStep = "editor" | "audience" | "confirmation";

export interface NewsletterDraft {
  id: string;
  createdAt: number;
  updatedAt: number;
  data: NewsletterWizardData;
}

export interface AudienceCounts {
  all: number;
  subscribers: number;
  registered: number;
}
