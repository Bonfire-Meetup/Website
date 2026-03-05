import { StaticPageHero } from "@/components/layout/StaticPageHero";

interface EventsPageHeroProps {
  eyebrow: string;
  subtitle: string;
  title: React.ReactNode;
}

export function EventsPageHero({ eyebrow, subtitle, title }: EventsPageHeroProps) {
  return (
    <StaticPageHero
      backgroundVariant="events"
      eyebrow={eyebrow}
      heroWord="EVENTS"
      heroWordSize="md"
      subtitle={subtitle}
      title={title}
    />
  );
}
