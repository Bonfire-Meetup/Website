interface RichTextProps {
  t: {
    rich: (
      key: string,
      components: {
        bold?: (chunks: React.ReactNode) => React.ReactNode;
        bullet?: (chunks: React.ReactNode) => React.ReactNode;
      },
    ) => React.ReactNode;
  };
  translationKey: string;
}

export function RichText({ t, translationKey }: RichTextProps) {
  return (
    <div className="space-y-2 leading-relaxed text-neutral-600 dark:text-neutral-400">
      {t.rich(translationKey, {
        bold: (chunks) => <strong className="text-neutral-900 dark:text-white">{chunks}</strong>,
        bullet: (chunks) => (
          <div className="flex gap-2">
            <span>•</span>
            <div>{chunks}</div>
          </div>
        ),
      })}
    </div>
  );
}
