import React, { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useMergedRef } from '@nebular-react/hooks';

export interface MentionItem {
  id: string;
  label: string;
  avatar?: React.ReactNode;
}

export interface MentionToken {
  /** Index of the trigger character. */
  start: number;
  /** Caret position when the token was resolved. */
  end: number;
  /** Text typed between the trigger and the caret. */
  query: string;
}

/**
 * Resolves the mention token that ends at `caret`. Returns null when the caret is
 * not inside a token (no trigger, or whitespace between the trigger and the caret).
 */
export function findMentionToken(
  text: string,
  caret: number,
  trigger: string = '@'
): MentionToken | null {
  const safeCaret = Math.max(0, Math.min(caret, text.length));
  const upToCaret = text.slice(0, safeCaret);
  const start = upToCaret.lastIndexOf(trigger);

  if (start === -1) {
    return null;
  }

  const query = upToCaret.slice(start + trigger.length);

  if (/\s/.test(query)) {
    return null;
  }

  return { start, end: safeCaret, query };
}

/** Replaces the mention token with `trigger + label + ' '`, keeping the surrounding text. */
export function applyMention(
  text: string,
  token: MentionToken,
  label: string,
  trigger: string = '@'
): string {
  return `${text.slice(0, token.start)}${trigger}${label} ${text.slice(token.end)}`;
}

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    width: '100%',
    fontFamily: 'inherit'
  },

  label: {
    color: 'var(--mentions-label-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--mentions-label-font-size, 0.8125rem)',
    fontWeight: 600
  },

  input: {
    width: '100%',
    height: 'var(--mentions-height, 2.5rem)',
    padding: '0 0.625rem',
    border: '1px solid var(--mentions-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--mentions-border-radius, 0.25rem)',
    backgroundColor: 'var(--mentions-background-color, transparent)',
    color: 'var(--mentions-text-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    fontSize: 'var(--mentions-font-size, 0.8125rem)',

    '&::placeholder': {
      color: 'var(--mentions-placeholder-color, var(--text-hint-color, #8f9bb3))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    },

    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  },

  inputError: {
    borderColor: 'var(--mentions-error-color, var(--color-danger-500, #ff3d71))'
  },

  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    margin: '0.25rem 0 0',
    padding: '0.25rem',
    listStyle: 'none',
    border: '1px solid var(--mentions-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--mentions-border-radius, 0.25rem)',
    backgroundColor:
      'var(--mentions-dropdown-background-color, var(--background-basic-color-1, #fff))',
    boxShadow: 'var(--mentions-shadow, 0 4px 14px rgba(34, 43, 69, 0.12))',
    maxHeight: '13rem',
    overflowY: 'auto'
  },

  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.5rem',
    borderRadius: '0.2rem',
    color: 'var(--mentions-option-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--mentions-font-size, 0.8125rem)',
    cursor: 'pointer',

    '&[aria-selected="true"]': {
      backgroundColor:
        'var(--mentions-option-active-background-color, var(--color-primary-100, #e6ecff))'
    }
  },

  avatar: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '1.25rem',
    height: '1.25rem',
    overflow: 'hidden',
    borderRadius: '50%',
    fontSize: '0.6875rem'
  },

  optionLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  empty: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    margin: '0.25rem 0 0',
    padding: '0.4rem 0.5rem',
    border: '1px solid var(--mentions-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--mentions-border-radius, 0.25rem)',
    backgroundColor:
      'var(--mentions-dropdown-background-color, var(--background-basic-color-1, #fff))',
    color: 'var(--mentions-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--mentions-font-size, 0.8125rem)'
  },

  error: {
    color: 'var(--mentions-error-color, var(--color-danger-500, #ff3d71))',
    fontSize: 'var(--mentions-error-font-size, 0.75rem)'
  }
}));

export type MentionsStylesNames = Selectors<typeof useStyles>;

export interface MentionsProps extends DefaultProps<MentionsStylesNames> {
  value?: string;
  defaultValue?: string;
  onChange?(value: string): void;
  data: MentionItem[];
  trigger?: string;
  maxSuggestions?: number;
  placeholder?: string;
  label?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  onSearch?(query: string): void;
}

const defaultProps: Partial<MentionsProps> = {
  trigger: '@',
  maxSuggestions: 5,
  disabled: false
};

