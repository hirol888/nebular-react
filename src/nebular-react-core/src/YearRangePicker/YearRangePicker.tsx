import React, { useEffect, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularDir
} from '@nebular-react/styles';
import {
  useFlexibleConnectedPositionStrategy,
  useId,
  useOverlay,
  useOverlayClickOutside,
  useOverlayTrigger
} from '@nebular-react/hooks';
import { Button } from '../Button';
import { FormControl } from '../FormControl';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { OptionalPortal } from '../OptionalPortal';

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'relative',
    width: '100%'
  },

  input: {
    cursor: 'pointer'
  },

  clearButton: {
    position: 'absolute',
    top: '50%',
    right: '0.5rem',
    transform: 'translateY(-50%)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.15rem',
    border: 0,
    background: 'transparent',
    color: 'var(--year-range-picker-clear-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',
    zIndex: 1,

    '&:focus-visible': {
      outline: '2px solid var(--year-range-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  panel: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 'var(--year-range-picker-min-width, 18rem)',
    backgroundColor:
      'var(--year-range-picker-background-color, var(--background-basic-color-1, #fff))',
    border: '1px solid var(--year-range-picker-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--year-range-picker-border-radius, 0.25rem)',
    boxShadow: 'var(--year-range-picker-shadow, 0 4px 12px rgba(0, 0, 0, 0.12))',
    overflow: 'hidden',

    '&:focus': {
      outline: 'none'
    },

    '&:focus-visible': {
      outline: '2px solid var(--year-range-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.25rem',
    padding: '0.5rem'
  },

  navButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.75rem',
    padding: 0,
    border: 0,
    borderRadius: '0.25rem',
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--year-range-picker-nav-hover-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--year-range-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  pageLabel: {
    flex: '1 1 auto',
    textAlign: 'center',
    fontSize: '0.875rem',
    fontWeight: 600
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '0.25rem',
    padding: '0 0.5rem 0.5rem'
  },

  yearButton: {
    padding: '0.5rem 0.25rem',
    border: 0,
    borderRadius: '0.25rem',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',
    cursor: 'pointer',

    '&[data-in-range="true"]': {
      backgroundColor:
        'var(--year-range-picker-range-background-color, var(--color-primary-transparent-100, #e3efff))'
    },

    '&[data-range-start="true"], &[data-range-end="true"]': {
      backgroundColor:
        'var(--year-range-picker-selected-background-color, var(--color-primary-500, #3366ff))',
      color: 'var(--year-range-picker-selected-color, #fff)'
    },

    '&:hover:not(:disabled)': {
      backgroundColor:
        'var(--year-range-picker-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--year-range-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    },

    '&:disabled': {
      color: 'var(--year-range-picker-disabled-color, var(--text-disabled-color, #c5cee0))',
      cursor: 'not-allowed',
      opacity: 0.6
    }
  },

  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    padding: '0.5rem',
    borderTop:
      '1px solid var(--year-range-picker-border-color, var(--border-basic-color-3, #e4e9f2))'
  }
}));

export type YearRangePickerStylesNames = Selectors<typeof useStyles>;

export interface YearRange {
  start: number | null;
  end: number | null;
}

export interface YearRangePickerProps extends DefaultProps<YearRangePickerStylesNames> {
  value?: YearRange;
  defaultValue?: YearRange;
  onChange?(range: YearRange): void;
  min?: number;
  max?: number;
  visibleYear?: number;
  clearable?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  placeholder?: string;
  dropdownOffset?: number;
}

const YEARS_PER_PAGE = 12;

const defaultProps: Partial<YearRangePickerProps> = {
  clearable: false,
  disabled: false,
  dropdownOffset: 8
};

function getPageStart(year: number): number {
  return Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;
}

