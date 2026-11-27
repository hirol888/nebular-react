import React, { forwardRef, useId } from 'react';
import { fromTimeZone, isValidTimeZone, toTimeZone } from '@nebular-react/hooks';
import { createStyles, DefaultProps, Selectors } from '@nebular-react/styles';
import { Fieldset } from '../Fieldset';
import { FormControl } from '../FormControl';
import { Input } from '../Input';
import { NativeSelect } from '../NativeSelect';
import { expandRecurrence } from '../Scheduler/recurrence';
import type { SchedulerRecurrence, SchedulerRecurrenceFrequency } from '../Scheduler/types';

type EndMode = 'never' | 'count' | 'until';
type Frequency = SchedulerRecurrenceFrequency | 'none';

export interface RecurrenceEditorLabels {
  legend: string;
  frequency: string;
  frequencies: Record<Frequency, string>;
  interval: string;
  ends: string;
  endModes: Record<EndMode, string>;
  count: string;
  until: string;
  preview: string;
  emptyPreview: string;
}

const defaultLabels: RecurrenceEditorLabels = {
  legend: 'Recurrence',
  frequency: 'Frequency',
  frequencies: { none: 'Does not repeat', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' },
  interval: 'Interval',
  ends: 'Ends',
  endModes: { never: 'Never', count: 'After a number of occurrences', until: 'On a date' },
  count: 'Number of occurrences',
  until: 'End date',
  preview: 'Next occurrences',
  emptyPreview: 'No occurrences'
};

const useStyles = createStyles(() => ({
  root: { minWidth: 0 },
  controls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))',
    gap: 'var(--recurrence-editor-gap, 0.75rem)'
  },
  preview: { color: 'var(--text-basic-color, #222b45)', fontSize: '0.875rem' },
  previewTitle: { margin: 0, fontWeight: 600 },
  previewList: { marginBlock: '0.25rem 0', paddingInlineStart: '1.25rem' }
}));

export type RecurrenceEditorStylesNames = Selectors<typeof useStyles>;

export interface RecurrenceEditorProps
  extends
    DefaultProps<RecurrenceEditorStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'fieldset'>, 'children' | 'onChange'> {
  value: SchedulerRecurrence | null;
  onChange?(value: SchedulerRecurrence | null): void;
  /** Start of the series. Showing a preview requires this value. */
  start?: Date;
  /** IANA time zone of the series, used to maintain its local time across DST changes. */
  timeZone?: string;
  /** Maximum preview entries, from 0 (hidden) to 50. Includes the series start. Defaults to 5. */
  previewCount?: number;
  /** Locale used to format preview dates. Use labels to translate the controls. */
  locale?: string;
  labels?: Partial<Omit<RecurrenceEditorLabels, 'frequencies' | 'endModes'>> & {
    frequencies?: Partial<RecurrenceEditorLabels['frequencies']>;
    endModes?: Partial<RecurrenceEditorLabels['endModes']>;
  };
}

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

