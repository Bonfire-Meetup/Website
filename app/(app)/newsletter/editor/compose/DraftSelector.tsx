"use client";

import { useEffect, useRef, useState } from "react";

import { CheckIcon, ChevronDownIcon, PlusIcon, XIcon } from "@/components/shared/Icons";

import type { NewsletterDraft } from "./types";

interface DraftSelectorProps {
  drafts: NewsletterDraft[];
  activeDraftId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

function formatRelativeDate(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) {
    return "Just now";
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return new Date(timestamp).toLocaleDateString();
}

export function DraftSelector({
  drafts,
  activeDraftId,
  onSelect,
  onNew,
  onDelete,
}: DraftSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeDraft = drafts.find((d) => d.id === activeDraftId);
  const activeName = activeDraft?.data.subject.trim() || "Untitled";

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-white/60 px-3 py-1.5 text-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">Draft:</span>
        <span className="max-w-[160px] truncate font-medium text-neutral-700 dark:text-neutral-300">
          {activeName}
        </span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform dark:text-neutral-500 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 z-50 mt-1.5 w-64 overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-lg dark:border-white/10 dark:bg-neutral-900 dark:shadow-black/40"
        >
          <div className="max-h-60 overflow-y-auto py-1">
            {drafts.map((draft) => {
              const name = draft.data.subject.trim() || "Untitled";
              const isActive = draft.id === activeDraftId;
              return (
                <div
                  key={draft.id}
                  role="option"
                  aria-selected={isActive}
                  className={`group flex items-center gap-2 px-3 py-2 ${
                    isActive
                      ? "bg-rose-50 dark:bg-rose-500/10"
                      : "hover:bg-neutral-50 dark:hover:bg-white/5"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(draft.id);
                      setOpen(false);
                    }}
                    className="flex min-w-0 flex-1 flex-col text-left"
                  >
                    <span
                      className={`truncate text-sm font-medium ${
                        isActive
                          ? "text-rose-700 dark:text-rose-300"
                          : "text-neutral-800 dark:text-neutral-200"
                      }`}
                    >
                      {name}
                    </span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      {formatRelativeDate(draft.updatedAt)}
                    </span>
                  </button>

                  {isActive ? (
                    <CheckIcon className="h-3.5 w-3.5 shrink-0 text-rose-500 dark:text-rose-400" />
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(draft.id);
                      }}
                      aria-label="Delete draft"
                      className="invisible rounded p-0.5 text-neutral-400 group-hover:visible hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-neutral-100 p-1 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                onNew();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-white/5"
            >
              <PlusIcon className="h-4 w-4" />
              New Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
