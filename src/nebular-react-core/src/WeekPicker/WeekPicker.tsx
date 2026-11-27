import React, { useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularDir,
  useNebularLocale
} from '@nebular-react/styles';
import {
  isValidTimeZone,
  useFlexibleConnectedPositionStrategy,
  useId,
  useOverlay,
  useOverlayClickOutside,
  useOverlayTrigger
} from '@nebular-react/hooks';
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
    color: 'var(--week-picker-clear-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',
    zIndex: 1,

    '&:focus-visible': {
      outline: '2px solid var(--week-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  panel: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 'var(--week-picker-min-width, 18rem)',
    backgroundColor: 'var(--week-picker-background-color, var(--background-basic-color-1, #fff))',
    border: '1px solid var(--week-picker-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--week-picker-border-radius, 0.25rem)',
    boxShadow: 'var(--week-picker-shadow, 0 4px 12px rgba(0, 0, 0, 0.12))',
    overflow: 'hidden',

    '&:focus': {
      outline: 'none'
    },

    '&:focus-visible': {
      outline: '2px solid var(--week-picker-focus-color, var(--color-primary-500, #3366ff))',
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
        'var(--week-picker-nav-hover-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--week-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  monthLabel: {
    flex: '1 1 auto',
    textAlign: 'center',
    fontSize: '0.875rem',
    fontWeight: 600
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed'
  },

  weekNumberHeader: {
    width: '2.25rem',
    padding: '0.25rem 0',
    color: 'var(--week-picker-label-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase'
  },

  dayName: {
    padding: '0.25rem 0',
    color: 'var(--week-picker-label-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase'
  },

  weekNumberCell: {
    padding: '0.125rem',
    color: 'var(--week-picker-week-number-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.75rem',
    fontWeight: 600,
    textAlign: 'center'
  },

  dayCell: {
    padding: '0.0625rem'
  },

  dayButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    padding: 0,
    border: 0,
    borderRadius: '0.25rem',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',
    cursor: 'pointer',

    '&[data-week-in-range="true"]': {
      backgroundColor:
        'var(--week-picker-range-background-color, var(--color-primary-transparent-100, #e3efff))'
    },

    '&[data-week-selected="true"]': {
      backgroundColor:
        'var(--week-picker-selected-background-color, var(--color-primary-500, #3366ff))',
      color: 'var(--week-picker-selected-color, #fff)'
    },

    '&[data-outside-month="true"]': {
      color: 'var(--week-picker-outside-color, var(--text-hint-color, #8f9bb3))'
    },

    '&:hover:not(:disabled)': {
      backgroundColor:
        'var(--week-picker-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--week-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    },

    '&:disabled': {
      color: 'var(--week-picker-disabled-color, var(--text-disabled-color, #c5cee0))',
      cursor: 'not-allowed',
      opacity: 0.6
    }
  }
}));

export type WeekPickerStylesNames = Selectors<typeof useStyles>;

export interface WeekRange {
  start: Date;
  end: Date;
  weekNumber: number;
  year: number;
}

export interface WeekPickerProps extends DefaultProps<WeekPickerStylesNames> {
  value?: WeekRange | null;
  defaultValue?: WeekRange | null;
  onChange?(range: WeekRange | null): void;
  timeZone?: string;
  locale?: string;
  min?: Date;
  max?: Date;
  visibleDate?: Date;
  clearable?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  format?: string;
  placeholder?: string;
  dropdownOffset?: number;
}