function dateOnly(value: Date | string, timeZone: string | undefined) {
  if (typeof value === 'string' && dateOnlyPattern.test(value)) return value;

  const date = typeof value === 'string' ? new Date(value) : value;
  if (!Number.isFinite(date.getTime())) return '';

  const wall = timeZone ? toTimeZone(date, timeZone) : date;
  const year = String(wall.getFullYear()).padStart(4, '0');
  const month = String(wall.getMonth() + 1).padStart(2, '0');
  const day = String(wall.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function previewOccurrences(
  recurrence: SchedulerRecurrence,
  start: Date,
  timeZone: string | undefined,
  limit: number
) {
  const wallStart = timeZone ? toTimeZone(start, timeZone) : start;
  const wallEnd = new Date(8.64e15);
  let { until } = recurrence;
  if (
    timeZone &&
    until !== undefined &&
    (typeof until !== 'string' || !dateOnlyPattern.test(until))
  ) {
    const end = typeof until === 'string' ? new Date(until) : until;
    if (Number.isFinite(end.getTime())) until = toTimeZone(end, timeZone);
  }
  return expandRecurrence(
    { start: wallStart, id: 'preview', title: '', recurrence: { ...recurrence, until } },
    { start: wallStart, end: wallEnd },
    { maxOccurrences: limit }
  ).map(({ start: occurrence, index }) => {
    if (index === 0) return start;
    return timeZone ? fromTimeZone(occurrence, timeZone) : occurrence;
  });
}

const RecurrenceEditor = forwardRef<HTMLFieldSetElement, RecurrenceEditorProps>((props, ref) => {
  const {
    value,
    onChange,
    start,
    timeZone,
    previewCount = 5,
    locale,
    labels,
    disabled,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = props;
  const { classes, cx } = useStyles(undefined, {
    name: 'recurrence-editor',
    classNames,
    styles,
    unstyled
  });
  const text = {
    ...defaultLabels,
    ...labels,
    frequencies: { ...defaultLabels.frequencies, ...labels?.frequencies },
    endModes: { ...defaultLabels.endModes, ...labels?.endModes }
  };
  const id = useId();
  const zone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;
  const validStart = start && Number.isFinite(start.getTime()) ? start : undefined;
  const limit = Number.isFinite(previewCount)
    ? Math.max(0, Math.min(50, Math.floor(previewCount)))
    : 0;
  const occurrences =
    value && validStart && limit > 0
      ? previewOccurrences(value, validStart, zone, limit)
      : undefined;
  const formatter =
    occurrences &&
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: zone
    });
  const endMode: EndMode =
    value?.count !== undefined ? 'count' : value?.until !== undefined ? 'until' : 'never';

  const commit = (nextValue: SchedulerRecurrence | null) => {
    if (!disabled) onChange?.(nextValue);
  };

  const setFrequency = (next: Frequency) => {
    commit(next === 'none' ? null : { ...value, frequency: next });
  };

  const setEndMode = (next: EndMode) => {
    if (!value || next === endMode) return;
    const { frequency, interval } = value;
    const base = { frequency, ...(interval === undefined ? {} : { interval }) };
    if (next === 'count') commit({ ...base, count: 1 });
    else if (next === 'until') commit({ ...base, until: dateOnly(validStart ?? new Date(), zone) });
    else commit(base);
  };

  const setPositiveInteger = (field: 'interval' | 'count', next: number) => {
    if (!value || !Number.isSafeInteger(next) || next < 1) return;
    if (field === 'count') {
      const { until: _until, ...withoutUntil } = value;
      commit({ ...withoutUntil, count: next });
    } else commit({ ...value, interval: next });
  };

  return (
    <Fieldset
      {...others}
      ref={ref}
      className={cx(classes.root, className)}
      disabled={disabled}
      legend={text.legend}
    >
      <div className={classes.controls}>
        <NativeSelect
          label={text.frequency}
          data={Object.entries(text.frequencies).map(([key, label]) => ({ value: key, label }))}
          value={value?.frequency ?? 'none'}
          onChange={(next) => setFrequency(next as Frequency)}
        />
        {value && (
          <>
            <FormControl label={text.interval} htmlFor={`${id}-interval`}>
              <Input
                id={`${id}-interval`}
                type="number"
                min={1}
                step={1}
                fullWidth
                value={value.interval ?? 1}
                onChange={(event) =>
                  setPositiveInteger('interval', event.currentTarget.valueAsNumber)
                }
              />
            </FormControl>
            <NativeSelect
              label={text.ends}
              data={Object.entries(text.endModes).map(([key, label]) => ({ value: key, label }))}
              value={endMode}
              onChange={(next) => setEndMode(next as EndMode)}
            />
            {endMode === 'count' && (
              <FormControl label={text.count} htmlFor={`${id}-count`}>
                <Input
                  id={`${id}-count`}
                  type="number"
                  min={1}
                  step={1}
                  fullWidth
                  value={value.count ?? 1}
                  onChange={(event) =>
                    setPositiveInteger('count', event.currentTarget.valueAsNumber)
                  }
                />
              </FormControl>
            )}
            {endMode === 'until' && value.until !== undefined && (
              <FormControl label={text.until} htmlFor={`${id}-until`}>
                <Input
                  id={`${id}-until`}
                  type="date"
                  fullWidth
                  value={dateOnly(value.until, zone)}
                  onChange={(event) => {
                    const until = event.currentTarget.value;
                    if (until) commit({ ...value, until });
                  }}
                />
              </FormControl>
            )}
          </>
        )}
      </div>
      {occurrences && formatter && (
        <div className={classes.preview}>
          <p id={`${id}-preview`} className={classes.previewTitle}>
            {text.preview}
          </p>
          {occurrences.length > 0 ? (
            <ul aria-labelledby={`${id}-preview`} className={classes.previewList}>
              {occurrences.map((occurrence, index) => (
                <li key={`${occurrence.valueOf()}-${index}`}>
                  <time dateTime={occurrence.toISOString()}>{formatter.format(occurrence)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p>{text.emptyPreview}</p>
          )}
        </div>
      )}
    </Fieldset>
  );
});

RecurrenceEditor.displayName = 'RecurrenceEditor';

export { RecurrenceEditor };
