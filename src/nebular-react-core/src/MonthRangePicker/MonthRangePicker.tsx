import React, { useEffect, useRef, useState } from 'react';
import { Moment } from 'moment';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularDir
} from '@nebular-react/styles';
import {
  DateType,
  DEFAULT_LOCALE,
  isValidTimeZone,
  useDateFns,
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
import { shiftFromTimeZone, shiftToTimeZone } from '../Shared/timezone';
import { useDefaultLocale } from '../Shared/hooks';

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
    color: 'var(--month-range-picker-clear-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',
    zIndex: 1,

    '&:focus-visible': {
      outline: '2px solid var(--month-range-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  panel: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 'var(--month-range-picker-min-width, 20rem)',
    backgroundColor:
      'var(--month-range-picker-background-color, var(--background-basic-color-1, #fff))',
    border:
      '1px solid var(--month-range-picker-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--month-range-picker-border-radius, 0.25rem)',
    boxShadow: 'var(--month-range-picker-shadow, 0 4px 12px rgba(0, 0, 0, 0.12))',
    overflow: 'hidden',

    '&:focus': {
      outline: 'none'
    },

    '&:focus-visible': {
      outline: '2px solid var(--month-range-picker-focus-color, var(--color-primary-500, #3366ff))',
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
        'var(--month-range-picker-nav-hover-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--month-range-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  yearLabel: {
    flex: '1 1 auto',
    textAlign: 'center',
    fontSize: '0.875rem',
    fontWeight: 600
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '0.25rem',
    padding: '0 0.5rem 0.5rem'
  },

  monthButton: {
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
        'var(--month-range-picker-range-background-color, var(--color-primary-transparent-100, #e3efff))'
    },

    '&[data-range-start="true"], &[data-range-end="true"]': {
      backgroundColor:
        'var(--month-range-picker-selected-background-color, var(--color-primary-500, #3366ff))',
      color: 'var(--month-range-picker-selected-color, #fff)'
    },

    '&:hover:not(:disabled)': {
      backgroundColor:
        'var(--month-range-picker-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--month-range-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    },

    '&:disabled': {
      color: 'var(--month-range-picker-disabled-color, var(--text-disabled-color, #c5cee0))',
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
      '1px solid var(--month-range-picker-border-color, var(--border-basic-color-3, #e4e9f2))'
  }
}));

export type MonthRangePickerStylesNames = Selectors<typeof useStyles>;

export interface MonthRange<TDate extends Date | Moment = Date> {
  start: TDate | null;
  end: TDate | null;
}

export interface MonthRangePickerProps<
  TDate extends Date | Moment = Date
> extends DefaultProps<MonthRangePickerStylesNames> {
  value?: MonthRange<TDate>;
  defaultValue?: MonthRange<TDate>;
  onChange?(range: MonthRange<TDate>): void;
  locale?: string;
  dateType?: DateType;
  timeZone?: string;
  format?: string;
  min?: TDate;
  max?: TDate;
  visibleDate?: TDate;
  clearable?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  placeholder?: string;
  dropdownOffset?: number;
}

const MONTHS = Array.from({ length: 12 }, (_, index) => index);

const defaultProps: Partial<MonthRangePickerProps> = {
  locale: DEFAULT_LOCALE,
  dateType: 'native',
  clearable: false,
  disabled: false,
  dropdownOffset: 8
};

