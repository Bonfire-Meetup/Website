import type { ReactNode } from "react";

interface RichTextProps {
  t: {
    rich: (
      key: string,
      components: {
        bold?: (chunks: ReactNode) => ReactNode;
        bullet?: (chunks: ReactNode) => ReactNode;
      },
    ) => ReactNode;
  };
  translationKey: string;
}

const richTextBold = (chunks: ReactNode) => (
  <strong className="text-neutral-900 dark:text-white">{chunks}</strong>
);

const richTextBullet = (chunks: ReactNode) => (
  <div className="flex gap-2">
    <span>•</span>
    <div>{chunks}</div>
  </div>
);

const RICH_TEXT_COMPONENTS = {
  bold: richTextBold,
  bullet: richTextBullet,
};

export function RichText({ t, translationKey }: RichTextProps) {
  return (
    <div className="space-y-2 leading-relaxed text-neutral-600 dark:text-neutral-400">
      {t.rich(translationKey, RICH_TEXT_COMPONENTS)}
    </div>
  );
}
