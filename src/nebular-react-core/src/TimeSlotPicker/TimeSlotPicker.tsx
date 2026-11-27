import React, { forwardRef, useMemo, useState } from 'react';
import { isValidTimeZone, useUncontrolled } from '@nebular-react/hooks';
import { createStyles, useNebularLocale } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { Calendar } from '../Calendar';
import { TimeZonePicker } from '../TimeZonePicker';
import { useDefaultLocale } from '../Shared/hooks';

export interface TimeSlot {
  id: string;
  /** Use a Date or an ISO date-time with an explicit offset. */
  start: Date | string;
  end: Date | string;
  disabled?: boolean;
}

export interface TimeSlotPickerLabels {
  calendar: string;
  timeZone: string;
  slots: string;
  unavailable: string;
  loading: string;
}

const defaults: TimeSlotPickerLabels = {
  calendar: 'Choose a date',
  timeZone: 'Time zone',
  slots: 'Available times',
  unavailable: 'No times available for this date.',
  loading: 'Loading available times…'
};

const useStyles = createStyles(() => ({
  root: { display: 'grid', gap: '0.75rem', minWidth: 0 },
  body: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
    gap: '1rem',
    alignItems: 'start'
  },
  slots: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 9rem), 1fr))',
    gap: '0.5rem'
  },
  timeZone: { margin: 0, color: 'var(--text-basic-color, #222b45)' }
}));

export type TimeSlotPickerStylesNames = Selectors<typeof useStyles>;

export interface TimeSlotPickerProps extends DefaultProps<TimeSlotPickerStylesNames> {
  slots: readonly TimeSlot[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?(slot: TimeSlot): void;
  /** The date sent to the consumer is an ISO calendar day in the displayed time zone. */
  onDayChange?(day: string): void;
  timeZone?: string;
  defaultTimeZone?: string;
  timeZones?: readonly string[];
  onTimeZoneChange?(timeZone: string): void;
  initialDate?: Date;
  locale?: string;
  disabled?: boolean;
  loading?: boolean;
  labels?: Partial<TimeSlotPickerLabels>;
}

function asInstant(value: Date | string): Date | null {
  if (typeof value === 'string' && !/T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function dayString(formatter: Intl.DateTimeFormat, date: Date): string {
  const parts = formatter.formatToParts(date);
  return ['year', 'month', 'day']
    .map((type) => parts.find((part) => part.type === type)?.value)
    .join('-');
}

export const TimeSlotPicker = forwardRef<HTMLDivElement, TimeSlotPickerProps>((props, ref) => {
  const {
    slots,
    value,
    defaultValue,
    onChange,
    onDayChange,
    timeZone,
    defaultTimeZone,
    timeZones,
    onTimeZoneChange,
    initialDate,
    locale: localeProp,
    disabled,
    loading,
    labels,
    className,
    style,
    classNames,
    styles,
    unstyled
  } = props;
  const locale = useDefaultLocale(localeProp);
  const { t } = useNebularLocale();
  const text = {
    ...defaults,
    calendar: t('timeSlot.calendar', defaults.calendar),
    timeZone: t('timeSlot.timeZone', defaults.timeZone),
    slots: t('timeSlot.slots', defaults.slots),
    unavailable: t('timeSlot.unavailable', defaults.unavailable),
    loading: t('timeSlot.loading', defaults.loading),
    ...labels
  };
  const { classes, cx } = useStyles(null, {
    name: 'time-slot-picker',
    classNames,
    styles,
    unstyled
  });
  const [zoneValue, setZone] = useUncontrolled({
    value: timeZone,
    defaultValue: defaultTimeZone,
    finalValue: 'UTC',
    onChange: onTimeZoneChange
  });
  const [selected, setSelected] = useUncontrolled({ value, defaultValue, finalValue: null });
  const [day, setDay] = useState<Date>();
  const zone = isValidTimeZone(zoneValue) ? zoneValue : 'UTC';
  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: zone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
    [zone]
  );
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        timeZone: zone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZoneName: 'short'
      }),
    [locale, zone]
  );
  const valid = useMemo(
    () =>
      slots
        .flatMap((slot) => {
          const start = asInstant(slot.start);
          const end = asInstant(slot.end);
          return start && end && end.getTime() > start.getTime() ? [{ slot, start, end }] : [];
        })
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [slots]
  );
  const chosenDate = valid.find(({ slot }) => slot.id === selected)?.start;
  const reference = day ?? chosenDate ?? (initialDate && asInstant(initialDate)) ?? valid[0]?.start;
  const key = reference ? dayString(dayFormatter, reference) : '';
  const available = valid.filter(({ start }) => dayString(dayFormatter, start) === key);
  const zoneOptions = timeZones && [...new Set([zone, ...timeZones.filter(isValidTimeZone)])];

  return (
    <div ref={ref} style={style} className={cx(classes.root, className)}>
      {zoneOptions && zoneOptions.length > 1 ? (
        <TimeZonePicker
          label={text.timeZone}
          data={zoneOptions}
          value={zone}
          disabled={disabled}
          onChange={(next) => {
            if (next) setZone(next);
          }}
        />
      ) : (
        <p className={classes.timeZone}>
          {text.timeZone} · {zone}
        </p>
      )}
      <div className={classes.body}>
        {reference && (
          <div role="group" aria-label={text.calendar} inert={disabled || undefined}>
            <Calendar
              date={reference}
              locale={locale}
              timeZone={zone}
              onDateChange={(next) => {
                if (!disabled) {
                  setDay(next);
                  onDayChange?.(dayString(dayFormatter, next));
                }
              }}
            />
          </div>
        )}
        <div role="group" aria-label={text.slots} aria-busy={loading || undefined}>
          {loading && <p role="status">{text.loading}</p>}
          {!loading && !available.length && <p role="status">{text.unavailable}</p>}
          <div className={classes.slots}>
            {available.map(({ slot, start, end }) => (
              <Button
                key={slot.id}
                type="button"
                appearance={slot.id === selected ? 'filled' : 'outline'}
                aria-pressed={slot.id === selected}
                disabled={disabled || loading || slot.disabled}
                onClick={() => {
                  setSelected(slot.id);
                  onChange?.(slot);
                }}
              >
                {timeFormatter.format(start)} – {timeFormatter.format(end)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

TimeSlotPicker.displayName = 'TimeSlotPicker';
