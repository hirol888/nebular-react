import React, { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  createStyles,
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import {
  dateFieldFormat,
  DateFieldIssue,
  DateFieldParts,
  DateFieldSegment,
  incrementPart,
  isDateFieldSegment,
  maxSegmentValue,
  parseParts,
  segmentLengths,
  validateParts
} from './date-field-parts';
import { useDefaultLocale } from '../Shared/hooks';

const useStyles = createStyles(() => ({
  root: {
    display: 'grid',
    gap: '0.35rem',
    minWidth: 0,
    color: 'var(--text-basic-color, #222b45)',
    fontFamily: 'inherit'
  },
  label: { fontSize: '0.875rem', fontWeight: 600, overflowWrap: 'anywhere' },
  description: { fontSize: '0.8125rem', overflowWrap: 'anywhere' },
  segments: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    justifySelf: 'start',
    alignItems: 'center',
    columnGap: '0.2rem',
    rowGap: '0.25rem',
    maxWidth: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    padding: '0.25rem 0.4rem',
    borderRadius: 'var(--date-field-border-radius, 0.375rem)',
    border: '1px solid var(--date-field-border-color, var(--border-basic-color-4, #c5cee0))',
    backgroundColor: 'var(--background-basic-color-1, #fff)',
    '&[data-invalid]': {
      borderColor: 'var(--date-field-invalid-border-color, var(--color-danger-600, #db2c66))'
    }
  },
  segment: {
    boxSizing: 'border-box',
    width: '2rem',
    minHeight: '2rem',
    border: 0,
    borderRadius: '0.25rem',
    padding: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
    '&[data-segment="year"]': { width: '3rem' },
    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    },
    '&::placeholder': { color: 'inherit' },
    '&:disabled': { opacity: 0.55, cursor: 'not-allowed' }
  },
  literal: { lineHeight: 1 },
  error: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    overflowWrap: 'anywhere'
  }
}));

export type DateFieldStylesNames = Selectors<typeof useStyles>;

export interface DateFieldProps
  extends
    DefaultProps<DateFieldStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  /** Controlled civil date as YYYY-MM-DD, or null when empty. */
  value?: string | null;
  /** Initial civil date for uncontrolled use. */
  defaultValue?: string | null;
  /** Reports a completed valid civil date, or null when cleared. */
  onChange?(value: string | null): void;
  /** BCP 47 locale for Gregorian segment ordering, separators and numerals. Defaults to en-US. */
  locale?: string;
  /** Inclusive minimum valid date as YYYY-MM-DD. */
  min?: string;
  /** Inclusive maximum valid date as YYYY-MM-DD. */
  max?: string;
  /** Visible label and the accessible name of the date group. */
  label?: React.ReactNode;
  /** Alternate accessible name of the group when no visible label is supplied. */
  ariaLabel?: string;
  /** Help text associated with each segment. */
  description?: React.ReactNode;
  /** Application validation error associated with each segment. */
  error?: React.ReactNode;
  /** Localized segment names and placeholders. */
  segmentLabels?: Partial<Record<DateFieldSegment, string>>;
  segmentPlaceholders?: Partial<Record<DateFieldSegment, string>>;
  /** Localized messages for built-in validation. */
  messages?: Partial<Record<DateFieldIssue, string>>;
  /** Name of the ISO date submitted with an enclosing form. */
  name?: string;
  /** Requires all segments before the form can be submitted. */
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

interface Draft {
  source: string | null;
  parts: DateFieldParts;
  validate: boolean;
}

const defaultProps = { locale: 'en-US', required: false, disabled: false, readOnly: false };
const defaultLabels = { day: 'Day', month: 'Month', year: 'Year' };
const defaultPlaceholders = { day: 'DD', month: 'MM', year: 'YYYY' };
const defaultMessages = {
  required: 'Enter a date',
  incomplete: 'Enter a complete date',
  invalid: 'Enter a valid date',
  bounds: 'Date is outside the allowed range'
};

