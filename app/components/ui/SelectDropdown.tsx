"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { ChevronDownIcon } from "../shared/icons";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownGroup {
  label: string;
  options: DropdownOption[];
}

function getDropdownLabel(
  value: string,
  options: DropdownOption[],
  groups: DropdownGroup[],
): string {
  const direct = options.find((option) => option.value === value);

  if (direct) {
    return direct.label;
  }

  for (const group of groups) {
    const match = group.options.find((option) => option.value === value);

    if (match) {
      return match.label;
    }
  }

  return value;
}

export function SelectDropdown({
  value,
  options,
  groups,
  onChange,
  buttonClassName = "",
  menuClassName = "",
  optionClassName = "",
  activeOptionClassName = "",
  nativeClassName = "",
  name,
  id,
  ariaInvalid,
  nativeOnMobile = false,
  required = false,
  disabled = false,
}: {
  value: string;
  options: DropdownOption[];
  groups?: DropdownGroup[];
  onChange: (nextValue: string) => void;
  buttonClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  activeOptionClassName?: string;
  nativeClassName?: string;
  name?: string;
  id?: string;
  ariaInvalid?: boolean;
  nativeOnMobile?: boolean;
  required?: boolean;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuWidth, setMenuWidth] = useState<number | null>(null);
  const [useNative, setUseNative] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const listboxId = useId();
  const resolvedGroups = groups ?? [];
  const label = getDropdownLabel(value, options, resolvedGroups);
  const optionLabels = useMemo(
    () => [
      ...options.map((option) => option.label),
      ...(groups ?? []).flatMap((group) => group.options.map((option) => option.label)),
    ],
    [options, groups],
  );

  useEffect(() => {
    if (!nativeOnMobile) {
      setUseNative(false);

      return;
    }

    const media = window.matchMedia("(max-width: 767px)");
    const handleChange = () => setUseNative(media.matches);
    handleChange();

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);

      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);

    return () => media.removeListener(handleChange);
  }, [nativeOnMobile]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const raf = requestAnimationFrame(() => {
      const minWidth = containerRef.current?.clientWidth ?? 0;
      const maxWidth = Math.floor(window.innerWidth * 0.9);
      let widest = 0;
      const measureElement = measureRef.current;

      if (measureElement) {
        optionLabels.forEach((text) => {
          measureElement.textContent = text;
          widest = Math.max(widest, measureElement.offsetWidth);
        });
      }

      const padded = widest + 48;
      const nextWidth = Math.min(maxWidth, Math.max(minWidth, padded));
      setMenuWidth(nextWidth || null);
    });

    return () => cancelAnimationFrame(raf);
  }, [isOpen, optionLabels]);

  const handleSelect = (nextValue: string) => {
    setIsOpen(false);

    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  if (useNative) {
    return (
      <select
        id={id}
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        onChange={(event) => onChange(event.target.value)}
        className={nativeClassName}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {resolvedGroups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <span
        ref={measureRef}
        className="invisible absolute -z-10 text-xs font-medium whitespace-nowrap sm:text-sm"
      />
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-invalid={ariaInvalid}
        aria-required={required}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2 text-left ${buttonClassName}`}
      >
        <span className="truncate">{label}</span>
        <ChevronDownIcon className="h-3 w-3 text-neutral-400" />
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          style={menuWidth ? { width: menuWidth } : undefined}
          className={`absolute left-0 z-50 mt-2 max-h-64 max-w-[min(36rem,90vw)] min-w-full overflow-x-hidden overflow-y-auto rounded-xl border border-black/5 bg-white/95 p-2 text-xs shadow-lg shadow-black/10 backdrop-blur sm:text-sm dark:border-white/10 dark:bg-neutral-950/95 ${menuClassName}`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              disabled={option.disabled}
              onClick={() => handleSelect(option.value)}
              data-option
              className={`flex w-full items-center rounded-lg px-3 py-2 text-left font-medium whitespace-normal transition ${
                option.value === value
                  ? activeOptionClassName ||
                    "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300"
                  : optionClassName ||
                    "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/10"
              } ${option.disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {option.label}
            </button>
          ))}

          {resolvedGroups.map((group) => (
            <div
              key={group.label}
              className="mt-2 border-t border-black/5 pt-2 dark:border-white/10"
            >
              <div className="px-3 pb-1 text-[10px] font-semibold tracking-[0.2em] text-neutral-400 uppercase">
                {group.label}
              </div>
              {group.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  data-option
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-left font-medium whitespace-normal transition ${
                    option.value === value
                      ? activeOptionClassName ||
                        "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300"
                      : optionClassName ||
                        "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/10"
                  } ${option.disabled ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
