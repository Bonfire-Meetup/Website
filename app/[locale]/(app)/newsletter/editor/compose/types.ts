export interface NewsletterSection {
  id: string;
  title: string;
  text: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

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