const defaultProps: Partial<WeekPickerProps> = {
  clearable: false,
  disabled: false,
  dropdownOffset: 8
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

function isSameDay(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function isoWeekOf(date: Date): { weekNumber: number; year: number } {
  const isoDate = moment(date);

  return { weekNumber: isoDate.isoWeek(), year: isoDate.isoWeekYear() };
}

interface WeekGridRow {
  weekStart: Date;
  weekEnd: Date;
  weekNumber: number;
  year: number;
  days: Date[];
}

function WeekPicker(props: WeekPickerProps) {
  const defaultLocale = useDefaultLocale(props.locale);
  const { t } = useNebularLocale();
  const {
    value,
    defaultValue,
    onChange,
    timeZone,
    min,
    max,
    visibleDate,
    clearable,
    label,
    description,
    error,
    disabled,
    ariaLabel,
    format,
    placeholder,
    dropdownOffset,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'week-picker',
    classNames,
    styles,
    unstyled
  });

  const dir = useNebularDir();
  const uuid = useId();

  const [internalValue, setInternalValue] = useState<WeekRange | null | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const [opened, setOpened] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => startOfMonth(new Date()));
  const [focusedDate, setFocusedDate] = useState<Date>(() => startOfDay(new Date()));
  const shouldFocusRef = useRef(false);
  const triggerRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeTimeZone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;

  const displayValue = useMemo<WeekRange | null>(() => {
    if (!currentValue) {
      return null;
    }

    const start = shiftToTimeZone(currentValue.start, activeTimeZone) as Date | null | undefined;
    const end = shiftToTimeZone(currentValue.end, activeTimeZone) as Date | null | undefined;

    if (!start || !end) {
      return null;
    }

    return {
      start,
      end,
      weekNumber: currentValue.weekNumber,
      year: currentValue.year
    };
  }, [activeTimeZone, currentValue]);

  const displayVisibleDate =
    (shiftToTimeZone(visibleDate, activeTimeZone) as Date | undefined) ?? null;
  const displayMin = (shiftToTimeZone(min, activeTimeZone) as Date | undefined) ?? null;
  const displayMax = (shiftToTimeZone(max, activeTimeZone) as Date | undefined) ?? null;

  const minTime = displayMin ? startOfDay(displayMin).getTime() : null;
  const maxTime = displayMax ? startOfDay(displayMax).getTime() : null;

  const formatWeek = (range: WeekRange | null): string => {
    if (!range) {
      return '';
    }

    const formatter = new Intl.DateTimeFormat(defaultLocale, {
      month: 'short',
      day: 'numeric'
    });
    const start = format ? moment(range.start).format(format) : formatter.format(range.start);
    const end = format ? moment(range.end).format(format) : formatter.format(range.end);

    return t('datePicker.weekRange', 'W{week} {year}: {start} - {end}', {
      week: range.weekNumber,
      year: range.year,
      start,
      end
    });
  };

  const commit = (next: WeekRange | null) => {
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
      const base = displayValue?.start ?? displayVisibleDate ?? new Date();
      const baseDay = startOfDay(base);

      setViewDate(startOfMonth(baseDay));
      setFocusedDate(baseDay);
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
      '[data-week-focused="true"]'
    );
    focusedButton?.focus();
    shouldFocusRef.current = false;
  }, [focusedDate, opened, viewDate]);

  const weeks = useMemo<WeekGridRow[]>(() => {
    const firstOfMonth = startOfMonth(viewDate);
    const offset = (firstOfMonth.getDay() + 6) % 7;
    const gridStart = addDays(firstOfMonth, -offset);

    return Array.from({ length: 6 }, (_week, weekIndex) => {
      const weekStart = addDays(gridStart, weekIndex * 7);
      const days = Array.from({ length: 7 }, (_, dayIndex) => addDays(weekStart, dayIndex));
      const iso = isoWeekOf(weekStart);

      return {
        weekStart,
        weekEnd: days[6],
        weekNumber: iso.weekNumber,
        year: iso.year,
        days
      };
    });
  }, [viewDate]);

  const selectedStart = displayValue ? startOfDay(displayValue.start) : null;
  const selectedEnd = displayValue ? startOfDay(displayValue.end) : null;

  const isWeekDisabled = (week: WeekGridRow): boolean => {
    const weekStartTime = startOfDay(week.weekStart).getTime();
    const weekEndTime = startOfDay(week.weekEnd).getTime();

    return (
      (minTime !== null && weekEndTime < minTime) || (maxTime !== null && weekStartTime > maxTime)
    );
  };

  const isInSelectedWeek = (day: Date): boolean => {
    if (!selectedStart || !selectedEnd) {
      return false;
    }

    const time = startOfDay(day).getTime();

    return time >= selectedStart.getTime() && time <= selectedEnd.getTime();
  };

  const selectWeek = (week: WeekGridRow) => {
    if (isWeekDisabled(week)) {
      return;
    }

    const start = startOfDay(week.weekStart);
    const end = new Date(
      week.weekEnd.getFullYear(),
      week.weekEnd.getMonth(),
      week.weekEnd.getDate(),
      23,
      59,
      59,
      999
    );

    const absoluteStart = shiftFromTimeZone(start, activeTimeZone);
    const absoluteEnd = shiftFromTimeZone(end, activeTimeZone);

    if (!absoluteStart || !absoluteEnd) {
      return;
    }

    commit({
      start: absoluteStart,
      end: absoluteEnd,
      weekNumber: week.weekNumber,
      year: week.year
    });
    hide();
    triggerRef.current?.focus();
  };

  const clearValue = () => {
    commit(null);
    hide();
    triggerRef.current?.focus();
  };

  const moveFocus = (next: Date) => {
    const nextDay = startOfDay(next);

    setFocusedDate(nextDay);
    setViewDate(startOfMonth(nextDay));
    shouldFocusRef.current = true;
  };

  const changeMonth = (delta: number) => {
    const nextView = new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1);

    setViewDate(nextView);
    setFocusedDate(nextView);
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
    const isDayTarget = target.dataset.weekDay === 'true' || target === panelRef.current;

    if (!isDayTarget) {
      return;
    }

    const daysFromMonday = (focusedDate.getDay() + 6) % 7;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveFocus(addDays(focusedDate, -1));
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveFocus(addDays(focusedDate, 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(addDays(focusedDate, -7));
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(addDays(focusedDate, 7));
        break;
      case 'Home':
        event.preventDefault();
        moveFocus(addDays(focusedDate, -daysFromMonday));
        break;
      case 'End':
        event.preventDefault();
        moveFocus(addDays(focusedDate, 6 - daysFromMonday));
        break;
      case 'PageUp':
        event.preventDefault();
        moveFocus(addMonths(focusedDate, -1));
        break;
      case 'PageDown':
        event.preventDefault();
        moveFocus(addMonths(focusedDate, 1));
        break;
      default:
        break;
    }
  };

  const inputAriaLabel = ariaLabel ?? (label ? undefined : t('datePicker.week', 'Week'));
  const dialogLabel =
    ariaLabel || (typeof label === 'string' ? label : t('datePicker.weekPicker', 'Week picker'));
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(defaultLocale, { month: 'long', year: 'numeric' }).format(viewDate),
    [defaultLocale, viewDate]
  );
  const dayNames = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(defaultLocale, { weekday: 'short' });

    return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, 1 + index)));
  }, [defaultLocale]);
  const dayLabelFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(defaultLocale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
    [defaultLocale]
  );

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
          value={formatWeek(displayValue)}
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
        {clearable && currentValue && !disabled && (
          <button
            type="button"
            className={cx(classes.clearButton)}
            aria-label={t('datePicker.clearSelection', 'Clear selection')}
            onClick={clearValue}
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
                    aria-label={t('datePicker.previousMonth', 'Previous month')}
                    onClick={() => changeMonth(-1)}
                  >
                    <Icon
                      icon="chevron-left-outline"
                      pack="nebular-essentials"
                      aria-hidden="true"
                    />
                  </button>
                  <div className={cx(classes.monthLabel)} aria-live="polite">
                    {monthLabel}
                  </div>
                  <button
                    type="button"
                    className={cx(classes.navButton)}
                    aria-label={t('datePicker.nextMonth', 'Next month')}
                    onClick={() => changeMonth(1)}
                  >
                    <Icon
                      icon="chevron-right-outline"
                      pack="nebular-essentials"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <table className={cx(classes.table)}>
                  <thead>
                    <tr>
                      <th scope="col" className={cx(classes.weekNumberHeader)}>
                        {t('datePicker.weekNumber', 'Wk')}
                      </th>
                      {dayNames.map((dayName) => (
                        <th key={dayName} scope="col" className={cx(classes.dayName)}>
                          {dayName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.map((week) => {
                      const weekDisabled = isWeekDisabled(week);

                      return (
                        <tr key={`${week.year}-${week.weekNumber}-${week.weekStart.getTime()}`}>
                          <th scope="row" className={cx(classes.weekNumberCell)}>
                            {week.weekNumber}
                          </th>
                          {week.days.map((day) => {
                            const inSelectedWeek = isInSelectedWeek(day);
                            const isFocused = isSameDay(day, focusedDate);
                            const outsideMonth = day.getMonth() !== viewDate.getMonth();

                            return (
                              <td key={day.getTime()} className={cx(classes.dayCell)}>
                                <button
                                  type="button"
                                  className={cx(classes.dayButton, 'week-day-cell')}
                                  aria-label={dayLabelFormatter.format(day)}
                                  aria-pressed={inSelectedWeek}
                                  data-week-day="true"
                                  data-week-focused={isFocused ? 'true' : undefined}
                                  data-week-in-range={inSelectedWeek ? 'true' : undefined}
                                  data-week-selected={inSelectedWeek ? 'true' : undefined}
                                  data-outside-month={outsideMonth ? 'true' : undefined}
                                  disabled={weekDisabled}
                                  tabIndex={isFocused ? 0 : -1}
                                  onFocus={() => setFocusedDate(startOfDay(day))}
                                  onClick={() => selectWeek(week)}
                                >
                                  {day.getDate()}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </OptionalPortal>
    </FormControl>
  );
}

WeekPicker.displayName = 'WeekPicker';

export { WeekPicker };
