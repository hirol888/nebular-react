import React, { forwardRef, useId, useMemo, useState } from 'react';
import { useUncontrolled } from '@nebular-react/hooks';
import { createStyles } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { Input } from '../Input';
import { TimeZonePicker } from '../TimeZonePicker';
import {
  AVAILABILITY_WEEKDAYS,
  findOpenAvailabilityInterval,
  isAvailabilityDate,
  validateAvailability
} from './availability';
import type {
  AvailabilityInterval,
  AvailabilityIssue,
  AvailabilityIssueCode,
  AvailabilitySchedule,
  AvailabilityWeekday
} from './availability';

export interface AvailabilityEditorLabels {
  timeZone: string;
  week: string;
  overrides: string;
  overrideDate: string;
  addOverride: string;
  removeOverride(date: string): string;
  addInterval: string;
  removeInterval(position: number): string;
  start(position: number): string;
  end(position: number): string;
  unavailable: string;
  midnightHint: string;
  errors: Partial<Record<AvailabilityIssueCode, string>>;
}

const defaultMessages: Record<AvailabilityIssueCode, string> = {
  timeZone: 'Choose a valid time zone.',
  time: 'Enter a valid start and end time.',
  order: 'Start time must be before end time.',
  overlap: 'Time intervals overlap.',
  date: 'Enter a valid calendar date.',
  duplicateDate: 'This date already has an override.'
};

const defaults: AvailabilityEditorLabels = {
  timeZone: 'Time zone',
  week: 'Weekly availability',
  overrides: 'Date overrides',
  overrideDate: 'Override date',
  addOverride: 'Add date override',
  removeOverride: (date) => `Remove override for ${date}`,
  addInterval: 'Add time interval',
  removeInterval: (position) => `Remove interval ${position}`,
  start: (position) => `Start ${position}`,
  end: (position) => `End ${position}`,
  unavailable: 'Unavailable',
  midnightHint: 'An end time of 00:00 means midnight at the end of the day.',
  errors: defaultMessages
};

const defaultSchedule: AvailabilitySchedule = { timeZone: 'UTC', week: {}, overrides: [] };

const useStyles = createStyles(() => ({
  root: { display: 'grid', gap: '1rem', minWidth: 0 },
  section: { display: 'grid', gap: '0.5rem', minWidth: 0 },
  heading: { margin: 0, fontWeight: 600, color: 'var(--text-basic-color, #222b45)' },
  intervalGroup: {
    display: 'grid',
    gap: '0.5rem',
    minWidth: 0,
    margin: 0,
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--border-radius, 0.25rem)'
  },
  row: {
    display: 'flex',
    alignItems: 'end',
    flexWrap: 'wrap',
    columnGap: '0.5rem',
    rowGap: '0.25rem'
  },
  field: { flex: '1 1 8.5rem', display: 'grid', minWidth: 0, gap: '0.25rem' },
  hint: { margin: 0, color: 'var(--text-basic-color, #222b45)', fontSize: '0.875rem' },
  error: { margin: 0, color: 'var(--color-danger-700, #b81d49)' },
  action: { justifySelf: 'start' }
}));

export type AvailabilityEditorStylesNames = Selectors<typeof useStyles>;

export interface AvailabilityEditorProps
  extends
    DefaultProps<AvailabilityEditorStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue' | 'children'> {
  value?: AvailabilitySchedule;
  defaultValue?: AvailabilitySchedule;
  /** Emits the draft and its issues so the consumer can decide when to commit it. */
  onChange?(value: AvailabilitySchedule, issues: AvailabilityIssue[]): void;
  timeZones?: readonly string[];
  locale?: string;
  weekdayLabels?: Partial<Record<AvailabilityWeekday, string>>;
  labels?: Partial<AvailabilityEditorLabels>;
  disabled?: boolean;
}

interface IntervalGroupProps {
  title: string;
  intervals: readonly AvailabilityInterval[];
  issues: readonly AvailabilityIssue[];
  labels: AvailabilityEditorLabels;
  classes: Record<AvailabilityEditorStylesNames, string>;
  disabled?: boolean;
  onChange(next: AvailabilityInterval[]): void;
  children?: React.ReactNode;
}

function IntervalGroup({
  title,
  intervals,
  issues,
  labels,
  classes,
  disabled,
  onChange,
  children
}: IntervalGroupProps) {
  const id = useId();
  const errorId = `${id}-issues`;
  const nextInterval = findOpenAvailabilityInterval(intervals);
  const messages = Array.from(new Set(issues.map((issue) => labels.errors[issue.code])));

  const update = (index: number, key: keyof AvailabilityInterval, value: string) => {
    onChange(
      intervals.map((interval, position) =>
        position === index ? { ...interval, [key]: value } : interval
      )
    );
  };

  return (
    <fieldset
      className={classes.intervalGroup}
      disabled={disabled}
      aria-describedby={messages.length ? errorId : undefined}
    >
      <legend className={classes.heading}>{title}</legend>
      {!intervals.length && <p className={classes.hint}>{labels.unavailable}</p>}
      {intervals.map((interval, index) => {
        const invalid = issues.some(
          (issue) => issue.intervalIndex === index || issue.otherIntervalIndex === index
        );
        const startId = `${id}-start-${index}`;
        const endId = `${id}-end-${index}`;
        return (
          <div key={index} className={classes.row}>
            <div className={classes.field}>
              <label htmlFor={startId}>{labels.start(index + 1)}</label>
              <Input
                id={startId}
                type="time"
                fullWidth
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? errorId : undefined}
                value={interval.start}
                onChange={(event) => update(index, 'start', event.currentTarget.value)}
              />
            </div>
            <div className={classes.field}>
              <label htmlFor={endId}>{labels.end(index + 1)}</label>
              <Input
                id={endId}
                type="time"
                fullWidth
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? errorId : undefined}
                value={interval.end}
                onChange={(event) => update(index, 'end', event.currentTarget.value)}
              />
            </div>
            <Button
              type="button"
              appearance="ghost"
              onClick={() => onChange(intervals.filter((_, position) => position !== index))}
            >
              {labels.removeInterval(index + 1)}
            </Button>
          </div>
        );
      })}
      {messages.length > 0 && (
        <p role="alert" className={classes.error} id={errorId}>
          {messages.join(' ')}
        </p>
      )}
      <div className={classes.row}>
        <Button
          type="button"
          appearance="outline"
          disabled={disabled || !nextInterval}
          onClick={() => nextInterval && onChange([...intervals, nextInterval])}
        >
          {labels.addInterval}
        </Button>
        {children}
      </div>
    </fieldset>
  );
}

