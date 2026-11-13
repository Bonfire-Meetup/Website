import type { Metadata } from "next";

import { getSurveyEvents } from "@/lib/events/event-views";
import { buildTitleSubtitleMetadata } from "@/lib/metadata";

import { EventSurveyPageContent } from "./EventSurveyPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildTitleSubtitleMetadata({ ns: "eventsSurveyPage.meta" });
}

export default async function EventSurveyPage() {
  return <EventSurveyPageContent events={await getSurveyEvents()} />;
}