function YearRangePicker(props: YearRangePickerProps) {
  const {
    value,
    defaultValue,
    onChange,
    min,
    max,
    visibleYear,
    clearable,
    label,
    description,
    error,
    disabled,
    ariaLabel,
    placeholder,
    dropdownOffset,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'year-range-picker',
    classNames,
    styles,
    unstyled
  });

  const dir = useNebularDir();
  const uuid = useId();

  const [internalValue, setInternalValue] = useState<YearRange | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const [opened, setOpened] = useState(false);
  const [pageStart, setPageStart] = useState<number>(() =>
    getPageStart(visibleYear ?? new Date().getFullYear())
  );
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [draft, setDraft] = useState<YearRange>({ start: null, end: null });
  const shouldFocusRef = useRef(false);
  const triggerRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const displayValue = currentValue ?? { start: null, end: null };

  const formatRange = (_range: YearRange): string => {
    if (_range.start !== null && _range.end !== null) {
      return `${_range.start} - ${_range.end}`;
    }

    if (_range.start !== null) {
      return `${_range.start}`;
    }

    if (_range.end !== null) {
      return `${_range.end}`;
    }

    return '';
  };

  const commit = (next: YearRange) => {
    if (!isControlled) {
      setInternalValue(next);
    }

    typeof onChange === 'function' && onChange(next);
  };

  const show = () => {
    if (disabled) {
      return;
    }

    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (!visible) {
      const baseYear = currentValue?.start ?? visibleYear ?? new Date().getFullYear();
      const page = getPageStart(baseYear);

      setPageStart(page);
      setFocusedIndex(currentValue?.start ? currentValue.start - page : 0);
      setDraft(currentValue ?? { start: null, end: null });
      shouldFocusRef.current = true;
      setOpened(true);
    }
  };
  const hide = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (visible) {
      setOpened(false);
    }
  };

  const { apply, paneRef, boundingBoxRef } = useFlexibleConnectedPositionStrategy(
    'bottom',
    'vertical',
    triggerRef.current,
    dir,
    dropdownOffset
  );
  useOverlay({
    apply,
    paneRef,
    paneWrapperRef: boundingBoxRef,
    opened,
    scrollStrategy: 'reposition'
  });
  useOverlayTrigger(triggerRef, paneRef, boundingBoxRef, 'click', show, hide);
  useOverlayClickOutside([paneRef, triggerRef], hide);

  useEffect(() => {
    if (!opened || !shouldFocusRef.current) {
      return;
    }

    const focusedButton = panelRef.current?.querySelector<HTMLButtonElement>(
      '[data-year-focused="true"]'
    );
    focusedButton?.focus();
    shouldFocusRef.current = false;
  }, [focusedIndex, opened, pageStart]);

  const years = Array.from({ length: YEARS_PER_PAGE }, (_, index) => pageStart + index);

  const isYearDisabled = (year: number): boolean =>
    (min !== undefined && year < min) || (max !== undefined && year > max);

  const isInDraftRange = (year: number): boolean => {
    if (draft.start === null || draft.end === null) {
      return draft.start === year;
    }

    return year >= draft.start && year <= draft.end;
  };

  const selectYear = (year: number) => {
    if (isYearDisabled(year)) {
      return;
    }

    setDraft((previous) => {
      if (previous.start === null || previous.end !== null) {
        return { start: year, end: null };
      }

      if (year < previous.start) {
        return { start: year, end: null };
      }

      return { start: previous.start, end: year };
    });
  };

  const applyRange = () => {
    if (draft.start === null || draft.end === null) {
      return;
    }

    commit({ start: draft.start, end: draft.end });
    hide();
    triggerRef.current?.focus();
  };

  const clearRange = () => {
    commit({ start: null, end: null });
    setDraft({ start: null, end: null });
    hide();
    triggerRef.current?.focus();
  };

  const focusYear = (index: number) => {
    const clamped = Math.min(YEARS_PER_PAGE - 1, Math.max(0, index));

    setFocusedIndex(clamped);
    shouldFocusRef.current = true;
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === 'Escape') {
      if (opened) {
        event.preventDefault();
        hide();
      }
      return;
    }

    if (['Enter', ' ', 'Spacebar', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      show();
    }
  };

  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      hide();
      triggerRef.current?.focus();
      return;
    }

    const target = event.target as HTMLElement;
    const isYearTarget = target.dataset.year === 'true' || target === panelRef.current;

    if (!isYearTarget) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        focusYear(focusedIndex - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        focusYear(focusedIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusYear(focusedIndex - 4);
        break;
      case 'ArrowDown':
        event.preventDefault();
        focusYear(focusedIndex + 4);
        break;
      case 'Home':
        event.preventDefault();
        focusYear(0);
        break;
      case 'End':
        event.preventDefault();
        focusYear(YEARS_PER_PAGE - 1);
        break;
      case 'PageUp':
        event.preventDefault();
        setPageStart((previous) => previous - YEARS_PER_PAGE);
        shouldFocusRef.current = true;
        break;
      case 'PageDown':
        event.preventDefault();
        setPageStart((previous) => previous + YEARS_PER_PAGE);
        shouldFocusRef.current = true;
        break;
      default:
        break;
    }
  };

  const complete = draft.start !== null && draft.end !== null;
  const inputAriaLabel = ariaLabel ?? (label ? undefined : 'Year range');
  const dialogLabel = ariaLabel || (typeof label === 'string' ? label : 'Year range picker');

  return (
    <FormControl
      label={label}
      description={description}
      error={error}
      htmlFor={uuid}
      className={className}
    >
      <div className={cx(classes.root)}>
        <Input
          id={uuid}
          ref={triggerRef}
          className={cx(classes.input)}
          value={formatRange(displayValue)}
          placeholder={placeholder}
          readOnly
          fullWidth
          disabled={disabled}
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={opened}
          aria-label={inputAriaLabel}
          onKeyDown={handleTriggerKeyDown}
        />
        {clearable &&
          !!currentValue &&
          (currentValue.start !== null || currentValue.end !== null) &&
          !disabled && (
            <button
              type="button"
              className={cx(classes.clearButton)}
              aria-label="Clear selection"
              onClick={clearRange}
            >
              <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
            </button>
          )}
      </div>
      <OptionalPortal>
        <div ref={boundingBoxRef} style={{ display: opened ? 'flex' : 'none' }}>
          <div ref={paneRef} className="overlay-pane">
            {opened && (
              <div
                ref={panelRef}
                role="dialog"
                aria-label={dialogLabel}
                className={cx(classes.panel)}
                tabIndex={-1}
                onKeyDown={handlePanelKeyDown}
              >
                <div className={cx(classes.header)}>
                  <button
                    type="button"
                    className={cx(classes.navButton)}
                    aria-label="Previous years"
                    onClick={() => setPageStart((previous) => previous - YEARS_PER_PAGE)}
                  >
                    <Icon
                      icon="chevron-left-outline"
                      pack="nebular-essentials"
                      aria-hidden="true"
                    />
                  </button>
                  <div className={cx(classes.pageLabel)} aria-live="polite">
                    {`${pageStart} - ${pageStart + YEARS_PER_PAGE - 1}`}
                  </div>
                  <button
                    type="button"
                    className={cx(classes.navButton)}
                    aria-label="Next years"
                    onClick={() => setPageStart((previous) => previous + YEARS_PER_PAGE)}
                  >
                    <Icon
                      icon="chevron-right-outline"
                      pack="nebular-essentials"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div role="group" aria-label="Years" className={cx(classes.grid)}>
                  {years.map((year, index) => {
                    const yearDisabled = isYearDisabled(year);
                    const inRange = isInDraftRange(year);
                    const rangeStart = draft.start === year;
                    const rangeEnd = draft.end === year;
                    const isFocused = focusedIndex === index;

                    return (
                      <button
                        key={year}
                        type="button"
                        className={cx(classes.yearButton, 'year-range-cell')}
                        aria-label={`${year}`}
                        aria-pressed={rangeStart || rangeEnd}
                        data-year="true"
                        data-year-focused={isFocused ? 'true' : undefined}
                        data-in-range={inRange ? 'true' : undefined}
                        data-range-start={rangeStart ? 'true' : undefined}
                        data-range-end={rangeEnd ? 'true' : undefined}
                        disabled={yearDisabled}
                        tabIndex={isFocused ? 0 : -1}
                        onFocus={() => setFocusedIndex(index)}
                        onClick={() => selectYear(year)}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
                <div className={cx(classes.actions)}>
                  <Button appearance="ghost" size="small" onClick={clearRange}>
                    Clear
                  </Button>
                  <Button size="small" onClick={applyRange} disabled={!complete}>
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </OptionalPortal>
    </FormControl>
  );
}

YearRangePicker.displayName = 'YearRangePicker';

export { YearRangePicker };
