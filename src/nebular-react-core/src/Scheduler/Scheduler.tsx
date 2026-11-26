import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Moment } from 'moment';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { DateType, isValidTimeZone, useDateFns } from '@nebular-react/hooks';
import { shiftFromTimeZone, shiftToTimeZone } from '../Shared/timezone';
import { useDefaultLocale } from '../Shared/hooks';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { SegmentedControl } from '../SegmentedControl';
import {
  DEFAULT_EVENT_DURATION_MINUTES,
  MINUTES_PER_DAY,
  createWallTime,
  getMinutesOfDay,
  getWallDaySpan,
  moveAllDayRange,
  moveEvent,
  normalizeDefaultDurationMinutes,
  normalizeInteractionRange,
  normalizeSnapMinutes,
  resizeEvent,
  snapToStep,
  startOfDay
} from './interaction';
import type { SchedulerDragGeometry } from './interaction';
import { expandRecurrence } from './recurrence';
import type {
  SchedulerDateRange,
  SchedulerEvent,
  SchedulerEventRange,
  SchedulerResource,
  SchedulerView
} from './types';

export type {
  SchedulerDateRange,
  SchedulerEvent,
  SchedulerEventRange,
  SchedulerOccurrence,
  SchedulerRecurrence,
  SchedulerRecurrenceFrequency,
  SchedulerResource,
  SchedulerView
} from './types';

export interface SchedulerLabels {
  noEvents: string;
  unassigned: string;
  today: string;
  previousPeriod: string;
  nextPeriod: string;
  view: string;
  day: string;
  week: string;
  month: string;
  more(count: number): string;
  timeZone(zone: string): string;
  editableInstructions: string;
  selectableInstructions: string;
}

export interface SchedulerProps<
  TDate extends Date | Moment = Date
> extends DefaultProps<SchedulerStylesNames> {
  events: SchedulerEvent<TDate>[];
  /**
   * Visible period as an absolute instant. When `timeZone` is provided the
   * value is converted to that zone before being rendered.
   */
  date?: TDate;
  defaultDate?: TDate;
  onDateChange?(date: TDate): void;
  view?: SchedulerView;
  defaultView?: SchedulerView;
  onViewChange?(view: SchedulerView): void;
  onEventClick?(event: SchedulerEvent<TDate>): void;
  renderEvent?(event: SchedulerEvent<TDate>, view: SchedulerView): React.ReactNode;
  dateType?: DateType;
  locale?: string;
  /** Overrides the built-in toolbar, empty-state and accessible labels. */
  labels?: Partial<SchedulerLabels>;
  withNavigation?: boolean;
  emptyState?: React.ReactNode;
  ariaLabel?: string;
  /**
   * IANA time zone used to render events that do not define their own
   * `timeZone`. Values stay absolute; the wall clock of this zone is used for
   * placement and navigation, and emitted values are converted back to
   * absolute instants.
   */
  timeZone?: string;
  /**
   * Enables pointer and keyboard edits in the day/week views. Dragging moves
   * the event, dragging the bottom edge resizes it, and committing only
   * happens on pointer release (or on the key press, for keyboard edits).
   *
   * Recurring occurrences are edited individually: the callbacks receive the
   * original series event plus the absolute start/end of the displayed
   * occurrence, so consumers can persist an exception without mutating the
   * series. The component never rewrites `events`. When an event has no `end`,
   * edits use a 30-minute duration.
   */
  editable?: boolean;
  /** Grid used by drag, resize and arrow-key edits. Defaults to 15 minutes. */
  snapMinutes?: number;
  onEventChange?(event: SchedulerEvent<TDate>, next: SchedulerEventRange<TDate>): void;
  onEventResize?(event: SchedulerEvent<TDate>, next: SchedulerEventRange<TDate>): void;
  /**
   * Enables drag-to-create in the day/week time grid. Dragging over an empty
   * area previews the range (snapped to `snapMinutes`, at least one step) and
   * emits it on pointer release; a simple click creates a slot with
   * `defaultDurationMinutes`. `Escape` cancels the selection.
   *
   * The grid also becomes focusable: with it focused, the arrow keys move a
   * time cursor and `N` or `Enter` creates a slot at the cursor.
   */
  selectable?: boolean;
  /** Emitted when a range is created by dragging, clicking or the keyboard. */
  onRangeSelect?(range: SchedulerDateRange<TDate>): void;
  /** Alias of `onRangeSelect`, called with the same range. */
  onEventCreate?(range: SchedulerDateRange<TDate>): void;
  /** Duration of a slot created by a simple click or the keyboard. Defaults to 30. */
  defaultDurationMinutes?: number;
  /** Lanes rendered in the day/week views when `resourceView` is enabled. */
  resources?: SchedulerResource[];
  /**
   * Renders one lane per resource (plus an `Unassigned` lane when needed) in
   * the day/week views. The month view always stays lane-free.
   */
  resourceView?: boolean;
  /** Hides the resource lane headers while keeping the lanes. Defaults to true. */
  showResources?: boolean;
  onResourceClick?(resource: SchedulerResource): void;
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
    fontFamily: 'var(--scheduler-text-font-family, inherit)'
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '0.75rem'
  },

  navigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },

  todayButton: {
    color: 'var(--scheduler-today-button-text-color, var(--text-basic-color, #222b45))'
  },

  title: {
    flex: '1 1 auto',
    color: 'var(--scheduler-title-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--scheduler-title-font-size, 1rem)',
    fontWeight: 700,
    textAlign: 'center'
  },

  grid: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--scheduler-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--scheduler-border-radius, 0.5rem)',
    overflow: 'hidden'
  },

  weekdayRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    backgroundColor:
      'var(--scheduler-header-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  weekday: {
    padding: '0.5rem',
    borderBottom: '1px solid var(--scheduler-border-color, var(--border-basic-color-3, #e4e9f2))',
    color: 'var(--scheduler-weekday-color, var(--text-basic-color, #222b45))',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
    textAlign: 'center',
    textTransform: 'uppercase'
  },

  weekRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    minHeight: 'var(--scheduler-week-row-height, 6rem)'
  },

  timeRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    minHeight: 'var(--scheduler-time-row-height, 20rem)'
  },

  singleColumn: {
    gridTemplateColumns: 'minmax(0, 1fr)'
  },

  timeColumn: {
    position: 'relative',
    minHeight: 'var(--scheduler-time-row-height, 20rem)',
    padding: '0.25rem',
    borderRight: '1px solid var(--scheduler-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderBottom: '1px solid var(--scheduler-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundImage:
      'repeating-linear-gradient(to bottom, transparent 0, transparent calc(100% / 24 - 1px), var(--scheduler-time-line-color, var(--background-basic-color-3, #edf1f7)) calc(100% / 24 - 1px), var(--scheduler-time-line-color, var(--background-basic-color-3, #edf1f7)) calc(100% / 24))',
    backgroundColor:
      'var(--scheduler-cell-background-color, var(--background-basic-color-1, #ffffff))',
    overflow: 'hidden',

    '&:last-child': {
      borderRight: 0
    }
  },

  monthCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    minHeight: 'var(--scheduler-month-cell-height, 6rem)',
    padding: '0.35rem',
    borderRight: '1px solid var(--scheduler-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderBottom: '1px solid var(--scheduler-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--scheduler-cell-background-color, var(--background-basic-color-1, #ffffff))',
    overflow: 'hidden',

    '&:nth-child(7n)': {
      borderRight: 0
    }
  },

  outside: {
    backgroundColor:
      'var(--scheduler-outside-background-color, var(--background-basic-color-2, #f7f9fc))',
    color: 'var(--scheduler-outside-color, var(--text-basic-color, #222b45))'
  },

  today: {
    backgroundColor:
      'var(--scheduler-today-background-color, var(--background-basic-color-2, #f7f9fc))',

    '& $dayNumber': {
      backgroundColor: 'var(--scheduler-today-color, var(--color-primary-500, #3366ff))',
      color: '#ffffff'
    }
  },

  dayNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '50%',
    fontSize: '0.75rem',
    fontWeight: 600
  },

  events: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    minHeight: 0,
    overflow: 'hidden'
  },

  event: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    width: '100%',
    padding: '0.15rem 0.35rem',
    border: 0,
    borderRadius: '0.2rem',
    backgroundColor: 'var(--scheduler-event-background-color, var(--color-primary-500, #3366ff))',
    color: 'var(--scheduler-event-text-color, #ffffff)',
    font: 'inherit',
    fontSize: '0.7rem',
    lineHeight: 1.35,
    textAlign: 'left',
    cursor: 'pointer',
    overflow: 'hidden',

    '@supports (color: contrast-color(white))': {
      color:
        'var(--scheduler-event-text-color, contrast-color(var(--scheduler-occurrence-background, var(--scheduler-event-background-color, var(--color-primary-500, #3366ff)))))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  positionedEvent: {
    position: 'absolute',
    right: '0.25rem',
    left: '0.25rem',
    width: 'auto',
    minHeight: '1.25rem',
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 0,
    cursor: 'grab',
    zIndex: 1
  },

  dragging: {
    opacity: 0.85,
    cursor: 'grabbing',
    outline: '2px dashed var(--scheduler-event-text-color, #ffffff)',
    outlineOffset: '-2px'
  },

  resizeHandle: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: '0.4rem',
    cursor: 'ns-resize',
    borderBottomLeftRadius: '0.2rem',
    borderBottomRightRadius: '0.2rem',
    backgroundColor: 'rgba(255, 255, 255, 0.35)'
  },

  eventTimeZone: {
    flex: '0 0 auto',
    fontSize: '0.6rem',
    whiteSpace: 'nowrap'
  },

  eventTime: {
    flex: '0 0 auto',
    fontVariantNumeric: 'tabular-nums'
  },

  eventTitle: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  more: {
    color: 'var(--scheduler-more-color, var(--text-basic-color, #222b45))',
    fontSize: '0.65rem'
  },

  selectable: {
    cursor: 'crosshair'
  },

  selection: {
    position: 'absolute',
    right: '0.25rem',
    left: '0.25rem',
    border: '1px solid var(--scheduler-selection-border-color, var(--color-primary-500, #3366ff))',
    borderRadius: '0.2rem',
    backgroundColor: 'var(--scheduler-selection-background-color, rgba(51, 102, 255, 0.18))',
    pointerEvents: 'none',
    zIndex: 2
  },

  keyboardCursor: {
    position: 'absolute',
    right: '0.25rem',
    left: '0.25rem',
    border: '2px dashed var(--scheduler-selection-border-color, var(--color-primary-500, #3366ff))',
    borderRadius: '0.2rem',
    pointerEvents: 'none',
    zIndex: 2
  },

  resourceHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '1.75rem',
    padding: '0.25rem 0.5rem',
    borderBottom: '1px solid var(--scheduler-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--scheduler-resource-header-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  resourceHeaderCell: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem'
  },

  resourceColor: {
    display: 'inline-block',
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '50%'
  },

  resourceName: {
    color: 'var(--scheduler-resource-label-color, var(--text-basic-color, #222b45))',
    fontSize: '0.75rem',
    fontWeight: 600
  },

  resourceButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: 0,
    border: 0,
    backgroundColor: 'transparent',
    color: 'var(--scheduler-resource-label-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  allDayEvents: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    marginBottom: '0.25rem'
  },

  dayCell: {
    minHeight: 'var(--scheduler-day-min-height, 12rem)',
    padding: '0.75rem',
    borderBottom: '1px solid var(--scheduler-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--scheduler-cell-background-color, var(--background-basic-color-1, #ffffff))'
  },

  weekDayHeader: {
    marginBottom: '0.5rem',
    padding: '0.5rem 0.75rem',
    color: 'var(--scheduler-week-day-color, var(--text-basic-color, #222b45))',
    fontSize: '0.8125rem',
    fontWeight: 600
  },

  empty: {
    padding: '1rem',
    color: 'var(--scheduler-empty-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.8125rem',
    textAlign: 'center'
  },

  instructions: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
  }
}));