export const DateField = forwardRef<HTMLDivElement, DateFieldProps>((props, ref) => {
  const defaultLocale = useDefaultLocale(props.locale);
  const { t } = useNebularLocale();
  const {
    value,
    defaultValue,
    onChange,
    locale,
    min,
    max,
    label,
    ariaLabel,
    description,
    error,
    segmentLabels,
    segmentPlaceholders,
    messages,
    name,
    required,
    disabled,
    readOnly,
    className,
    classNames,
    styles,
    unstyled,
    'aria-label': nativeLabel,
    'aria-labelledby': nativeLabelledBy,
    'aria-describedby': nativeDescription,
    ...others
  } = useComponentDefaultProps<DateFieldProps>({ ...defaultProps, locale: defaultLocale }, props);
  const { classes, cx } = useStyles(undefined, {
    name: 'date-field',
    classNames,
    styles,
    unstyled
  });
  const [current, setCurrent] = useUncontrolled({
    value,
    defaultValue,
    finalValue: null,
    onChange
  });
  const [draft, setDraft] = useState<Draft | null>(null);
  const inputs = useRef<Partial<Record<DateFieldSegment, HTMLInputElement | null>>>({});
  const id = useId();
  const format = useMemo(() => dateFieldFormat(locale ?? 'en-US'), [locale]);
  const segments = format.parts.map(({ type }) => type).filter(isDateFieldSegment);
  const editing = draft?.source === current ? draft : null;
  const parts = editing?.parts ?? parseParts(current);
  const checked = validateParts(parts, required ?? false, min, max);
  const issue =
    !editing && current && checked.value !== current && !checked.issue ? 'invalid' : checked.issue;
  const issueMessage = issue
    ? messages?.[issue] || t(`dateField.${issue}`, defaultMessages[issue])
    : '';
  const showIssue = editing?.validate || (!editing && Boolean(current));
  const visibleError = error ?? (showIssue && issueMessage);
  const groupLabel = ariaLabel ?? nativeLabel;
  const describedBy = [
    nativeDescription,
    description && `${id}-description`,
    visibleError && `${id}-error`
  ]
    .filter(Boolean)
    .join(' ');
  const customValidity =
    !disabled && !readOnly
      ? (typeof error === 'string' && error) ||
        issueMessage ||
        (error ? t('dateField.invalid', defaultMessages.invalid) : '')
      : '';

  useEffect(() => {
    Object.values(inputs.current).forEach((input) => input?.setCustomValidity(customValidity));
  }, [customValidity]);

  const commit = (next: DateFieldParts, revealIncomplete = true) => {
    const result = validateParts(next, required ?? false, min, max);
    if (result.issue) {
      if (result.issue === 'required') {
        setDraft({ source: null, parts: next, validate: true });
        if (current !== null) setCurrent(null);
        return;
      }
      setDraft({
        source: current,
        parts: next,
        validate: result.issue !== 'incomplete' || revealIncomplete
      });
      return;
    }
    setDraft(null);
    if (result.value !== current) setCurrent(result.value);
  };

  const editSegment = (segment: DateFieldSegment, text: string) => {
    if (disabled || readOnly) return;
    const limit = segmentLengths[segment];
    const textValue = format
      .normalize(text)
      .replace(/[^0-9]/g, '')
      .slice(0, limit);
    const next = { ...parts, [segment]: textValue };
    if (textValue.length === limit || !Object.values(next).some(Boolean)) {
      commit(next, false);
      if (textValue.length === limit)
        inputs.current[segments[segments.indexOf(segment) + 1]]?.focus();
    } else {
      setDraft({ source: current, parts: next, validate: false });
    }
  };

  const handleKey = (event: React.KeyboardEvent<HTMLInputElement>, segment: DateFieldSegment) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const input = event.currentTarget;
      const rtl = getComputedStyle(input).direction === 'rtl';
      const step = event.key === 'ArrowLeft' ? -1 : 1;
      const direction = rtl ? -step : step;
      const edge =
        direction < 0 ? input.selectionStart === 0 : input.selectionEnd === input.value.length;
      const neighbor = segments[segments.indexOf(segment) + direction];
      if (edge && neighbor) {
        event.preventDefault();
        inputs.current[neighbor]?.focus();
      }
    }
    if (readOnly || disabled) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      commit(incrementPart(parts, segment, event.key === 'ArrowUp' ? 1 : -1), false);
    }
    if (event.key === 'Enter' && editing) {
      event.preventDefault();
      commit(parts);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (readOnly || disabled) return;
    const pasted = format.normalize(event.clipboardData.getData('text')).trim();
    const iso = parseParts(pasted);
    if (iso.year) {
      event.preventDefault();
      commit(iso);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (editing && !disabled && !readOnly && !event.currentTarget.contains(event.relatedTarget)) {
      commit(parts);
    }
    others.onBlur?.(event);
  };

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)} onBlur={handleBlur}>
      {label != null && (
        <span id={`${id}-label`} className={classes.label}>
          {label}
        </span>
      )}
      {description != null && (
        <span id={`${id}-description`} className={classes.description}>
          {description}
        </span>
      )}
      <div
        className={classes.segments}
        role="group"
        aria-labelledby={
          nativeLabelledBy ?? (!groupLabel && label != null ? `${id}-label` : undefined)
        }
        aria-label={groupLabel ?? (label == null && !nativeLabelledBy ? 'Date' : undefined)}
        data-invalid={visibleError ? '' : undefined}
      >
        {format.parts.map(({ type, value: literal }, index) => {
          if (!isDateFieldSegment(type)) {
            return (
              <span key={index} aria-hidden="true" className={classes.literal}>
                {literal}
              </span>
            );
          }
          const number = Number(parts[type]);
          const maximum = maxSegmentValue(type, parts);
          return (
            <input
              key={type}
              ref={(input) => {
                inputs.current[type] = input;
              }}
              className={classes.segment}
              data-segment={type}
              type="text"
              role="spinbutton"
              inputMode="numeric"
              autoComplete="off"
              aria-label={segmentLabels?.[type] ?? t(`dateField.${type}`, defaultLabels[type])}
              aria-describedby={describedBy || undefined}
              aria-invalid={visibleError ? true : undefined}
              aria-valuemin={1}
              aria-valuemax={maximum}
              aria-valuenow={number > 0 && number <= maximum ? number : undefined}
              placeholder={segmentPlaceholders?.[type] ?? defaultPlaceholders[type]}
              value={format.translate(parts[type])}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) => editSegment(type, event.currentTarget.value)}
              onInvalid={() => setDraft({ source: current, parts, validate: true })}
              onKeyDown={(event) => handleKey(event, type)}
              onPaste={handlePaste}
            />
          );
        })}
      </div>
      {name && (
        <input
          type="hidden"
          name={name}
          value={issue ? '' : (checked.value ?? '')}
          disabled={disabled}
        />
      )}
      {visibleError && (
        <div id={`${id}-error`} role="alert" className={classes.error}>
          {visibleError}
        </div>
      )}
    </div>
  );
});

DateField.displayName = 'DateField';
