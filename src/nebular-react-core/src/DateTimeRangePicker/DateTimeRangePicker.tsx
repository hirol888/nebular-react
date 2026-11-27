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
import { CalendarRange, CalendarViewModeType, DateRange } from '../Calendar';
import { createRangePresets } from '../Datepicker/presets';
import { DateRangePreset } from '../Datepicker/types';
import { FormControl } from '../FormControl';
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

  panel: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 'var(--datetime-range-picker-min-width, 24rem)',
    backgroundColor:
      'var(--datetime-range-picker-background-color, var(--background-basic-color-1, #fff))',
    border:
      '1px solid var(--datetime-range-picker-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--datetime-range-picker-border-radius, 0.25rem)',
    boxShadow: 'var(--datetime-range-picker-shadow, 0 4px 12px rgba(0, 0, 0, 0.12))',
    overflow: 'hidden'
  },

  presets: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    padding: '0.5rem',
    borderBottom:
      '1px solid var(--datetime-range-picker-presets-border-color, var(--border-basic-color-3, #e4e9f2))'
  },

  presetButton: {
    padding: '0.25rem 0.5rem',
    border:
      '1px solid var(--datetime-range-picker-preset-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--datetime-range-picker-preset-border-radius, 0.25rem)',
    backgroundColor: 'var(--datetime-range-picker-preset-background-color, transparent)',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.75rem',
    lineHeight: 1.4,
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--datetime-range-picker-preset-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline:
        '2px solid var(--datetime-range-picker-preset-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  calendarContainer: {
    '.nebular-card-root': {
      border: 0,
      borderRadius: 0,
      boxShadow: 'none'
    }
  },

  timeFields: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem',
    borderTop:
      '1px solid var(--datetime-range-picker-border-color, var(--border-basic-color-3, #e4e9f2))'
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: '1 1 0',
    minWidth: 0
  },

  fieldLabel: {
    color: 'var(--datetime-range-picker-label-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.75rem',
    fontWeight: 600
  },

  error: {
    padding: '0 0.5rem 0.5rem',
    color: 'var(--datetime-range-picker-error-color, var(--color-danger-500, #ff3d71))',
    fontSize: '0.75rem'
  },

  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    padding: '0.5rem',
    borderTop:
      '1px solid var(--datetime-range-picker-border-color, var(--border-basic-color-3, #e4e9f2))'
  }
}));

export type DateTimeRangePickerStylesNames = Selectors<typeof useStyles>;

export interface DateTimeRange<TDate extends Date | Moment = Date> {
  start: TDate | null;
  end: TDate | null;
}

export interface DateTimeRangePickerProps<
  TDate extends Date | Moment = Date
> extends DefaultProps<DateTimeRangePickerStylesNames> {
  value?: DateTimeRange<TDate>;
  defaultValue?: DateTimeRange<TDate>;
  onChange?(range: DateTimeRange<TDate>): void;
  locale?: string;
  dateType?: DateType;
  format?: string;
  timeZone?: string;
  min?: TDate;
  max?: TDate;
  visibleDate?: TDate;
  startView?: CalendarViewModeType;
  presets?: boolean | DateRangePreset<TDate>[];
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  placeholder?: string;
  dropdownOffset?: number;
}

const defaultProps: Partial<DateTimeRangePickerProps> = {
  locale: DEFAULT_LOCALE,
  dateType: 'native',
  startView: 'date',
  presets: false,
  disabled: false,
  dropdownOffset: 8
};