export type SchedulerStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<SchedulerProps<any>> = {
  defaultView: 'month',
  withNavigation: true,
  ariaLabel: 'Scheduler',
  editable: false,
  selectable: false,
  defaultDurationMinutes: DEFAULT_EVENT_DURATION_MINUTES,
  resourceView: false,
  showResources: true,
  snapMinutes: 15
};

type SchedulerEditMode = 'move' | 'resize';

interface SchedulerLane {
  id: string;
  name: string;
  color?: string;
  unassigned?: boolean;
}

interface SchedulerSelection<TDate extends Date | Moment> extends SchedulerDateRange<TDate> {
  /** Day column (day + lane) that owns the selection preview. */
  columnId: string;
}

interface SchedulerSelectState<TDate extends Date | Moment> {
  day: TDate;
  columnId: string;
  anchorMinutes: number;
  rectTop: number;
  rectHeight: number;
  next?: { startMinutes: number; endMinutes: number };
}

interface SchedulerCursor {
  dayKey: string;
  minutes: number;
}

interface SchedulerAllDayDragState<TDate extends Date | Moment> {
  key: string;
  event: SchedulerEvent<TDate>;
  range: SchedulerDateRange<TDate>;
  pointerX: number;
  dayWidth: number;
  dayCount: number;
  sourceDayIndex: number;
  next?: SchedulerDateRange<TDate>;
}

const UNASSIGNED_RESOURCE_ID = '__unassigned__';
const DEFAULT_SELECTION_START_MINUTES = 9 * 60;

interface SchedulerDisplayOccurrence<TDate extends Date | Moment> {
  key: string;
  event: SchedulerEvent<TDate>;
  /** Placement wall clock (calendar time zone). */
  positionStart: TDate;
  positionEnd: TDate;
  /** Label wall clock (event time zone). */
  labelStart: TDate;
  /** Absolute instant of the occurrence start. */
  absoluteStart: TDate;
  /** Effective time zone of the event (falls back to the calendar one). */
  timeZone?: string;
  showTimeZone: boolean;
}

interface SchedulerPreview<TDate extends Date | Moment> extends SchedulerDateRange<TDate> {
  key: string;
  mode: SchedulerEditMode;
}

interface SchedulerDragState<TDate extends Date | Moment> {
  key: string;
  mode: SchedulerEditMode;
  event: SchedulerEvent<TDate>;
  range: SchedulerDateRange<TDate>;
  pointerX: number;
  pointerY: number;
  columnHeight: number;
  dayWidth: number;
  dayCount: number;
  sourceDayIndex: number;
  snapMinutes: number;
  next?: SchedulerDateRange<TDate>;
}

function getLocalTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

function getTimeZoneShortName(timeZone: string, date: Date): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short'
    }).formatToParts(date);

    return parts.find((part) => part.type === 'timeZoneName')?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

function toNativeDate(value: Date | Moment): Date {
  return value instanceof Date ? value : value.toDate();
}

