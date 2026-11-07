import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { matchesQuery } from "../../hooks/useFilter";
import styles from "./SearchableSelect.module.css";

export interface SearchableOption {
  value: string;
  label: string;
  description?: string;
  /** Extra terms that match the query but are never rendered. */
  keywords?: string[];
}

interface Props {
  id?: string;
  label?: string;
  options: SearchableOption[];
  value: string;
  placeholder?: string;
  emptyLabel?: string;
  invalid?: boolean;
  clearOnSelect?: boolean;
  autoFocus?: boolean;
  onChange: (value: string, label: string) => void;
}

export function SearchableSelect({
  id,
  label,
  options,
  value,
  placeholder,
  emptyLabel,
  invalid = false,
  clearOnSelect = false,
  autoFocus = false,
  onChange,
}: Props) {
  const [text, setText] = useState(
    () => options.find((option) => option.value === value)?.label ?? "",
  );
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    // An empty value means the user is typing: resyncing would wipe the text.
    if (value) setText(selected ? selected.label : "");
  }

  const selectedLabel = selected?.label ?? "";

  const filtered = useMemo(() => {
    // The text may only be showing the current selection, not a search query.
    if (!text.trim() || text === selectedLabel) return options;
    return options.filter((option) =>
      matchesQuery(
        [option.label, option.description ?? "", ...(option.keywords ?? [])],
        text,
      ),
    );
  }, [options, text, selectedLabel]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSelect = (option: SearchableOption) => {
    setText(clearOnSelect ? "" : option.label);
    setOpen(false);
    setActiveIndex(-1);
    onChange(option.value, option.label);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, filtered.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      if (!open || activeIndex < 0) return;
      event.preventDefault();
      handleSelect(filtered[activeIndex]);
      return;
    }
    if (event.key === "Escape") {
      event.stopPropagation();
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open && id ? `${id}-listbox` : undefined}
        aria-activedescendant={
          open && activeIndex >= 0 && id
            ? `${id}-option-${activeIndex}`
            : undefined
        }
        autoComplete="off"
        autoFocus={autoFocus}
        className={`${styles.input} ${invalid ? styles.invalid : ""}`}
        value={text}
        placeholder={placeholder}
        onFocus={(event) => {
          setOpen(true);
          // Typing must replace the selected label instead of appending to it.
          if (text && text === selectedLabel) event.target.select();
        }}
        onKeyDown={handleKeyDown}
        onChange={(event) => {
          setText(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
          onChange("", event.target.value);
        }}
      />
      {open && (
        <ul
          className={styles.list}
          role="listbox"
          id={id ? `${id}-listbox` : undefined}
        >
          {filtered.length === 0 && (
            <li className={styles.empty}>{emptyLabel}</li>
          )}
          {filtered.map((option, index) => (
            <li
              key={option.value}
              role="option"
              id={id ? `${id}-option-${index}` : undefined}
              aria-selected={index === activeIndex}
              className={index === activeIndex ? styles.optionActive : undefined}
            >
              <button
                type="button"
                className={styles.option}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSelect(option)}
              >
                <span className={styles.optionLabel}>{option.label}</span>
                {option.description && (
                  <span className={styles.optionDescription}>
                    {option.description}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