function DateTimeRangePicker<TDate extends Date | Moment = Date>(
  props: DateTimeRangePickerProps<TDate>
) {
  const defaultLocale = useDefaultLocale(props.locale);
  const {
    value,
    defaultValue,
    onChange,
    locale,
    dateType,
    format,
    timeZone,
    min,
    max,
    visibleDate,
    startView,
    presets,
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
  } = useComponentDefaultProps<DateTimeRangePickerProps<TDate>>(
    { ...(defaultProps as DateTimeRangePickerProps<TDate>), locale: defaultLocale },
    props
  );
  const { classes, cx } = useStyles(null, {
    name: 'datetime-range-picker',
    classNames,
    styles,
    unstyled
  });

  const dateFns = useDateFns<TDate>(locale);
  const dir = useNebularDir();
  const uuid = useId();

  const [internalValue, setInternalValue] = useState<DateTimeRange<TDate> | undefined>(
    defaultValue
  );
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const [opened, setOpened] = useState(false);
  const [draft, setDraft] = useState<DateTimeRange<TDate>>({ start: null, end: null });
  const triggerRef = useRef<HTMLInputElement>(null);

  const activeTimeZone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;
  const valueFormat = format || `${dateFns.getDateFormat()} HH:mm`;
  const activePresets = presets === true ? createRangePresets(dateFns, dateType) : presets || [];

  const toDisplay = (_range?: DateTimeRange<TDate> | null): DateTimeRange<TDate> => ({
    start: (shiftToTimeZone(_range?.start, activeTimeZone) as TDate | null | undefined) ?? null,
    end: (shiftToTimeZone(_range?.end, activeTimeZone) as TDate | null | undefined) ?? null
  });

  const toAbsolute = (_range: DateTimeRange<TDate>): DateTimeRange<TDate> => ({
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

  const formatRange = (_range: DateTimeRange<TDate>): string => {
    const start = _range.start ? dateFns.format(_range.start, valueFormat) : '';
    const end = _range.end ? dateFns.format(_range.end, valueFormat) : '';

    if (start && end) {
      return `${start} - ${end}`;
    }

    return start || end;
  };

  const commit = (next: DateTimeRange<TDate>) => {
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

  const withTime = (date: TDate, base: TDate | null): TDate => {
    if (!base) {
      return dateFns.setHours(dateFns.setMinutes(date, 0), 0);
    }

    let result = dateFns.setHours(date, dateFns.getHours(base));
    result = dateFns.setMinutes(result, dateFns.getMinutes(base));

    return result;
  };

  const handleRangeChange = (_range: DateRange<TDate>) => {
    setDraft((previous) => ({
      start: _range.start ? withTime(_range.start, previous.start) : null,
      end: _range.end ? withTime(_range.end, previous.end) : null
    }));
  };

  const handleTimeChange = (side: 'start' | 'end', time: string) => {
    const [hours, minutes] = time.split(':').map((part) => Number(part));

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return;
    }

    setDraft((previous) => {
      const base = previous[side];

      if (!base) {
        return previous;
      }

      let next = dateFns.setHours(base, hours);
      next = dateFns.setMinutes(next, minutes);
      next = dateFns.setSeconds(next, 0);
      next = dateFns.setMilliseconds(next, 0);

      return side === 'start'
        ? { start: next, end: previous.end }
        : { start: previous.start, end: next };
    });
  };

  const complete = !!draft.start && !!draft.end;
  const invalid =
    complete && dateFns.valueOf(draft.start as TDate) > dateFns.valueOf(draft.end as TDate);

  const applyRange = () => {
    if (!draft.start || !draft.end || invalid) {
      return;
    }

    commit(toAbsolute(draft));
    hide();
    triggerRef.current?.focus();
  };

  const applyPreset = (preset: DateRangePreset<TDate>) => {
    const presetRange = preset.getValue();
    const next: DateTimeRange<TDate> = {
      start: presetRange.start ?? null,
      end: presetRange.end ?? null
    };

    commit(next);
    setDraft(toDisplay(next));
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

  const inputAriaLabel = ariaLabel ?? (label ? undefined : 'Date and time range');
  const dialogLabel =
    ariaLabel || (typeof label === 'string' ? label : 'Date and time range picker');

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
                {activePresets.length > 0 && (
                  <div className={cx(classes.presets)}>
                    {activePresets.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        className={cx(classes.presetButton)}
                        onClick={() => applyPreset(preset)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className={cx(classes.calendarContainer)}>
                  <CalendarRange<TDate>
                    locale={locale}
                    startView={startView}
                    dateType={dateType}
                    range={{ start: draft.start ?? undefined, end: draft.end ?? undefined }}
                    visibleDate={displayVisibleDate}
                    min={displayMin}
                    max={displayMax}
                    onRangeChange={handleRangeChange}
                  />
                </div>
                <div className={cx(classes.timeFields)}>
                  <div className={cx(classes.field)}>
                    <label className={cx(classes.fieldLabel)} htmlFor={`${uuid}-start-time`}>
                      Start time
                    </label>
                    <Input
                      id={`${uuid}-start-time`}
                      type="time"
                      fullWidth
                      value={draft.start ? dateFns.format(draft.start, 'HH:mm') : ''}
                      disabled={!draft.start}
                      onChange={(event) => handleTimeChange('start', event.target.value)}
                    />
                  </div>
                  <div className={cx(classes.field)}>
                    <label className={cx(classes.fieldLabel)} htmlFor={`${uuid}-end-time`}>
                      End time
                    </label>
                    <Input
                      id={`${uuid}-end-time`}
                      type="time"
                      fullWidth
                      value={draft.end ? dateFns.format(draft.end, 'HH:mm') : ''}
                      disabled={!draft.end}
                      onChange={(event) => handleTimeChange('end', event.target.value)}
                    />
                  </div>
                </div>
                {invalid && (
                  <div role="alert" className={cx(classes.error)}>
                    End date and time must be after the start date and time
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

DateTimeRangePicker.displayName = 'DateTimeRangePicker';

export { DateTimeRangePicker };
