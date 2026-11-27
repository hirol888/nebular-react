import React, { useRef, useState } from 'react';
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
import { Input } from '../Input';
import { OptionalPortal } from '../OptionalPortal';
import { shiftFromTimeZone, shiftToTimeZone } from '../Shared/timezone';
import { TimeList } from '../Timepicker/TimeList';
import { useDefaultLocale } from '../Shared/hooks';

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'relative',
    width: '100%'
  },

  input: {
    cursor: 'pointer'
  },

  panel: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 'var(--time-range-picker-min-width, 18rem)',
    backgroundColor:
      'var(--time-range-picker-background-color, var(--background-basic-color-1, #fff))',
    border: '1px solid var(--time-range-picker-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--time-range-picker-border-radius, 0.25rem)',
    boxShadow: 'var(--time-range-picker-shadow, 0 4px 12px rgba(0, 0, 0, 0.12))',
    overflow: 'hidden'
  },

  lists: {
    display: 'flex',
    gap: '0.25rem',

    '.nebular-card-root': {
      border: 0,
      boxShadow: 'none',
      borderRadius: 0
    }
  },

  listGroup: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0',
    minWidth: 0
  },

  listLabel: {
    padding: '0.35rem 0.5rem 0',
    color: 'var(--time-range-picker-label-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.75rem',
    fontWeight: 600
  },

  error: {
    padding: '0.25rem 0.5rem 0.5rem',
    color: 'var(--time-range-picker-error-color, var(--color-danger-500, #ff3d71))',
    fontSize: '0.75rem'
  },

  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    padding: '0.5rem',
    borderTop:
      '1px solid var(--time-range-picker-actions-border-color, var(--border-basic-color-3, #e4e9f2))'
  }
}));

export type TimeRangePickerStylesNames = Selectors<typeof useStyles>;

export interface TimeRange<TDate extends Date | Moment = Date> {
  start: TDate | null;
  end: TDate | null;
}

export interface TimeRangePickerProps<
  TDate extends Date | Moment = Date
> extends DefaultProps<TimeRangePickerStylesNames> {
  value?: TimeRange<TDate>;
  defaultValue?: TimeRange<TDate>;
  onChange?(range: TimeRange<TDate>): void;
  locale?: string;
  dateType?: DateType;
  timeZone?: string;
  minuteStep?: number;
  format?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  placeholder?: string;
  dropdownOffset?: number;
}

const defaultProps: Partial<TimeRangePickerProps> = {
  locale: DEFAULT_LOCALE,
  dateType: 'native',
  minuteStep: 15,
  disabled: false,
  dropdownOffset: 8
};

