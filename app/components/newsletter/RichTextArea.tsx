"use client";

import { useRef, useState } from "react";

import { renderMarkdownToHtml } from "@/lib/utils/newsletter-markdown";

import { FormattingToolbar } from "./FormattingToolbar";

interface RichTextAreaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const CHAR_WARN = 600;
const CHAR_MAX = 900;

export function RichTextArea({ id, value, onChange, placeholder, rows = 12 }: RichTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");

  const charCount = value.length;
  const charColor =
    charCount >= CHAR_MAX
      ? "text-rose-500 dark:text-rose-400"
      : charCount >= CHAR_WARN
        ? "text-amber-500 dark:text-amber-400"
        : "text-neutral-400 dark:text-neutral-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <div className="flex rounded-lg border border-neutral-200/80 bg-neutral-100/60 p-0.5 dark:border-white/10 dark:bg-white/5">
          {(["write", "preview"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                mode === m
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-white/10 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <span className={`ml-auto text-xs tabular-nums ${charColor}`}>
          {charCount.toLocaleString()} chars
        </span>
      </div>

      {mode === "write" ? (
        <>
          <FormattingToolbar textareaRef={textareaRef} onChange={onChange} />
          <textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="form-input-base form-input w-full resize-y"
          />
        </>
      ) : (
        <div
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-700 dark:border-white/10 dark:bg-white/3 dark:text-neutral-300 [&_p]:mb-3 [&_p:last-child]:mb-0"
          style={{ minHeight: `${rows * 1.625}rem` }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: value.trim()
              ? renderMarkdownToHtml(value)
              : `<span class="text-neutral-400 dark:text-neutral-500">${placeholder ?? ""}</span>`,
          }}
        />
      )}
    </div>
  );
}