const _Mentions = forwardRef<HTMLInputElement, MentionsProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    data,
    trigger,
    maxSuggestions,
    placeholder,
    label,
    error,
    disabled,
    ariaLabel,
    onSearch,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'mentions', classNames, styles, unstyled });

  const [internalValue, setInternalValue] = useState<string>(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const [token, setToken] = useState<MentionToken | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRef(inputRef, ref);
  const caretRef = useRef<number | null>(null);
  const pendingCaretRef = useRef<number | null>(null);
  const lastQueryRef = useRef<string | null>(null);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const reactId = useId();
  const id = `mentions-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const listboxId = `${id}-listbox`;

  const suggestions = useMemo(() => {
    if (token === null) {
      return [];
    }

    const query = token.query.toLowerCase();

    return data
      .filter((item) => item.label.toLowerCase().includes(query))
      .slice(0, Math.max(0, maxSuggestions));
  }, [data, maxSuggestions, token]);

  const syncToken = (text: string, caret: number) => {
    if (disabled) {
      setToken(null);
      lastQueryRef.current = null;
      return;
    }

    const nextToken = findMentionToken(text, caret, trigger);

    setToken(nextToken);
    setActiveIndex(0);

    if (nextToken === null) {
      lastQueryRef.current = null;
      return;
    }

    if (lastQueryRef.current !== nextToken.query) {
      lastQueryRef.current = nextToken.query;
      onSearchRef.current?.(nextToken.query);
    }
  };

  // Keeps the suggestions in sync with external value changes (controlled usage) and
  // with the initial value, so a prefilled `@query` opens the list right away.
  useEffect(() => {
    if (disabled) {
      setToken(null);
      lastQueryRef.current = null;
      return;
    }

    const caret = caretRef.current ?? currentValue.length;
    const nextToken = findMentionToken(currentValue, caret, trigger);

    setToken(nextToken);
    setActiveIndex(0);

    if (nextToken !== null && lastQueryRef.current !== nextToken.query) {
      lastQueryRef.current = nextToken.query;
      onSearchRef.current?.(nextToken.query);
    }

    if (nextToken === null) {
      lastQueryRef.current = null;
    }
  }, [currentValue, disabled, trigger]);

  useEffect(() => {
    if (pendingCaretRef.current === null) {
      return;
    }

    const caret = pendingCaretRef.current;
    pendingCaretRef.current = null;
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.focus();
    input.setSelectionRange(caret, caret);
  }, [currentValue]);

  useEffect(() => {
    if (token === null) {
      return undefined;
    }

    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setToken(null);
      }
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);

    return () => document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [token]);

  const commitValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    typeof onChange === 'function' && onChange(nextValue);
  };

  const selectSuggestion = (item: MentionItem) => {
    if (token === null) {
      return;
    }

    const nextValue = applyMention(currentValue, token, item.label, trigger);
    const caret = token.start + trigger.length + item.label.length + 1;

    caretRef.current = caret;
    pendingCaretRef.current = caret;
    lastQueryRef.current = null;

    commitValue(nextValue);
    setToken(null);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    const caret = event.target.selectionStart ?? nextValue.length;

    caretRef.current = caret;
    commitValue(nextValue);
    syncToken(nextValue, caret);
  };

  const handleSelect = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    caretRef.current = input.selectionStart;
    syncToken(input.value, input.selectionStart ?? input.value.length);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (token === null || suggestions.length === 0) {
      if (event.key === 'Escape' && token !== null) {
        event.preventDefault();
        setToken(null);
      }

      return;
    }

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % suggestions.length);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
        break;
      }
      case 'Enter': {
        event.preventDefault();
        selectSuggestion(suggestions[Math.min(activeIndex, suggestions.length - 1)]);
        break;
      }
      case 'Escape': {
        event.preventDefault();
        setToken(null);
        break;
      }
      default:
        break;
    }
  };

  const isOpen = !disabled && token !== null;
  const hasOptions = suggestions.length > 0;
  const activeOption = hasOptions
    ? suggestions[Math.min(activeIndex, suggestions.length - 1)]
    : undefined;

  return (
    <div ref={rootRef} className={cx(classes.root, className)}>
      {label && (
        <label className={cx(classes.label)} htmlFor={id}>
          {label}
        </label>
      )}

      <input
        id={id}
        ref={mergedRef}
        type="text"
        className={cx(classes.input, { [classes.inputError]: Boolean(error) })}
        value={currentValue}
        placeholder={placeholder}
        disabled={disabled}
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-controls={isOpen && hasOptions ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          isOpen && activeOption ? `${id}-option-${activeOption.id}` : undefined
        }
        aria-invalid={error ? true : undefined}
        onChange={handleChange}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
      />

      {isOpen && hasOptions && (
        <ul id={listboxId} role="listbox" className={cx(classes.dropdown)}>
          {suggestions.map((item, index) => (
            <li
              key={item.id}
              id={`${id}-option-${item.id}`}
              role="option"
              aria-selected={index === activeIndex}
              className={cx(classes.option)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectSuggestion(item)}
            >
              {item.avatar && <span className={cx(classes.avatar)}>{item.avatar}</span>}
              <span className={cx(classes.optionLabel)}>{item.label}</span>
            </li>
          ))}
        </ul>
      )}

      {isOpen && !hasOptions && (
        <div className={cx(classes.empty)} role="status">
          No suggestions
        </div>
      )}

      {error && (
        <div className={cx(classes.error)} role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

_Mentions.displayName = 'Mentions';

export { _Mentions as Mentions };