export const AvailabilityEditor = forwardRef<HTMLDivElement, AvailabilityEditorProps>(
  (props, ref) => {
    const {
      value,
      defaultValue,
      onChange,
      timeZones,
      locale = 'en-US',
      weekdayLabels,
      labels,
      disabled,
      className,
      classNames,
      styles,
      unstyled,
      ...others
    } = props;
    const text = { ...defaults, ...labels, errors: { ...defaultMessages, ...labels?.errors } };
    const { classes, cx } = useStyles(null, {
      name: 'availability-editor',
      classNames,
      styles,
      unstyled
    });
    const [schedule, setSchedule] = useUncontrolled({
      value,
      defaultValue,
      finalValue: defaultSchedule,
      onChange: (next) => onChange?.(next, validateAvailability(next))
    });
    const [overrideDate, setOverrideDate] = useState('');
    const id = useId();
    const dateId = `${id}-override-date`;
    const weekdayFormatter = useMemo(
      () => new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }),
      [locale]
    );
    const dateFormatter = useMemo(
      () => new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }),
      [locale]
    );
    const issues = validateAvailability(schedule);
    const duplicate = schedule.overrides.some(({ date }) => date === overrideDate);
    const canAddOverride = isAvailabilityDate(overrideDate) && !duplicate && !disabled;
    const zones = timeZones ? [...new Set([schedule.timeZone, ...timeZones])] : undefined;

    function addOverride() {
      if (!canAddOverride) return;
      setSchedule({
        ...schedule,
        overrides: [...schedule.overrides, { date: overrideDate, intervals: [] }]
      });
      setOverrideDate('');
    }

    return (
      <div {...others} ref={ref} className={cx(classes.root, className)}>
        <TimeZonePicker
          label={text.timeZone}
          value={schedule.timeZone}
          data={zones}
          error={
            issues.some((issue) => issue.code === 'timeZone') ? text.errors.timeZone : undefined
          }
          disabled={disabled}
          onChange={(next) => {
            if (next) setSchedule({ ...schedule, timeZone: next });
          }}
        />

        <section className={classes.section} aria-label={text.week}>
          <h3 className={classes.heading}>{text.week}</h3>
          <p className={classes.hint}>{text.midnightHint}</p>
          {AVAILABILITY_WEEKDAYS.map((day, index) => (
            <IntervalGroup
              key={day}
              title={
                weekdayLabels?.[day] ??
                weekdayFormatter.format(new Date(Date.UTC(2026, 0, 5 + index)))
              }
              intervals={schedule.week[day] ?? []}
              issues={issues.filter((issue) => issue.day === day)}
              labels={text}
              classes={classes}
              disabled={disabled}
              onChange={(next) =>
                setSchedule({ ...schedule, week: { ...schedule.week, [day]: next } })
              }
            />
          ))}
        </section>

        <section className={classes.section} aria-label={text.overrides}>
          <h3 className={classes.heading}>{text.overrides}</h3>
          <div className={classes.row}>
            <div className={classes.field}>
              <label htmlFor={dateId}>{text.overrideDate}</label>
              <Input
                id={dateId}
                type="date"
                fullWidth
                disabled={disabled}
                aria-invalid={duplicate || undefined}
                aria-describedby={duplicate ? `${dateId}-error` : undefined}
                value={overrideDate}
                onChange={(event) => setOverrideDate(event.currentTarget.value)}
              />
            </div>
            <Button
              type="button"
              appearance="outline"
              disabled={!canAddOverride}
              onClick={addOverride}
            >
              {text.addOverride}
            </Button>
          </div>
          {duplicate && (
            <p className={classes.error} id={`${dateId}-error`} role="status">
              {text.errors.duplicateDate}
            </p>
          )}
          {schedule.overrides.map((override, index) => {
            const title = isAvailabilityDate(override.date)
              ? dateFormatter.format(new Date(`${override.date}T00:00:00Z`))
              : override.date || text.errors.date;
            return (
              <IntervalGroup
                key={`${override.date}-${index}`}
                title={title}
                intervals={override.intervals}
                issues={issues.filter((issue) => issue.overrideIndex === index)}
                labels={text}
                classes={classes}
                disabled={disabled}
                onChange={(next) =>
                  setSchedule({
                    ...schedule,
                    overrides: schedule.overrides.map((item, position) =>
                      position === index ? { ...item, intervals: next } : item
                    )
                  })
                }
              >
                <Button
                  type="button"
                  appearance="ghost"
                  className={classes.action}
                  onClick={() =>
                    setSchedule({
                      ...schedule,
                      overrides: schedule.overrides.filter((_, position) => position !== index)
                    })
                  }
                >
                  {text.removeOverride(override.date)}
                </Button>
              </IntervalGroup>
            );
          })}
        </section>
      </div>
    );
  }
);

AvailabilityEditor.displayName = 'AvailabilityEditor';
