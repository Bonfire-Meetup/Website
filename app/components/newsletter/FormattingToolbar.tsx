"use client";

import type { RefObject } from "react";

interface FormattingToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
}

interface WrapConfig {
  before: string;
  after: string;
  placeholder: string;
}

function wrapSelection(
  textarea: HTMLTextAreaElement,
  { before, after, placeholder }: WrapConfig,
  onChange: (value: string) => void,
) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end) || placeholder;
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  onChange(next);

  requestAnimationFrame(() => {
    textarea.focus();
    const cursorStart = start + before.length;
    const cursorEnd = cursorStart + selected.length;
    textarea.setSelectionRange(cursorStart, cursorEnd);
  });
}

function insertLink(textarea: HTMLTextAreaElement, onChange: (value: string) => void) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end) || "link text";
  // eslint-disable-next-line no-alert
  const url = prompt("URL:");
  if (!url) {
    return;
  }

  const snippet = `[${selected}](${url})`;
  const next = value.slice(0, start) + snippet + value.slice(end);
  onChange(next);

  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(start, start + snippet.length);
  });
}

const TOOLS: (
  | { type: "wrap"; label: string; title: string; config: WrapConfig; className?: string }
  | { type: "link"; label: string; title: string; className?: string }
  | { type: "divider" }
)[] = [
  {
    type: "wrap",
    label: "B",
    title: "Bold (**text**)",
    config: { before: "**", after: "**", placeholder: "bold text" },
    className: "font-bold",
  },
  {
    type: "wrap",
    label: "I",
    title: "Italic (*text*)",
    config: { before: "*", after: "*", placeholder: "italic text" },
    className: "italic",
  },
  {
    type: "wrap",
    label: "U",
    title: "Underline (__text__)",
    config: { before: "__", after: "__", placeholder: "underlined text" },
    className: "underline",
  },
  { type: "divider" },
  { type: "link", label: "Link", title: "Insert link ([text](url))" },
];

export function FormattingToolbar({ textareaRef, onChange }: FormattingToolbarProps) {
  return (
    <div className="mb-1.5 flex items-center gap-0.5 rounded-lg border border-neutral-200/80 bg-neutral-50 px-2 py-1.5 dark:border-white/10 dark:bg-white/5">
      {TOOLS.map((tool) => {
        if (tool.type === "divider") {
          return (
            <span
              key="divider"
              className="mx-1 h-4 w-px bg-neutral-300 dark:bg-white/20"
              aria-hidden="true"
            />
          );
        }

        return (
          <button
            key={tool.label}
            type="button"
            title={tool.title}
            onMouseDown={(e) => {
              e.preventDefault();
              const textarea = textareaRef.current;
              if (!textarea) {
                return;
              }
              if (tool.type === "link") {
                insertLink(textarea, onChange);
              } else {
                wrapSelection(textarea, tool.config, onChange);
              }
            }}
            className={`inline-flex h-7 min-w-[28px] cursor-pointer items-center justify-center rounded px-1.5 text-sm text-neutral-600 transition hover:bg-neutral-200/70 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white ${tool.className ?? ""}`}
          >
            {tool.label}
          </button>
        );
      })}
    </div>
  );
}
