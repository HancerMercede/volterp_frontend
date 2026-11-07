import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { normalizeSearch } from "../../utils/normalizeSearch";
import styles from "./SearchableSelect.module.css";

export interface SearchableOption {
  value: string;
  label: string;
  description?: string;
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
  onChange,
}: Props) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(selected ? selected.label : "");
  }

  const filtered = useMemo(() => {
    const query = normalizeSearch(text);
    if (!query) return options;
    return options.filter(
      (option) =>
        normalizeSearch(option.label).includes(query) ||
        (option.description
          ? normalizeSearch(option.description).includes(query)
          : false),
    );
  }, [options, text]);

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
        className={`${styles.input} ${invalid ? styles.invalid : ""}`}
        value={text}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
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
