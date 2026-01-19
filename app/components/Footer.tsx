import { getTranslations } from "next-intl/server";

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15A2.25 2.25 0 0 1 2.25 17.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75m19.5 0-9.75 6.75L2.25 6.75"
      />
    </svg>
  );
}

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="glass relative mt-auto overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <p className="text-lg font-bold text-neutral-900 dark:text-white">{t("brandName")}</p>
            <p className="text-center text-xs text-neutral-500 md:text-left dark:text-neutral-400">
              {t("vibes")}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 md:items-end">
            <div className="flex items-center gap-2">
              <a
                href="mailto:hello@bnf.events"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100/80 text-neutral-500 transition-all duration-300 hover:bg-brand-100 hover:text-brand-700 hover:scale-105 dark:bg-white/5 dark:hover:bg-brand-500/15 dark:hover:text-brand-300"
                aria-label={t("emailLabel")}
              >
                <MailIcon className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/playlist?list=PL5JjhpXFzfZp51YDuRgc9w6JVJUM9EQaN"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100/80 text-neutral-500 transition-all duration-300 hover:bg-red-100 hover:text-red-600 hover:scale-105 dark:bg-white/5 dark:hover:bg-red-500/15 dark:hover:text-red-400"
                aria-label={t("youtubeLabel")}
              >
                <YouTubeIcon className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/bonfire.meetup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100/80 text-neutral-500 transition-all duration-300 hover:bg-neutral-200 hover:text-neutral-900 hover:scale-105 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={t("facebookLabel")}
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="https://discord.com/invite/8Tqm7vAd4h"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100/80 text-neutral-500 transition-all duration-300 hover:bg-indigo-100 hover:text-indigo-600 hover:scale-105 dark:bg-white/5 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-400"
                aria-label={t("discordLabel")}
              >
                <DiscordIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-4 text-center text-xs text-neutral-500 sm:flex-row sm:text-left dark:border-white/10 dark:text-neutral-500">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-4">
            <a
              href="/crew"
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-300"
            >
              {t("crewLabel")}
            </a>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <a
              href="/legal"
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-300"
            >
              {t("legalLabel")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