function MonthRangePicker<TDate extends Date | Moment = Date>(props: MonthRangePickerProps<TDate>) {
  const defaultLocale = useDefaultLocale(props.locale);
  const {
    value,
    defaultValue,
    onChange,
    locale,
    dateType,
    timeZone,
    format,
    min,
    max,
    visibleDate,
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
  } = useComponentDefaultProps<MonthRangePickerProps<TDate>>(
    { ...(defaultProps as MonthRangePickerProps<TDate>), locale: defaultLocale },
    props
  );
  const { classes, cx } = useStyles(null, {
    name: 'month-range-picker',
    classNames,
    styles,
    unstyled
  });

  const dateFns = useDateFns<TDate>(locale);
  const dir = useNebularDir();
  const uuid = useId();

  const [internalValue, setInternalValue] = useState<MonthRange<TDate> | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const [opened, setOpened] = useState(false);
  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear());
  const [focusedMonth, setFocusedMonth] = useState<number>(0);
  const [draft, setDraft] = useState<MonthRange<TDate>>({ start: null, end: null });
  const shouldFocusRef = useRef(false);
  const triggerRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeTimeZone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;

  const toDisplay = (_range?: MonthRange<TDate> | null): MonthRange<TDate> => ({
    start: (shiftToTimeZone(_range?.start, activeTimeZone) as TDate | null | undefined) ?? null,
    end: (shiftToTimeZone(_range?.end, activeTimeZone) as TDate | null | undefined) ?? null
  });

  const toAbsolute = (_range: MonthRange<TDate>): MonthRange<TDate> => ({
    start: (shiftFromTimeZone(_range.start, activeTimeZone) as TDate | null | undefined) ?? null,
    end: (shiftFromTimeZone(_range.end, activeTimeZone) as TDate | null | undefined) ?? null
  });

  const displayValue = toDisplay(currentValue);
  const displayMin = shiftToTimeZone(min, activeTimeZone) ?? undefined;
  const displayMax = shiftToTimeZone(max, activeTimeZone) ?? undefined;
  const displayVisibleDate =
    (shiftToTimeZone(visibleDate, activeTimeZone) as TDate | undefined) ??
    displayValue.start ??
    undefined;

  const valueFormat = format || 'MMM YYYY';

  const formatRange = (_range: MonthRange<TDate>): string => {
    const start = _range.start ? dateFns.format(_range.start, valueFormat) : '';
    const end = _range.end ? dateFns.format(_range.end, valueFormat) : '';

    if (start && end) {
      return `${start} - ${end}`;
    }

    return start || end;
  };

  const commit = (next: MonthRange<TDate>) => {
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
      const display = toDisplay(currentValue);
      const base = display.start ?? displayVisibleDate ?? dateFns.today(dateType);

      setViewYear(dateFns.getYear(base));
      setFocusedMonth(display.start ? dateFns.getMonth(display.start) : 0);
      setDraft(display);
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
      '[data-month-focused="true"]'
    );
    focusedButton?.focus();
    shouldFocusRef.current = false;
  }, [focusedMonth, opened, viewYear]);

  const monthOrdinal = (date: TDate): number => dateFns.getYear(date) * 12 + dateFns.getMonth(date);

  const isMonthDisabled = (date: TDate): boolean =>
    (!!displayMin && dateFns.compareDates(dateFns.getMonthEnd(date), displayMin) < 0) ||
    (!!displayMax && dateFns.compareDates(dateFns.getMonthStart(date), displayMax) > 0);

  const isDraftStart = (date: TDate): boolean =>
    !!draft.start && monthOrdinal(draft.start) === monthOrdinal(date);

  const isDraftEnd = (date: TDate): boolean =>
    !!draft.end && monthOrdinal(draft.end) === monthOrdinal(date);

  const isInDraftRange = (date: TDate): boolean => {
    if (!draft.start || !draft.end) {
      return isDraftStart(date);
    }

    const ordinal = monthOrdinal(date);

    return ordinal >= monthOrdinal(draft.start) && ordinal <= monthOrdinal(draft.end);
  };

  const selectMonth = (date: TDate) => {
    if (isMonthDisabled(date)) {
      return;
    }

    setDraft((previous) => {
      if (!previous.start || previous.end) {
        return { start: date, end: null };
      }

      if (monthOrdinal(date) < monthOrdinal(previous.start)) {
        return { start: date, end: null };
      }

      return { start: previous.start, end: date };
    });
  };

  const applyRange = () => {
    if (!draft.start || !draft.end) {
      return;
    }

    commit(toAbsolute(draft));
    hide();
    triggerRef.current?.focus();
  };

  const clearRange = () => {
    commit({ start: null, end: null });
    setDraft({ start: null, end: null });
    hide();
    triggerRef.current?.focus();
  };

  const focusMonth = (index: number) => {
    const clamped = Math.min(MONTHS.length - 1, Math.max(0, index));

    setFocusedMonth(clamped);
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
    const isMonthTarget = target.dataset.month === 'true' || target === panelRef.current;

    if (!isMonthTarget) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        focusMonth(focusedMonth - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        focusMonth(focusedMonth + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusMonth(focusedMonth - 3);
        break;
      case 'ArrowDown':
        event.preventDefault();
        focusMonth(focusedMonth + 3);
        break;
      case 'Home':
        event.preventDefault();
        focusMonth(0);
        break;
      case 'End':
        event.preventDefault();
        focusMonth(MONTHS.length - 1);
        break;
      case 'PageUp':
        event.preventDefault();
        setViewYear((previous) => previous - 1);
        shouldFocusRef.current = true;
        break;
      case 'PageDown':
        event.preventDefault();
        setViewYear((previous) => previous + 1);
        shouldFocusRef.current = true;
        break;
      default:
        break;
    }
  };

  const complete = !!draft.start && !!draft.end;
  const inputAriaLabel = ariaLabel ?? (label ? undefined : 'Month range');
  const dialogLabel = ariaLabel || (typeof label === 'string' ? label : 'Month range picker');

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
        {clearable && (currentValue?.start || currentValue?.end) && !disabled && (
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
                    aria-label="Previous year"
                    onClick={() => setViewYear((previous) => previous - 1)}
                  >
                    <Icon
                      icon="chevron-left-outline"
                      pack="nebular-essentials"
                      aria-hidden="true"
                    />
                  </button>
                  <div className={cx(classes.yearLabel)} aria-live="polite">
                    {viewYear}
                  </div>
                  <button
                    type="button"
                    className={cx(classes.navButton)}
                    aria-label="Next year"
                    onClick={() => setViewYear((previous) => previous + 1)}
                  >
                    <Icon
                      icon="chevron-right-outline"
                      pack="nebular-essentials"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div role="group" aria-label="Months" className={cx(classes.grid)}>
                  {MONTHS.map((monthIndex) => {
                    const date = dateFns.createDate(viewYear, monthIndex, 1, dateType);
                    const monthDisabled = isMonthDisabled(date);
                    const inRange = isInDraftRange(date);
                    const rangeStart = isDraftStart(date);
                    const rangeEnd = isDraftEnd(date);
                    const isFocused = focusedMonth === monthIndex;

                    return (
                      <button
                        key={monthIndex}
                        type="button"
                        className={cx(classes.monthButton, 'month-range-cell')}
                        aria-label={`${dateFns.getMonthNameByIndex(monthIndex, 'long')} ${viewYear}`}
                        aria-pressed={rangeStart || rangeEnd}
                        data-month="true"
                        data-month-focused={isFocused ? 'true' : undefined}
                        data-in-range={inRange ? 'true' : undefined}
                        data-range-start={rangeStart ? 'true' : undefined}
                        data-range-end={rangeEnd ? 'true' : undefined}
                        disabled={monthDisabled}
                        tabIndex={isFocused ? 0 : -1}
                        onFocus={() => setFocusedMonth(monthIndex)}
                        onClick={() => selectMonth(date)}
                      >
                        {dateFns.getMonthNameByIndex(monthIndex, 'short')}
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

MonthRangePicker.displayName = 'MonthRangePicker';

export { MonthRangePicker };
