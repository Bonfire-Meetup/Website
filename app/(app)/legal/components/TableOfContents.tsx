interface TableOfContentsProps {
  tToc: (key: string) => string;
}

export function TableOfContents({ tToc }: TableOfContentsProps) {
  return (
    <section className="rounded-xl border border-neutral-200/70 bg-gradient-to-br from-neutral-50/50 to-white/50 p-6 shadow-sm dark:border-white/10 dark:from-neutral-950/50 dark:to-neutral-900/50 dark:shadow-neutral-950/20">
      <h2 className="mb-4 text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {tToc("title")}
      </h2>
      <nav className="space-y-2">
        <a
          href="#code-of-conduct"
          className="group hover:bg-brand-500/10 hover:text-brand-600 dark:hover:bg-brand-400/10 dark:hover:text-brand-400 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-700 transition-all hover:shadow-sm dark:text-neutral-300"
        >
          <span className="bg-brand-500/10 text-brand-600 group-hover:bg-brand-500/20 group-hover:text-brand-700 dark:bg-brand-400/20 dark:text-brand-400 dark:group-hover:bg-brand-400/30 dark:group-hover:text-brand-300 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-colors">
            1
          </span>
          <span>{tToc("codeOfConduct")}</span>
        </a>
        <a
          href="#privacy-policy"
          className="group hover:bg-brand-500/10 hover:text-brand-600 dark:hover:bg-brand-400/10 dark:hover:text-brand-400 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-700 transition-all hover:shadow-sm dark:text-neutral-300"
        >
          <span className="bg-brand-500/10 text-brand-600 group-hover:bg-brand-500/20 group-hover:text-brand-700 dark:bg-brand-400/20 dark:text-brand-400 dark:group-hover:bg-brand-400/30 dark:group-hover:text-brand-300 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-colors">
            2
          </span>
          <span>{tToc("privacyPolicy")}</span>
        </a>
        <a
          href="#terms-of-service"
          className="group hover:bg-brand-500/10 hover:text-brand-600 dark:hover:bg-brand-400/10 dark:hover:text-brand-400 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-700 transition-all hover:shadow-sm dark:text-neutral-300"
        >
          <span className="bg-brand-500/10 text-brand-600 group-hover:bg-brand-500/20 group-hover:text-brand-700 dark:bg-brand-400/20 dark:text-brand-400 dark:group-hover:bg-brand-400/30 dark:group-hover:text-brand-300 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-colors">
            3
          </span>
          <span>{tToc("termsOfService")}</span>
        </a>
      </nav>
    </section>
  );
}
