import type { Metadata } from "next";

import { allEvents } from "@/data/events-calendar";
import { buildTitleSubtitleMetadata } from "@/lib/metadata";

import { EventSurveyPageContent } from "./EventSurveyPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildTitleSubtitleMetadata({ ns: "eventsSurveyPage.meta" });
}

export default function EventSurveyPage() {
  return <EventSurveyPageContent events={allEvents} />;
}