function TimeRangePicker<TDate extends Date | Moment = Date>(props: TimeRangePickerProps<TDate>) {
  const defaultLocale = useDefaultLocale(props.locale);
  const {
    value,
    defaultValue,
    onChange,
    locale,
    dateType,
    timeZone,
    minuteStep,
    format,
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
  } = useComponentDefaultProps<TimeRangePickerProps<TDate>>(
    { ...(defaultProps as TimeRangePickerProps<TDate>), locale: defaultLocale },
    props
  );
  const { classes, cx } = useStyles(null, {
    name: 'time-range-picker',
    classNames,
    styles,
    unstyled
  });

  const dateFns = useDateFns<TDate>(locale);
  const dir = useNebularDir();
  const uuid = useId();

  const [internalValue, setInternalValue] = useState<TimeRange<TDate> | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const [opened, setOpened] = useState(false);
  const [draft, setDraft] = useState<TimeRange<TDate>>({ start: null, end: null });
  const [baseDate, setBaseDate] = useState<TDate | null>(null);
  const triggerRef = useRef<HTMLInputElement>(null);

  const activeTimeZone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;
  const timeFormat = format || 'HH:mm';
  const step = Math.max(1, minuteStep);

  const toDisplay = (_range?: TimeRange<TDate> | null): TimeRange<TDate> => ({
    start: (shiftToTimeZone(_range?.start, activeTimeZone) as TDate | null | undefined) ?? null,
    end: (shiftToTimeZone(_range?.end, activeTimeZone) as TDate | null | undefined) ?? null
  });

  const toAbsolute = (_range: TimeRange<TDate>): TimeRange<TDate> => ({
    start: (shiftFromTimeZone(_range.start, activeTimeZone) as TDate | null | undefined) ?? null,
    end: (shiftFromTimeZone(_range.end, activeTimeZone) as TDate | null | undefined) ?? null
  });

  const displayValue = toDisplay(currentValue);

  const formatRange = (_range: TimeRange<TDate>): string => {
    const start = _range.start ? dateFns.format(_range.start, timeFormat) : '';
    const end = _range.end ? dateFns.format(_range.end, timeFormat) : '';

    if (start && end) {
      return `${start} - ${end}`;
    }

    return start || end;
  };

  const commit = (next: TimeRange<TDate>) => {
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
      const wallNow =
        (shiftToTimeZone(dateFns.today(dateType), activeTimeZone) as TDate | undefined) ??
        dateFns.today(dateType);
      let base = dateFns.setHours(wallNow, 0);
      base = dateFns.setMinutes(base, 0);
      base = dateFns.setSeconds(base, 0);
      base = dateFns.setMilliseconds(base, 0);

      setBaseDate(base);
      setDraft(toDisplay(currentValue));
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

  const selectTime = (side: 'start' | 'end', time: TDate) => {
    setDraft((previous) => {
      const base = previous[side] ?? baseDate ?? time;
      let next = dateFns.setHours(base, dateFns.getHours(time));
      next = dateFns.setMinutes(next, dateFns.getMinutes(time));
      next = dateFns.setSeconds(next, 0);
      next = dateFns.setMilliseconds(next, 0);

      return side === 'start'
        ? { start: next, end: previous.end }
        : { start: previous.start, end: next };
    });
  };

  const minutesOfDay = (date: TDate): number =>
    dateFns.getHours(date) * 60 + dateFns.getMinutes(date);

  const complete = !!draft.start && !!draft.end;
  const invalid = complete && minutesOfDay(draft.start as TDate) > minutesOfDay(draft.end as TDate);

  const applyRange = () => {
    if (!draft.start || !draft.end || invalid) {
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
    }
  };

  const inputAriaLabel = ariaLabel ?? (label ? undefined : 'Time range');
  const dialogLabel = ariaLabel || (typeof label === 'string' ? label : 'Time range picker');

  return (
    <FormControl
      label={label}
      description={description}
      error={error}
      htmlFor={uuid}
      className={className}
    >
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
      <OptionalPortal>
        <div ref={boundingBoxRef} style={{ display: opened ? 'flex' : 'none' }}>
          <div ref={paneRef} className="overlay-pane">
            {opened && (
              <div
                role="dialog"
                aria-label={dialogLabel}
                className={cx(classes.panel)}
                onKeyDown={handlePanelKeyDown}
              >
                <div className={cx(classes.lists)}>
                  <div role="group" aria-label="Start time" className={cx(classes.listGroup)}>
                    <div className={cx(classes.listLabel)}>Start</div>
                    <TimeList<TDate>
                      date={draft.start ?? baseDate ?? undefined}
                      locale={locale}
                      dateType={dateType}
                      singleColumn
                      step={step}
                      showFooter={false}
                      opened={opened}
                      onSelectTime={({ time }) => selectTime('start', time)}
                    />
                  </div>
                  <div role="group" aria-label="End time" className={cx(classes.listGroup)}>
                    <div className={cx(classes.listLabel)}>End</div>
                    <TimeList<TDate>
                      date={draft.end ?? baseDate ?? undefined}
                      locale={locale}
                      dateType={dateType}
                      singleColumn
                      step={step}
                      showFooter={false}
                      opened={opened}
                      onSelectTime={({ time }) => selectTime('end', time)}
                    />
                  </div>
                </div>
                {invalid && (
                  <div role="alert" className={cx(classes.error)}>
                    End time must be after the start time
                  </div>
                )}
                <div className={cx(classes.actions)}>
                  <Button appearance="ghost" size="small" onClick={clearRange}>
                    Clear
                  </Button>
                  <Button size="small" onClick={applyRange} disabled={!complete || invalid}>
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

TimeRangePicker.displayName = 'TimeRangePicker';

export { TimeRangePicker };