function toIsoString(value: Date | Moment): string {
  return toNativeDate(value).toISOString();
}

function Scheduler<TDate extends Date | Moment = Date>(props: SchedulerProps<TDate>) {
  const { t } = useNebularLocale();
  const defaultLocale = useDefaultLocale(props.locale);
  const defaultLabels = useMemo<SchedulerLabels>(
    () => ({
      noEvents: t('scheduler.noEvents', 'No events'),
      unassigned: t('scheduler.unassigned', 'Unassigned'),
      today: t('scheduler.today', 'Today'),
      previousPeriod: t('scheduler.previousPeriod', 'Previous period'),
      nextPeriod: t('scheduler.nextPeriod', 'Next period'),
      view: t('scheduler.view', 'Scheduler view'),
      day: t('scheduler.day', 'Day'),
      week: t('scheduler.week', 'Week'),
      month: t('scheduler.month', 'Month'),
      more: (count) => t('scheduler.more', `+${count} more`, { count }),
      timeZone: (zone) => t('scheduler.timeZone', `Time zone ${zone}`, { zone }),
      editableInstructions: t(
        'scheduler.editableInstructions',
        'Editable event. Use the arrow keys to move it, or hold Shift and press the up or down arrow key to resize it. In the week view, the left and right arrows move the event to another day, including all-day events.'
      ),
      selectableInstructions: t(
        'scheduler.selectableInstructions',
        'Selectable grid. Drag over an empty area to create a range, or press Escape to cancel. With the grid focused, the arrow keys move a time cursor and N or Enter creates a slot.'
      )
    }),
    [t]
  );
  const {
    events,
    date,
    defaultDate,
    onDateChange,
    view,
    defaultView,
    onViewChange,
    onEventClick,
    renderEvent,
    dateType,
    locale,
    labels: labelsProp,
    withNavigation,
    emptyState,
    ariaLabel,
    timeZone,
    editable,
    snapMinutes,
    onEventChange,
    onEventResize,
    selectable,
    onRangeSelect,
    onEventCreate,
    defaultDurationMinutes,
    resources,
    resourceView,
    showResources,
    onResourceClick,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps as SchedulerProps<TDate>, {
    ...props,
    locale: defaultLocale
  });
  const labels = useMemo<SchedulerLabels>(
    () => ({ ...defaultLabels, ...labelsProp }),
    [defaultLabels, labelsProp]
  );
  const resolvedEmptyState = emptyState ?? labels.noEvents;
  const { classes, cx } = useStyles(null, {
    name: 'scheduler',
    classNames,
    styles,
    unstyled
  });
  const dateFns = useDateFns<TDate>(locale);
  const instructionsId = useId();
  const selectionInstructionsId = useId();
  const dateDescriptionId = useId();
  const [activeDate, setActiveDate] = useUncontrolled<TDate>({
    value: date,
    defaultValue: defaultDate ?? dateFns.today(dateType),
    finalValue: dateFns.today(dateType),
    onChange: onDateChange
  });
  const [activeView, setActiveView] = useUncontrolled<SchedulerView>({
    value: view,
    defaultValue: defaultView,
    finalValue: 'month',
    onChange: onViewChange
  });
  const [preview, setPreview] = useState<SchedulerPreview<TDate> | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [selection, setSelection] = useState<SchedulerSelection<TDate> | null>(null);
  const [keyboardCursor, setKeyboardCursor] = useState<SchedulerCursor | null>(null);
  const dragRef = useRef<SchedulerDragState<TDate> | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const selectionRef = useRef<SchedulerSelectState<TDate> | null>(null);
  const selectionCleanupRef = useRef<(() => void) | null>(null);
  const allDayDragRef = useRef<SchedulerAllDayDragState<TDate> | null>(null);
  const allDayCleanupRef = useRef<(() => void) | null>(null);
  const suppressClickRef = useRef(false);

  const snap = normalizeSnapMinutes(snapMinutes);
  const activeTimeZone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;
  const calendarTimeZone = activeTimeZone ?? getLocalTimeZone();

  const shiftTo = (value: TDate | undefined, targetTimeZone?: string): TDate | undefined => {
    if (value === undefined) {
      return undefined;
    }

    return (shiftToTimeZone(value, targetTimeZone) as TDate | undefined) ?? value;
  };

  const shiftFrom = (value: TDate, sourceTimeZone?: string): TDate =>
    (shiftFromTimeZone(value, sourceTimeZone) as TDate | undefined) ?? value;

  const displayActiveDate = shiftTo(activeDate, activeTimeZone) ?? activeDate;
  const commitDate = (nextDate: TDate) => setActiveDate(shiftFrom(nextDate, activeTimeZone));

  const weekStart = (() => {
    const firstDayOfWeek = dateFns.getFirstDayOfWeek();
    const offset = (dateFns.getDayOfWeek(displayActiveDate) - firstDayOfWeek + 7) % 7;

    return dateFns.addDays(displayActiveDate, -offset);
  })();

  const monthStart = dateFns.getMonthStart(displayActiveDate);
  const monthGridStart = (() => {
    const firstDayOfWeek = dateFns.getFirstDayOfWeek();
    const offset = (dateFns.getDayOfWeek(monthStart) - firstDayOfWeek + 7) % 7;

    return dateFns.addDays(monthStart, -offset);
  })();

  const weekDays = Array.from({ length: 7 }, (_, index) => dateFns.addDays(weekStart, index));
  const monthDays = Array.from({ length: 42 }, (_, index) =>
    dateFns.addDays(monthGridStart, index)
  );
  const visibleDays =
    activeView === 'day'
      ? [startOfDay(dateFns, displayActiveDate)]
      : activeView === 'week'
        ? weekDays
        : monthDays;
  const visibleDayKeys = new Set(visibleDays.map((day) => dateFns.format(day, 'YYYY-MM-DD')));
  const rangeStart = startOfDay(dateFns, visibleDays[0]);
  const rangeEnd = dateFns.addDays(startOfDay(dateFns, visibleDays[visibleDays.length - 1]), 1);

  const resourceList = resources ?? [];
  const resourceById = new Map(resourceList.map((resource) => [resource.id, resource]));
  const resourceViewEnabled = !!resourceView && resourceList.length > 0 && activeView !== 'month';
  const selectionDurationMinutes = Math.max(
    normalizeDefaultDurationMinutes(defaultDurationMinutes),
    snap
  );

  const weekdayNames = (() => {
    const names = dateFns.getDayOfWeekNames('short');
    const firstDayOfWeek = dateFns.getFirstDayOfWeek();

    return Array.from({ length: 7 }, (_, index) => names[(firstDayOfWeek + index) % 7]);
  })();

  const getEventTimeZone = (event: SchedulerEvent<TDate>): string | undefined => {
    if (event.allDay) {
      return undefined;
    }

    if (event.timeZone && isValidTimeZone(event.timeZone)) {
      return event.timeZone;
    }

    return activeTimeZone;
  };

  const buildOccurrencesByDay = () => {
    const map = new Map<string, SchedulerDisplayOccurrence<TDate>[]>();
    const allDayRangeStart = dateFns.addDays(rangeStart, -2);
    const allDayRangeEnd = dateFns.addDays(rangeEnd, 2);
    const absoluteRangeStart = shiftFrom(allDayRangeStart, activeTimeZone);
    const absoluteRangeEnd = shiftFrom(allDayRangeEnd, activeTimeZone);

    events.forEach((event) => {
      const timeZoneOfEvent = getEventTimeZone(event);
      const seriesStart = event.allDay
        ? event.start
        : (shiftTo(event.start, timeZoneOfEvent) ?? event.start);
      const seriesEnd = event.allDay
        ? event.end
        : event.end === undefined
          ? undefined
          : (shiftTo(event.end, timeZoneOfEvent) ?? event.end);
      const series: SchedulerEvent<TDate> = {
        ...event,
        start: seriesStart,
        end: seriesEnd
      };
      const expansionRange: SchedulerDateRange<TDate> = {
        start: event.allDay
          ? allDayRangeStart
          : (shiftTo(absoluteRangeStart, timeZoneOfEvent) ?? absoluteRangeStart),
        end: event.allDay
          ? allDayRangeEnd
          : (shiftTo(absoluteRangeEnd, timeZoneOfEvent) ?? absoluteRangeEnd)
      };

      expandRecurrence(series, expansionRange).forEach((occurrence) => {
        const absoluteStart = event.allDay
          ? occurrence.start
          : shiftFrom(occurrence.start, timeZoneOfEvent);
        const absoluteEnd =
          occurrence.end === undefined
            ? undefined
            : event.allDay
              ? occurrence.end
              : shiftFrom(occurrence.end, timeZoneOfEvent);
        const positionStart = event.allDay
          ? occurrence.start
          : (shiftTo(absoluteStart, activeTimeZone) ?? absoluteStart);
        const positionEnd =
          absoluteEnd === undefined
            ? dateFns.addMinutes(positionStart, DEFAULT_EVENT_DURATION_MINUTES)
            : event.allDay
              ? absoluteEnd
              : (shiftTo(absoluteEnd, activeTimeZone) ?? absoluteEnd);
        const dayKey = dateFns.format(positionStart, 'YYYY-MM-DD');

        if (!visibleDayKeys.has(dayKey)) {
          return;
        }

        const list = map.get(dayKey) ?? [];

        list.push({
          key: occurrence.key,
          event,
          positionStart,
          positionEnd,
          labelStart: event.allDay ? positionStart : occurrence.start,
          absoluteStart,
          timeZone: timeZoneOfEvent,
          showTimeZone:
            !event.allDay &&
            !!event.timeZone &&
            !!timeZoneOfEvent &&
            timeZoneOfEvent !== calendarTimeZone
        });
        map.set(dayKey, list);
      });
    });

    map.forEach((list) => {
      list.sort(
        (first, second) =>
          dateFns.valueOf(first.positionStart) - dateFns.valueOf(second.positionStart) ||
          first.key.localeCompare(second.key)
      );
    });

    return map;
  };

  const occurrencesByDay = buildOccurrencesByDay();

  const getOccurrencesForDay = (day: TDate): SchedulerDisplayOccurrence<TDate>[] =>
    occurrencesByDay.get(dateFns.format(day, 'YYYY-MM-DD')) ?? [];

  const matchesLane = (occurrence: SchedulerDisplayOccurrence<TDate>, laneId?: string): boolean => {
    if (laneId === undefined) {
      return true;
    }

    const eventResourceId = occurrence.event.resourceId;

    if (laneId === UNASSIGNED_RESOURCE_ID) {
      return !eventResourceId || !resourceById.has(eventResourceId);
    }

    return eventResourceId === laneId;
  };

  const resourceLanes: SchedulerLane[] = [];

  if (resourceViewEnabled) {
    resourceList.forEach((resource) =>
      resourceLanes.push({ id: resource.id, name: resource.name, color: resource.color })
    );

    let hasUnassigned = false;

    occurrencesByDay.forEach((list) =>
      list.forEach((occurrence) => {
        if (!matchesLane(occurrence, UNASSIGNED_RESOURCE_ID)) {
          return;
        }

        hasUnassigned = true;
      })
    );

    if (hasUnassigned) {
      resourceLanes.push({ id: UNASSIGNED_RESOURCE_ID, name: labels.unassigned, unassigned: true });
    }
  }

  const cursorLaneId = resourceViewEnabled ? resourceLanes[0]?.id : undefined;

  const getEventColor = (event: SchedulerEvent<TDate>): string | undefined => {
    if (event.color) {
      return event.color;
    }

    if (event.resourceId) {
      return resourceById.get(event.resourceId)?.color;
    }

    return undefined;
  };

  const moveDate = (direction: number) => {
    if (activeView === 'day') {
      commitDate(dateFns.addDays(displayActiveDate, direction));
    } else if (activeView === 'week') {
      commitDate(dateFns.addDays(displayActiveDate, direction * 7));
    } else {
      commitDate(dateFns.addMonths(displayActiveDate, direction));
    }
  };

  const getTitle = () => {
    if (activeView === 'day') {
      return dateFns.format(displayActiveDate, 'dddd, MMMM D, YYYY');
    }

    if (activeView === 'week') {
      const weekEnd = dateFns.addDays(weekStart, 6);

      return `${dateFns.format(weekStart, 'MMM D')} – ${dateFns.format(weekEnd, 'MMM D, YYYY')}`;
    }

    return dateFns.format(displayActiveDate, 'MMMM YYYY');
  };

  const emitRange = (
    event: SchedulerEvent<TDate>,
    next: SchedulerDateRange<TDate>,
    mode: SchedulerEditMode
  ) => {
    // All-day values are wall-clock dates without a zone, so they are emitted
    // exactly as they were handled (no calendar-zone conversion).
    const committed: SchedulerEventRange<TDate> = event.allDay
      ? { start: next.start, end: next.end }
      : {
          start: shiftFrom(next.start, activeTimeZone),
          end: shiftFrom(next.end, activeTimeZone)
        };

    if (mode === 'resize') {
      if (typeof onEventResize === 'function') {
        onEventResize(event, committed);
      }

      return;
    }

    if (typeof onEventChange === 'function') {
      onEventChange(event, committed);
    }
  };

  const finishDrag = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    dragRef.current = null;
    setDraggingKey(null);
    setPreview(null);
  };

  const handlePointerDown = (
    reactEvent: React.PointerEvent<HTMLButtonElement>,
    occurrence: SchedulerDisplayOccurrence<TDate>
  ) => {
    if (!editable || activeView === 'month' || occurrence.event.allDay) {
      return;
    }

    if (reactEvent.button > 0) {
      return;
    }

    const column = (reactEvent.currentTarget as HTMLElement).closest(
      '[data-scheduler-day]'
    ) as HTMLElement | null;

    if (!column) {
      return;
    }

    const row = column.closest('[data-scheduler-time-row]') as HTMLElement | null;
    const columns = row
      ? Array.from(row.querySelectorAll<HTMLElement>('[data-scheduler-day]'))
      : [column];
    const columnRect = column.getBoundingClientRect();
    const rowRect = row?.getBoundingClientRect();
    const dayCount = Math.max(1, columns.length);
    const dayWidth = rowRect && rowRect.width > 0 ? rowRect.width / dayCount : columnRect.width;
    const sourceDayIndex = Math.max(0, columns.indexOf(column));
    const mode: SchedulerEditMode = (reactEvent.target as HTMLElement).closest(
      '[data-scheduler-resize-handle]'
    )
      ? 'resize'
      : 'move';

    const drag: SchedulerDragState<TDate> = {
      key: occurrence.key,
      mode,
      event: occurrence.event,
      range: normalizeInteractionRange(
        dateFns,
        occurrence.positionStart,
        occurrence.positionEnd,
        snap
      ),
      pointerX: reactEvent.clientX,
      pointerY: reactEvent.clientY,
      columnHeight: columnRect.height,
      dayWidth,
      dayCount,
      sourceDayIndex,
      snapMinutes: snap
    };

    const detach = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('keydown', handleKeyDown);
      cleanupRef.current = null;
    };

    const handlePointerMove = (nativeEvent: PointerEvent) => {
      const { current } = dragRef;

      if (!current) {
        return;
      }

      const minuteDelta =
        current.columnHeight > 0
          ? snapToStep(
              ((nativeEvent.clientY - current.pointerY) / current.columnHeight) * MINUTES_PER_DAY,
              current.snapMinutes
            )
          : 0;
      const dayDelta =
        current.dayWidth > 0
          ? Math.round((nativeEvent.clientX - current.pointerX) / current.dayWidth)
          : 0;
      const geometry: SchedulerDragGeometry = {
        minuteDelta,
        dayDelta,
        dayCount: current.dayCount,
        sourceDayIndex: current.sourceDayIndex
      };
      const next =
        current.mode === 'resize'
          ? resizeEvent(dateFns, current.range, minuteDelta, current.snapMinutes)
          : moveEvent(dateFns, current.range, geometry);
      const changed =
        dateFns.valueOf(next.start) !== dateFns.valueOf(current.range.start) ||
        dateFns.valueOf(next.end) !== dateFns.valueOf(current.range.end);

      if (!changed) {
        current.next = undefined;
        setPreview(null);
        return;
      }

      current.next = next;
      suppressClickRef.current = true;
      setPreview({
        key: current.key,
        mode: current.mode,
        start: next.start,
        end: next.end
      });
    };

    const handlePointerUp = () => {
      const { current } = dragRef;

      if (current?.next) {
        emitRange(current.event, current.next, current.mode);
      }

      finishDrag();
    };

    const handleKeyDown = (nativeEvent: KeyboardEvent) => {
      if (nativeEvent.key === 'Escape') {
        finishDrag();
      }
    };

    const handlePointerCancel = () => {
      finishDrag();
    };

    if (cleanupRef.current) {
      cleanupRef.current();
    }

    cleanupRef.current = detach;
    dragRef.current = drag;
    suppressClickRef.current = false;
    setDraggingKey(occurrence.key);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('keydown', handleKeyDown);
  };

  const emitSelection = (day: TDate, startMinutes: number, endMinutes: number) => {
    const dayStart = startOfDay(dateFns, day);
    const range: SchedulerDateRange<TDate> = {
      start: shiftFrom(createWallTime(dateFns, dayStart, startMinutes), activeTimeZone),
      end: shiftFrom(createWallTime(dateFns, dayStart, endMinutes), activeTimeZone)
    };

    if (typeof onRangeSelect === 'function') {
      onRangeSelect(range);
    }

    if (typeof onEventCreate === 'function') {
      onEventCreate(range);
    }
  };

  const finishSelection = () => {
    if (selectionCleanupRef.current) {
      selectionCleanupRef.current();
    }

    selectionRef.current = null;
    setSelection(null);
  };

  const resolveColumnMinutes = (clientY: number, rectTop: number, rectHeight: number): number => {
    if (rectHeight <= 0) {
      return 0;
    }

    const minutes = ((clientY - rectTop) / rectHeight) * MINUTES_PER_DAY;

    return Math.min(Math.max(snapToStep(minutes, snap), 0), MINUTES_PER_DAY);
  };

  const handleColumnPointerDown = (
    reactEvent: React.PointerEvent<HTMLDivElement>,
    day: TDate,
    columnId: string
  ) => {
    if (!selectable || activeView === 'month' || reactEvent.button > 0) {
      return;
    }

    const target = reactEvent.target as HTMLElement | null;

    // Events own their pointer interactions (move/resize); only empty grid
    // cells start a selection.
    if (target?.closest('[data-scheduler-event]')) {
      return;
    }

    const column = reactEvent.currentTarget;
    const rect = column.getBoundingClientRect();

    if (rect.height <= 0) {
      return;
    }

    const state: SchedulerSelectState<TDate> = {
      day,
      columnId,
      anchorMinutes: resolveColumnMinutes(reactEvent.clientY, rect.top, rect.height),
      rectTop: rect.top,
      rectHeight: rect.height
    };

    const detach = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('keydown', handleKeyDown);
      selectionCleanupRef.current = null;
    };

    const handlePointerMove = (nativeEvent: PointerEvent) => {
      const { current } = selectionRef;

      if (!current) {
        return;
      }

      const minutes = resolveColumnMinutes(
        nativeEvent.clientY,
        current.rectTop,
        current.rectHeight
      );
      const lower = Math.min(current.anchorMinutes, minutes);
      const upper = Math.max(current.anchorMinutes, minutes);

      if (lower === upper) {
        current.next = undefined;
        setSelection(null);
        return;
      }

      // Both edges sit on the snap grid, so the selection is always at least
      // one snap step long.
      const startMinutes = Math.min(lower, MINUTES_PER_DAY - snap);
      const endMinutes = Math.min(Math.max(upper, startMinutes + snap), MINUTES_PER_DAY);

      current.next = { startMinutes, endMinutes };
      const dayStart = startOfDay(dateFns, current.day);

      setSelection({
        columnId: current.columnId,
        start: createWallTime(dateFns, dayStart, startMinutes),
        end: createWallTime(dateFns, dayStart, endMinutes)
      });
    };

    const handlePointerUp = () => {
      const { current } = selectionRef;

      if (current) {
        const startMinutes = current.next
          ? current.next.startMinutes
          : Math.min(current.anchorMinutes, MINUTES_PER_DAY - snap);
        const endMinutes = current.next
          ? current.next.endMinutes
          : Math.min(startMinutes + selectionDurationMinutes, MINUTES_PER_DAY);

        emitSelection(current.day, startMinutes, endMinutes);
      }

      finishSelection();
    };

    const handleKeyDown = (nativeEvent: KeyboardEvent) => {
      if (nativeEvent.key === 'Escape') {
        finishSelection();
      }
    };

    const handlePointerCancel = () => {
      finishSelection();
    };

    if (selectionCleanupRef.current) {
      selectionCleanupRef.current();
    }

    selectionCleanupRef.current = detach;
    selectionRef.current = state;

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('keydown', handleKeyDown);
  };

  const finishAllDayDrag = () => {
    if (allDayCleanupRef.current) {
      allDayCleanupRef.current();
    }

    allDayDragRef.current = null;
    setDraggingKey(null);
    setPreview(null);
  };

  const handleAllDayPointerDown = (
    reactEvent: React.PointerEvent<HTMLButtonElement>,
    occurrence: SchedulerDisplayOccurrence<TDate>
  ) => {
    if (!editable || activeView === 'month' || !occurrence.event.allDay) {
      return;
    }

    if (reactEvent.button > 0) {
      return;
    }

    const column = (reactEvent.currentTarget as HTMLElement).closest(
      '[data-scheduler-day]'
    ) as HTMLElement | null;

    if (!column) {
      return;
    }

    const row = column.closest('[data-scheduler-time-row]') as HTMLElement | null;
    const columns = row
      ? Array.from(row.querySelectorAll<HTMLElement>('[data-scheduler-day]'))
      : [column];
    const columnRect = column.getBoundingClientRect();
    const rowRect = row?.getBoundingClientRect();
    const dayCount = Math.max(1, columns.length);
    const dayWidth = rowRect && rowRect.width > 0 ? rowRect.width / dayCount : columnRect.width;
    const sourceDayIndex = Math.max(0, columns.indexOf(column));
    const start = startOfDay(dateFns, occurrence.positionStart);
    const range: SchedulerDateRange<TDate> = {
      start,
      end: dateFns.addDays(start, getWallDaySpan(dateFns, start, occurrence.positionEnd))
    };

    const drag: SchedulerAllDayDragState<TDate> = {
      key: occurrence.key,
      event: occurrence.event,
      range,
      pointerX: reactEvent.clientX,
      dayWidth,
      dayCount,
      sourceDayIndex
    };

    const detach = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('keydown', handleKeyDown);
      allDayCleanupRef.current = null;
    };

    const handlePointerMove = (nativeEvent: PointerEvent) => {
      const { current } = allDayDragRef;

      if (!current) {
        return;
      }

      const dayDelta =
        current.dayWidth > 0
          ? Math.round((nativeEvent.clientX - current.pointerX) / current.dayWidth)
          : 0;
      const next = moveAllDayRange(
        dateFns,
        current.range,
        dayDelta,
        current.dayCount,
        current.sourceDayIndex
      );

      if (dateFns.valueOf(next.start) === dateFns.valueOf(current.range.start)) {
        current.next = undefined;
        setPreview(null);
        return;
      }

      current.next = next;
      suppressClickRef.current = true;
      setPreview({
        key: current.key,
        mode: 'move',
        start: next.start,
        end: next.end
      });
    };

    const handlePointerUp = () => {
      const { current } = allDayDragRef;

      if (current?.next) {
        emitRange(current.event, current.next, 'move');
      }

      finishAllDayDrag();
    };

    const handleKeyDown = (nativeEvent: KeyboardEvent) => {
      if (nativeEvent.key === 'Escape') {
        finishAllDayDrag();
      }
    };

    const handlePointerCancel = () => {
      finishAllDayDrag();
    };

    if (allDayCleanupRef.current) {
      allDayCleanupRef.current();
    }

    allDayCleanupRef.current = detach;
    allDayDragRef.current = drag;
    suppressClickRef.current = false;
    setDraggingKey(occurrence.key);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('keydown', handleKeyDown);
  };

  const handleOccurrencePointerDown = (
    reactEvent: React.PointerEvent<HTMLButtonElement>,
    occurrence: SchedulerDisplayOccurrence<TDate>
  ) => {
    if (occurrence.event.allDay) {
      handleAllDayPointerDown(reactEvent, occurrence);

      return;
    }

    handlePointerDown(reactEvent, occurrence);
  };

  const findCursorDay = (cursor: SchedulerCursor | null): TDate => {
    if (cursor) {
      const found = visibleDays.find((day) => dateFns.format(day, 'YYYY-MM-DD') === cursor.dayKey);

      if (found) {
        return found;
      }
    }

    return startOfDay(dateFns, displayActiveDate);
  };

  const resolveKeyboardCursor = (): SchedulerCursor => {
    if (keyboardCursor) {
      return keyboardCursor;
    }

    return {
      dayKey: dateFns.format(startOfDay(dateFns, displayActiveDate), 'YYYY-MM-DD'),
      minutes: DEFAULT_SELECTION_START_MINUTES
    };
  };

  const handleGridFocus = (reactEvent: React.FocusEvent<HTMLDivElement>) => {
    if (reactEvent.target !== reactEvent.currentTarget) {
      return;
    }

    if (!selectable || activeView === 'month' || keyboardCursor) {
      return;
    }

    setKeyboardCursor(resolveKeyboardCursor());
  };

  const handleGridKeyDown = (reactEvent: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selectable || activeView === 'month') {
      return;
    }

    // Event buttons handle their own keyboard edits.
    if (reactEvent.target !== reactEvent.currentTarget) {
      return;
    }

    const { key } = reactEvent;
    const cursor = resolveKeyboardCursor();
    const maxStart = Math.max(
      0,
      MINUTES_PER_DAY - Math.min(selectionDurationMinutes, MINUTES_PER_DAY)
    );

    if (key === 'Enter' || key === 'n' || key === 'N') {
      reactEvent.preventDefault();

      const startMinutes = Math.min(cursor.minutes, maxStart);
      const endMinutes = Math.min(startMinutes + selectionDurationMinutes, MINUTES_PER_DAY);

      emitSelection(findCursorDay(cursor), startMinutes, endMinutes);

      return;
    }

    if (key === 'ArrowUp' || key === 'ArrowDown') {
      reactEvent.preventDefault();

      const direction = key === 'ArrowDown' ? 1 : -1;
      const minutes = Math.min(Math.max(cursor.minutes + direction * snap, 0), maxStart);

      setKeyboardCursor({ ...cursor, minutes });

      return;
    }

    if ((key !== 'ArrowLeft' && key !== 'ArrowRight') || activeView !== 'week') {
      return;
    }

    reactEvent.preventDefault();

    const currentDay = findCursorDay(cursor);
    const currentIndex = Math.max(
      0,
      visibleDays.findIndex((visible) => dateFns.isSameDay(visible, currentDay))
    );
    const direction = key === 'ArrowRight' ? 1 : -1;
    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), visibleDays.length - 1);

    setKeyboardCursor({
      dayKey: dateFns.format(visibleDays[nextIndex], 'YYYY-MM-DD'),
      minutes: cursor.minutes
    });
  };

  const handleAllDayKeyDown = (
    reactEvent: React.KeyboardEvent<HTMLButtonElement>,
    occurrence: SchedulerDisplayOccurrence<TDate>
  ) => {
    if (activeView !== 'week') {
      return;
    }

    const { key } = reactEvent;

    if (key !== 'ArrowLeft' && key !== 'ArrowRight') {
      return;
    }

    const sourceDayIndex = visibleDays.findIndex((day) =>
      dateFns.isSameDay(day, occurrence.positionStart)
    );

    if (sourceDayIndex < 0) {
      return;
    }

    const direction = key === 'ArrowRight' ? 1 : -1;
    const targetIndex = Math.min(Math.max(sourceDayIndex + direction, 0), visibleDays.length - 1);

    if (targetIndex === sourceDayIndex) {
      return;
    }

    reactEvent.preventDefault();

    const start = startOfDay(dateFns, occurrence.positionStart);
    const range: SchedulerDateRange<TDate> = {
      start,
      end: dateFns.addDays(start, getWallDaySpan(dateFns, start, occurrence.positionEnd))
    };
    const next = moveAllDayRange(dateFns, range, direction, visibleDays.length, sourceDayIndex);

    emitRange(occurrence.event, next, 'move');
  };

  useEffect(
    () => () => {
      cleanupRef.current?.();
      selectionCleanupRef.current?.();
      allDayCleanupRef.current?.();
    },
    []
  );

  const handleEventClick = (event: SchedulerEvent<TDate>) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    if (typeof onEventClick === 'function') {
      onEventClick(event);
    }
  };

  const applyKeyboardRange = (
    occurrence: SchedulerDisplayOccurrence<TDate>,
    next: SchedulerDateRange<TDate>,
    mode: SchedulerEditMode
  ) => {
    const changed =
      dateFns.valueOf(next.start) !== dateFns.valueOf(occurrence.positionStart) ||
      dateFns.valueOf(next.end) !== dateFns.valueOf(occurrence.positionEnd);

    if (changed) {
      emitRange(occurrence.event, next, mode);
    }
  };

  const handleEventKeyDown = (
    reactEvent: React.KeyboardEvent<HTMLButtonElement>,
    occurrence: SchedulerDisplayOccurrence<TDate>
  ) => {
    if (!editable || activeView === 'month') {
      return;
    }

    if (occurrence.event.allDay) {
      handleAllDayKeyDown(reactEvent, occurrence);

      return;
    }

    const { key, shiftKey } = reactEvent;

    if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
      return;
    }

    reactEvent.preventDefault();

    const range = normalizeInteractionRange(
      dateFns,
      occurrence.positionStart,
      occurrence.positionEnd,
      snap
    );
    const direction = key === 'ArrowDown' || key === 'ArrowRight' ? 1 : -1;

    if (shiftKey && (key === 'ArrowUp' || key === 'ArrowDown')) {
      applyKeyboardRange(occurrence, resizeEvent(dateFns, range, direction * snap, snap), 'resize');

      return;
    }

    if (key === 'ArrowUp' || key === 'ArrowDown') {
      applyKeyboardRange(
        occurrence,
        moveEvent(dateFns, range, {
          minuteDelta: direction * snap,
          dayDelta: 0,
          dayCount: 1,
          sourceDayIndex: 0
        }),
        'move'
      );

      return;
    }

    if (activeView !== 'week') {
      return;
    }

    const sourceDayIndex = visibleDays.findIndex((day) =>
      dateFns.isSameDay(day, occurrence.positionStart)
    );

    if (sourceDayIndex < 0) {
      return;
    }

    applyKeyboardRange(
      occurrence,
      moveEvent(dateFns, range, {
        minuteDelta: 0,
        dayDelta: direction,
        dayCount: visibleDays.length,
        sourceDayIndex
      }),
      'move'
    );
  };

  const getPreviewRange = (
    occurrence: SchedulerDisplayOccurrence<TDate>
  ): { start: TDate; end: TDate } => {
    if (preview && preview.key === occurrence.key) {
      return { start: preview.start, end: preview.end };
    }

    return {
      start: occurrence.positionStart,
      end: occurrence.positionEnd
    };
  };

  const getPreviewLabelStart = (
    occurrence: SchedulerDisplayOccurrence<TDate>,
    start: TDate
  ): TDate => {
    if (!preview || preview.key !== occurrence.key) {
      return occurrence.labelStart;
    }

    // All-day values are plain wall-clock dates: no zone conversion applies.
    if (occurrence.event.allDay) {
      return start;
    }

    const absolute = shiftFrom(start, activeTimeZone);

    return shiftTo(absolute, occurrence.timeZone) ?? absolute;
  };

  const getPositionStyle = (start: TDate, end: TDate): React.CSSProperties => {
    const startMinutes = getMinutesOfDay(dateFns, start);
    const duration = Math.max(1, (dateFns.valueOf(end) - dateFns.valueOf(start)) / 60000);

    return {
      top: `${(startMinutes / MINUTES_PER_DAY) * 100}%`,
      // Keep very short events readable while preserving the real duration
      // for the callbacks.
      height: `${Math.max((duration / MINUTES_PER_DAY) * 100, 2.5)}%`
    };
  };

  const renderTimeZoneIndicator = (occurrence: SchedulerDisplayOccurrence<TDate>) => {
    if (!occurrence.showTimeZone || !occurrence.timeZone) {
      return null;
    }

    return (
      <span
        className={cx(classes.eventTimeZone)}
        aria-label={labels.timeZone(occurrence.timeZone)}
        title={occurrence.timeZone}
      >
        {getTimeZoneShortName(occurrence.timeZone, toNativeDate(occurrence.absoluteStart))}
      </span>
    );
  };

  const renderEventItem = (occurrence: SchedulerDisplayOccurrence<TDate>, positioned = false) => {
    const { event } = occurrence;
    const customContent = renderEvent ? renderEvent(event, activeView) : null;
    const range = getPreviewRange(occurrence);
    const labelStart = getPreviewLabelStart(occurrence, range.start);
    const time = event.allDay
      ? null
      : dateFns.format(labelStart, dateFns.getTwentyFourHoursFormat());
    const isDragging = draggingKey === occurrence.key;
    const isEditableOccurrence =
      editable && activeView !== 'month' && (!event.allDay || activeView === 'week');
    const color = getEventColor(event);
    const colorStyle = color
      ? ({
          backgroundColor: color,
          '--scheduler-occurrence-background': color
        } as React.CSSProperties)
      : undefined;
    const style = positioned
      ? { ...getPositionStyle(range.start, range.end), ...colorStyle }
      : colorStyle;

    return (
      <button
        key={occurrence.key}
        type="button"
        className={cx(
          classes.event,
          positioned && classes.positionedEvent,
          isDragging && classes.dragging
        )}
        style={style}
        data-scheduler-event="true"
        data-scheduler-resource={event.resourceId}
        data-scheduler-event-start={toIsoString(range.start)}
        data-scheduler-event-end={toIsoString(range.end)}
        aria-grabbed={isEditableOccurrence ? isDragging : undefined}
        aria-describedby={isEditableOccurrence ? instructionsId : undefined}
        onClick={() => handleEventClick(event)}
        onKeyDown={(reactEvent) => handleEventKeyDown(reactEvent, occurrence)}
        onPointerDown={(reactEvent) => handleOccurrencePointerDown(reactEvent, occurrence)}
      >
        {customContent ?? (
          <>
            {time && <span className={cx(classes.eventTime)}>{time}</span>}
            <span className={cx(classes.eventTitle)}>{event.title}</span>
            {renderTimeZoneIndicator(occurrence)}
          </>
        )}
        {editable && positioned && !event.allDay && (
          <span
            className={cx(classes.resizeHandle)}
            data-scheduler-resize-handle="true"
            aria-hidden="true"
          />
        )}
      </button>
    );
  };

  const renderWeekdayRow = () => (
    <div role="row" className={cx(classes.weekdayRow)}>
      {weekdayNames.map((name) => (
        <div key={name} role="columnheader" className={cx(classes.weekday)}>
          {name}
        </div>
      ))}
    </div>
  );

  const renderMonthView = () => (
    <>
      {renderWeekdayRow()}
      {Array.from({ length: 6 }, (_, weekIndex) => (
        <div role="row" key={weekIndex} className={cx(classes.weekRow)}>
          {Array.from({ length: 7 }, (_day, dayIndex) => {
            const day = dateFns.addDays(monthGridStart, weekIndex * 7 + dayIndex);
            const dayEvents = getOccurrencesForDay(day);
            const descriptionId = `${dateDescriptionId}-${weekIndex}-${dayIndex}`;

            return (
              <div
                key={dayIndex}
                role="gridcell"
                aria-describedby={descriptionId}
                className={cx(classes.monthCell, {
                  [classes.outside]: !dateFns.isSameMonth(day, displayActiveDate),
                  [classes.today]: !!dateFns.isSameDay(day, dateFns.today(dateType))
                })}
              >
                <span className={cx(classes.dayNumber)}>{dateFns.getDate(day)}</span>
                <span hidden id={descriptionId}>
                  {dateFns.format(day, 'D MMMM YYYY')}
                </span>
                <div className={cx(classes.events)}>
                  {dayEvents.slice(0, 3).map((occurrence) => renderEventItem(occurrence))}
                  {dayEvents.length > 3 && (
                    <span className={cx(classes.more)}>{labels.more(dayEvents.length - 3)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );

  const renderSelectionPreview = (columnId: string) => {
    if (!selection || selection.columnId !== columnId) {
      return null;
    }

    return (
      <div
        className={cx(classes.selection)}
        style={getPositionStyle(selection.start, selection.end)}
        data-scheduler-selection="true"
        data-scheduler-selection-start={toIsoString(selection.start)}
        data-scheduler-selection-end={toIsoString(selection.end)}
        aria-hidden="true"
      />
    );
  };

  const renderKeyboardCursor = (dayKey: string, laneId?: string) => {
    if (!keyboardCursor || keyboardCursor.dayKey !== dayKey || cursorLaneId !== laneId) {
      return null;
    }

    const day = visibleDays.find((visible) => dateFns.format(visible, 'YYYY-MM-DD') === dayKey);

    if (!day) {
      return null;
    }

    const dayStart = startOfDay(dateFns, day);
    const start = createWallTime(dateFns, dayStart, keyboardCursor.minutes);
    const end = createWallTime(
      dateFns,
      dayStart,
      Math.min(keyboardCursor.minutes + selectionDurationMinutes, MINUTES_PER_DAY)
    );

    return (
      <div
        className={cx(classes.keyboardCursor)}
        style={getPositionStyle(start, end)}
        data-scheduler-cursor="true"
        aria-hidden="true"
      />
    );
  };

  const renderTimeColumn = (day: TDate, laneId?: string) => {
    const dayKey = dateFns.format(day, 'YYYY-MM-DD');
    const columnId = `${dayKey}|${laneId ?? ''}`;
    const dayEvents = getOccurrencesForDay(day).filter((occurrence) =>
      matchesLane(occurrence, laneId)
    );
    const allDayEvents = dayEvents.filter((occurrence) => occurrence.event.allDay);
    const timedEvents = dayEvents.filter((occurrence) => !occurrence.event.allDay);
    const lane = laneId ? resourceLanes.find((item) => item.id === laneId) : undefined;
    const dayLabel = dateFns.format(day, 'D MMMM YYYY');
    const descriptionId = `${dateDescriptionId}-${encodeURIComponent(columnId)}`;

    return (
      <div
        key={columnId}
        role="gridcell"
        aria-describedby={descriptionId}
        data-scheduler-day={dayKey}
        data-scheduler-resource={laneId}
        className={cx(classes.timeColumn, {
          [classes.today]: !!dateFns.isSameDay(day, dateFns.today(dateType))
        })}
        onPointerDown={(reactEvent) => handleColumnPointerDown(reactEvent, day, columnId)}
      >
        <span className={cx(classes.dayNumber)}>{dateFns.getDate(day)}</span>
        <span hidden id={descriptionId}>
          {lane ? `${dayLabel}, ${lane.name}` : dayLabel}
        </span>
        {allDayEvents.length > 0 && (
          <div className={cx(classes.allDayEvents)}>
            {allDayEvents.map((occurrence) => renderEventItem(occurrence))}
          </div>
        )}
        {timedEvents.map((occurrence) => renderEventItem(occurrence, true))}
        {renderSelectionPreview(columnId)}
        {renderKeyboardCursor(dayKey, laneId)}
        {dayEvents.length === 0 && laneId === undefined && (
          <span className={cx(classes.more)}>{resolvedEmptyState}</span>
        )}
      </div>
    );
  };

  const renderTimeRow = (days: TDate[], laneId?: string) => (
    <div
      role="row"
      className={cx(classes.timeRow, days.length === 1 && classes.singleColumn)}
      data-scheduler-time-row="true"
      data-scheduler-lane={laneId}
    >
      {days.map((day) => renderTimeColumn(day, laneId))}
    </div>
  );

  const renderResourceHeader = (lane: SchedulerLane) => (
    <div
      role="row"
      className={cx(classes.resourceHeaderRow)}
      data-scheduler-resource-header={lane.id}
    >
      <div role="rowheader" className={cx(classes.resourceHeaderCell)}>
        {lane.color && (
          <span
            className={cx(classes.resourceColor)}
            style={{ backgroundColor: lane.color }}
            aria-hidden="true"
          />
        )}
        {!lane.unassigned && typeof onResourceClick === 'function' ? (
          <button
            type="button"
            className={cx(classes.resourceButton)}
            onClick={() => {
              const resource = resourceById.get(lane.id);

              if (resource) {
                onResourceClick(resource);
              }
            }}
          >
            {lane.name}
          </button>
        ) : (
          <span className={cx(classes.resourceName)}>{lane.name}</span>
        )}
      </div>
    </div>
  );

  const renderLane = (lane: SchedulerLane, days: TDate[]) => (
    <React.Fragment key={lane.id}>
      {showResources && renderResourceHeader(lane)}
      {renderTimeRow(days, lane.id)}
    </React.Fragment>
  );

  const renderWeekView = () => (
    <>
      {renderWeekdayRow()}
      {resourceViewEnabled
        ? resourceLanes.map((lane) => renderLane(lane, weekDays))
        : renderTimeRow(weekDays)}
    </>
  );

  const renderDayView = () => {
    const day = visibleDays[0];

    return (
      <>
        <div role="row">
          <div role="columnheader" className={cx(classes.weekDayHeader)}>
            {dateFns.format(day, 'dddd, MMMM D')}
          </div>
        </div>
        {resourceViewEnabled
          ? resourceLanes.map((lane) => renderLane(lane, [day]))
          : renderTimeRow([day])}
      </>
    );
  };

  return (
    <div className={cx(classes.root, className)}>
      <div className={cx(classes.toolbar)}>
        {withNavigation ? (
          <div className={cx(classes.navigation)}>
            <Button
              size="small"
              appearance="ghost"
              aria-label={labels.previousPeriod}
              onClick={() => moveDate(-1)}
            >
              <Icon icon="chevron-left-outline" pack="nebular-essentials" aria-hidden="true" />
            </Button>
            <Button
              size="small"
              appearance="ghost"
              classNames={{ root: classes.todayButton }}
              onClick={() => setActiveDate(dateFns.today(dateType))}
            >
              {labels.today}
            </Button>
            <Button
              size="small"
              appearance="ghost"
              aria-label={labels.nextPeriod}
              onClick={() => moveDate(1)}
            >
              <Icon icon="chevron-right-outline" pack="nebular-essentials" aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <span />
        )}
        <div className={cx(classes.title)}>{getTitle()}</div>
        <SegmentedControl
          ariaLabel={labels.view}
          size="small"
          value={activeView}
          onChange={(nextView) => setActiveView(nextView as SchedulerView)}
          data={[
            { label: labels.day, value: 'day' },
            { label: labels.week, value: 'week' },
            { label: labels.month, value: 'month' }
          ]}
        />
      </div>
      {editable && (
        <span id={instructionsId} className={cx(classes.instructions)}>
          {labels.editableInstructions}
        </span>
      )}
      {selectable && (
        <span id={selectionInstructionsId} className={cx(classes.instructions)}>
          {labels.selectableInstructions}
        </span>
      )}
      <div
        role="grid"
        aria-label={ariaLabel}
        aria-describedby={
          selectable && activeView !== 'month' ? selectionInstructionsId : undefined
        }
        tabIndex={selectable && activeView !== 'month' ? 0 : undefined}
        className={cx(classes.grid, {
          [classes.selectable]: selectable && activeView !== 'month'
        })}
        data-scheduler-selectable={selectable ? 'true' : undefined}
        onFocus={handleGridFocus}
        onKeyDown={handleGridKeyDown}
      >
        {activeView === 'month' && renderMonthView()}
        {activeView === 'week' && renderWeekView()}
        {activeView === 'day' && renderDayView()}
      </div>
    </div>
  );
}

Scheduler.displayName = 'Scheduler';

export { Scheduler };
