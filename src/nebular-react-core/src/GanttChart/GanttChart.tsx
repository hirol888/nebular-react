import React, { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { exportChartPng, exportChartSvg, resolveChartFileName } from '../Charts/chart-export';
import { useDefaultLocale } from '../Shared/hooks';

export type GanttView = 'day' | 'week' | 'month';

export interface GanttTask {
  id: string;
  name: React.ReactNode;
  start: Date | string | number;
  end: Date | string | number;
  progress?: number;
  color?: string;
  dependencies?: string[];
  /** Planned start date of the baseline (used when `showBaseline` is enabled). */
  baselineStart?: Date | string;
  /** Planned end date of the baseline. Ignored when it is before `baselineStart`. */
  baselineEnd?: Date | string;
  /** Ids of the resources assigned to the task (used when `showResources` is enabled). */
  resourceIds?: string[];
}

export interface GanttResource {
  id: string;
  name: string;
  color?: string;
}

export interface GanttBaselineRange {
  start: Date;
  end: Date;
}

export interface NormalizedGanttTask {
  task: GanttTask;
  start: Date;
  end: Date;
  progress: number;
  /** Validated baseline range, or `null` when the dates are missing or inverted. */
  baseline: GanttBaselineRange | null;
}

export interface GanttRange {
  start: Date;
  end: Date;
  days: number;
}

export interface GanttColumn {
  key: string;
  label: string;
  start: Date;
  days: number;
}

export type GanttEditMode = 'move' | 'resize';

export type GanttExportFormat = 'svg' | 'png';

interface GanttDragState {
  taskId: string;
  mode: GanttEditMode;
  pointerX: number;
  start: Date;
  end: Date;
}

interface GanttProgressDragState {
  taskId: string;
  pointerX: number;
  startProgress: number;
  /** Rendered width of the bar in pixels; the whole bar maps to 100%. */
  width: number;
}

interface GanttProgressPreview {
  taskId: string;
  value: number;
}

/**
 * A rendered row. Regular view rows are tasks; resource view adds one `lane` header row per
 * resource followed by one row per assigned task (multi-resource tasks appear in every lane).
 */
interface GanttLayoutRow {
  key: string;
  kind: 'task' | 'lane';
  rowIndex: number;
  task?: NormalizedGanttTask;
  laneId?: string;
  laneName?: string;
  laneColor?: string;
  taskCount?: number;
}

export interface GanttDependencyLink {
  from: string;
  to: string;
}

const MS_PER_DAY = 86400000;
const DEFAULT_LOCALE = 'pt-BR';
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const PROGRESS_STEP = 5;
const PROGRESS_SHIFT_STEP = 10;
const PROGRESS_SNAP = 5;
const UNASSIGNED_LANE_ID = 'unassigned';
const UNASSIGNED_LANE_COLOR = '#8f9bb3';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/** Maps the agenda density to a horizontal size (in pixels) for a single day. */
const DAY_WIDTH: Record<GanttView, number> = {
  day: 32,
  week: 24,
  month: 8
};

/** Fallback swatch colors for resources that do not declare their own `color`. */
const RESOURCE_COLORS = ['#3366ff', '#00d68f', '#ffaa00', '#ff3d71', '#7b61ff', '#8f9bb3'];

interface GanttResourceEntry {
  resource: GanttResource;
  color: string;
}

function padNumber(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

function toDate(value: Date | string | number): Date {
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (typeof value === 'string') {
    const dateOnly = DATE_ONLY_PATTERN.exec(value);

    if (dateOnly) {
      return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
    }
  }

  return new Date(value);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** Weeks start on Monday, which matches the ISO-8601 convention used by the agenda. */
function startOfWeek(date: Date): Date {
  const offset = (date.getDay() + 6) % 7;

  return addDays(startOfDay(date), -offset);
}

function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

function dayTimestamp(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffInDays(from: Date, to: Date): number {
  return Math.round((dayTimestamp(to) - dayTimestamp(from)) / MS_PER_DAY);
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function formatIntl(date: Date, options: Intl.DateTimeFormatOptions, locale: string): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

function formatShortDate(date: Date, locale: string): string {
  return formatIntl(date, { day: '2-digit', month: '2-digit' }, locale);
}

function formatFullDate(date: Date, locale: string): string {
  return formatIntl(date, { day: '2-digit', month: '2-digit', year: 'numeric' }, locale);
}

/**
 * Normalizes raw tasks: clones their dates, clamps `end` to `start` and keeps
 * `progress` between 0 and 100. Invalid baselines are dropped.
 */
export function normalizeGanttTasks(tasks: GanttTask[]): NormalizedGanttTask[] {
  return tasks.map((task) => {
    const start = toDate(task.start);
    const end = toDate(task.end);
    const safeEnd = end.getTime() < start.getTime() ? new Date(start.getTime()) : end;
    const rawProgress =
      typeof task.progress === 'number' && Number.isFinite(task.progress) ? task.progress : 0;

    return {
      task,
      start,
      end: safeEnd,
      progress: Math.min(100, Math.max(0, rawProgress)),
      baseline: normalizeBaseline(task)
    };
  });
}

/** A baseline is only valid when both dates exist, parse and are ordered. */
function normalizeBaseline(task: GanttTask): GanttBaselineRange | null {
  if (task.baselineStart === undefined || task.baselineEnd === undefined) {
    return null;
  }

  const start = toDate(task.baselineStart);
  const end = toDate(task.baselineEnd);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  if (end.getTime() < start.getTime()) {
    return null;
  }

  return { start, end };
}

export interface GanttCriticalPath {
  /** Ids of the tasks on the longest dependency chain, in dependency order. */
  taskIds: string[];
  /** Dependency links between consecutive tasks of the chain. */
  links: GanttDependencyLink[];
  /** `true` when a dependency cycle was found; the edges that close it are ignored. */
  hasCycle: boolean;
}

/**
 * Finds the longest finish-to-start dependency chain, weighting each task by its inclusive
 * duration in days. Missing dependencies, self-links and duplicate ids are ignored; back edges
 * that close a cycle are skipped (and reported through `hasCycle`) instead of throwing.
 */
export function computeCriticalPath(tasks: GanttTask[]): GanttCriticalPath {
  const uniqueTasks = new Map<string, NormalizedGanttTask>();

  normalizeGanttTasks(tasks).forEach((item) => {
    if (!uniqueTasks.has(item.task.id)) {
      uniqueTasks.set(item.task.id, item);
    }
  });

  const predecessors = new Map<string, string[]>();

  uniqueTasks.forEach((item) => {
    const dependencies = (item.task.dependencies ?? []).filter(
      (dependencyId) => dependencyId !== item.task.id && uniqueTasks.has(dependencyId)
    );

    predecessors.set(item.task.id, Array.from(new Set(dependencies)));
  });

  interface LongestSpur {
    total: number;
    from: string | null;
  }

  const memo = new Map<string, LongestSpur>();
  const visiting = new Set<string>();
  let hasCycle = false;

  const longestEndingAt = (id: string): LongestSpur => {
    const cached = memo.get(id);

    if (cached !== undefined) {
      return cached;
    }

    const item = uniqueTasks.get(id);
    const duration =
      item === undefined
        ? 1
        : Math.max(1, diffInDays(startOfDay(item.start), startOfDay(item.end)) + 1);
    let from: string | null = null;
    let bestTotal = 0;

    visiting.add(id);

    (predecessors.get(id) ?? []).forEach((dependencyId) => {
      if (visiting.has(dependencyId)) {
        hasCycle = true;
        return;
      }

      const candidate = longestEndingAt(dependencyId);

      if (candidate.total > bestTotal) {
        bestTotal = candidate.total;
        from = dependencyId;
      }
    });

    visiting.delete(id);

    const result: LongestSpur = { total: duration + bestTotal, from };

    memo.set(id, result);

    return result;
  };

  const candidates = Array.from(uniqueTasks.keys()).map((id) => ({ id, ...longestEndingAt(id) }));
  const best = candidates.reduce<(typeof candidates)[number] | null>(
    (current, candidate) =>
      current === null || candidate.total > current.total ? candidate : current,
    null
  );

  const taskIds: string[] = [];
  const links: GanttDependencyLink[] = [];
  const visited = new Set<string>();
  let cursor: string | null = best?.id ?? null;

  while (cursor !== null && !visited.has(cursor)) {
    visited.add(cursor);
    taskIds.unshift(cursor);

    const step = longestEndingAt(cursor);

    if (step.from !== null) {
      links.unshift({ from: step.from, to: cursor });
    }

    cursor = step.from;
  }

  return { taskIds, links, hasCycle };
}

/**
 * Calculates the visible window. Explicit bounds win over tasks, and week/month
 * views expand outward so every column represents a full period.
 */
export function getGanttRange(
  tasks: GanttTask[],
  startDate?: Date | string,
  endDate?: Date | string,
  view: GanttView = 'day'
): GanttRange {
  const normalized = normalizeGanttTasks(tasks);
  const today = startOfDay(new Date());

  const earliestTask = normalized.reduce<Date | null>(
    (earliest, item) => (earliest === null || item.start < earliest ? item.start : earliest),
    null
  );
  const latestTask = normalized.reduce<Date | null>(
    (latest, item) => (latest === null || item.end > latest ? item.end : latest),
    null
  );

  let start: Date | null =
    startDate !== undefined
      ? startOfDay(toDate(startDate))
      : earliestTask !== null
        ? startOfDay(earliestTask)
        : null;
  let end: Date | null =
    endDate !== undefined
      ? startOfDay(toDate(endDate))
      : latestTask !== null
        ? startOfDay(latestTask)
        : null;

  if (start === null && end === null) {
    start = today;
    end = today;
  }

  if (start === null) {
    start = end ?? today;
  }

  if (end === null) {
    end = start;
  }

  if (view === 'week') {
    start = startOfWeek(start);
    end = endOfWeek(end);
  } else if (view === 'month') {
    start = startOfMonth(start);
    end = endOfMonth(end);
  }

  if (end.getTime() < start.getTime()) {
    end = start;
  }

  return {
    start,
    end,
    days: Math.max(1, diffInDays(start, end) + 1)
  };
}

function getDayColumns(range: GanttRange, locale: string): GanttColumn[] {
  return Array.from({ length: Math.max(1, range.days) }, (_value, index) => {
    const day = addDays(range.start, index);

    return {
      key: `day-${dateKey(day)}`,
      label: formatShortDate(day, locale),
      start: day,
      days: 1
    };
  });
}

function getWeekColumns(range: GanttRange, locale: string): GanttColumn[] {
  const totalDays = Math.max(1, range.days);
  const weekCount = Math.ceil(totalDays / 7);

  return Array.from({ length: weekCount }, (_value, index) => {
    const start = addDays(range.start, index * 7);
    const days = Math.min(7, totalDays - index * 7);
    const end = addDays(start, days - 1);

    return {
      key: `week-${dateKey(start)}`,
      label: `${formatShortDate(start, locale)} – ${formatShortDate(end, locale)}`,
      start,
      days
    };
  });
}

function getMonthColumns(range: GanttRange, locale: string): GanttColumn[] {
  const columns: GanttColumn[] = [];
  const lastTimestamp = dayTimestamp(range.end);
  let cursor = startOfMonth(range.start);

  while (dayTimestamp(cursor) <= lastTimestamp) {
    const monthEnd = endOfMonth(cursor);
    const start = dayTimestamp(cursor) < dayTimestamp(range.start) ? range.start : cursor;
    const end = dayTimestamp(monthEnd) > lastTimestamp ? range.end : monthEnd;

    columns.push({
      key: `month-${cursor.getFullYear()}-${padNumber(cursor.getMonth() + 1)}`,
      label: formatIntl(cursor, { month: 'short', year: 'numeric' }, locale),
      start,
      days: Math.max(1, diffInDays(start, end) + 1)
    });

    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  return columns;
}

/** Splits a range into the header columns of the given view. */
export function getGanttColumns(
  range: GanttRange,
  view: GanttView = 'day',
  locale: string = DEFAULT_LOCALE
): GanttColumn[] {
  if (view === 'week') {
    return getWeekColumns(range, locale);
  }

  if (view === 'month') {
    return getMonthColumns(range, locale);
  }

  return getDayColumns(range, locale);
}

/** Horizontal position (clamped to the visible window) of a date span. */
function getSpanMetrics(range: GanttRange, dayWidth: number, start: Date, end: Date) {
  const startOffset = diffInDays(range.start, startOfDay(start));
  const endOffset = diffInDays(range.start, startOfDay(end)) + 1;
  const totalDays = range.days;
  const from = Math.max(0, Math.min(totalDays - 1, startOffset));
  const to = Math.max(from + 1, Math.min(totalDays, endOffset));

  return {
    left: from * dayWidth,
    width: (to - from) * dayWidth
  };
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

/** Pointer drags snap to 5% steps, matching the keyboard increments. */
function snapProgress(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value / PROGRESS_SNAP) * PROGRESS_SNAP));
}

/**
 * Turns a design token such as `var(--color, #ff3d71)` into a standalone color so the exported
 * svg keeps rendering without the component stylesheet.
 */
function resolveExportColor(value: string | undefined, fallback: string): string {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  const variable = /^var\(\s*[^,]+,\s*([^)]+)\)$/.exec(value.trim());

  return variable ? variable[1].trim() : value.trim();
}

function createSvgElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Record<string, string | number>
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG_NAMESPACE, tag);

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, String(value));
  });

  return element;
}

function createSvgText(value: string, attributes: Record<string, string | number>): SVGTextElement {
  const text = createSvgElement('text', attributes);

  text.textContent = value;

  return text;
}

const useStyles = createStyles(() => ({
  root: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    border: '1px solid var(--gantt-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--gantt-border-radius, 0.5rem)',
    backgroundColor: 'var(--gantt-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--gantt-text-color, var(--text-basic-color, #222b45))',
    fontFamily: 'var(--gantt-text-font-family, inherit)'
  },

  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.35rem 0.9rem',
    padding: '0.45rem 0.75rem',
    borderBottom: '1px solid var(--gantt-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--gantt-legend-background-color, var(--background-basic-color-1, #ffffff))',
    fontSize: 'var(--gantt-legend-font-size, 0.75rem)'
  },

  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: 'var(--gantt-legend-text-color, var(--text-hint-color, #8f9bb3))',
    lineHeight: 1.3,
    whiteSpace: 'nowrap'
  },

  legendSwatch: {
    flex: '0 0 auto',
    width: '0.65rem',
    height: '0.65rem',
    borderRadius: '0.2rem'
  },

  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.75rem',
    borderBottom: '1px solid var(--gantt-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--gantt-toolbar-background-color, var(--background-basic-color-1, #ffffff))',
    fontSize: 'var(--gantt-toolbar-font-size, 0.75rem)'
  },

  toolbarButton: {
    padding: '0.2rem 0.55rem',
    border: '1px solid var(--gantt-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: '0.3rem',
    backgroundColor: 'transparent',
    color: 'var(--gantt-toolbar-text-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      borderColor: 'var(--gantt-focus-color, var(--color-primary-500, #3366ff))',
      color: 'var(--gantt-focus-color, var(--color-primary-500, #3366ff))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--gantt-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  status: {
    color: 'var(--gantt-status-color, var(--text-hint-color, #8f9bb3))',
    fontVariantNumeric: 'tabular-nums'
  },

  viewport: {
    width: '100%',
    overflow: 'auto'
  },

  grid: {
    display: 'flex',
    flexDirection: 'column',
    width: 'max-content',
    minWidth: '100%'
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    display: 'flex',
    flex: '0 0 auto',
    borderBottom: '1px solid var(--gantt-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--gantt-header-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  headerCorner: {
    position: 'sticky',
    left: 0,
    zIndex: 6,
    display: 'flex',
    alignItems: 'center',
    flex: '0 0 auto',
    padding: '0 0.75rem',
    borderRight: '1px solid var(--gantt-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--gantt-header-background-color, var(--background-basic-color-2, #f7f9fc))',
    color: 'var(--gantt-header-text-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--gantt-header-font-size, 0.6875rem)',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase'
  },

  headerTimeline: {
    display: 'flex',
    flex: '0 0 auto'
  },

  headerColumn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    padding: '0 0.35rem',
    borderRight: '1px solid var(--gantt-grid-line-color, var(--border-basic-color-3, #e4e9f2))',
    color: 'var(--gantt-header-text-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--gantt-column-font-size, 0.6875rem)',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600,
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },

  body: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'var(--gantt-body-min-height, 0)'
  },

  rows: {
    display: 'flex',
    flexDirection: 'column',
    flex: '0 0 auto'
  },

  row: {
    display: 'flex',
    flex: '0 0 auto',
    borderBottom: '1px solid var(--gantt-row-border-color, var(--border-basic-color-2, #edf1f7))',

    '&:last-child': {
      borderBottom: 0
    }
  },

  label: {
    position: 'sticky',
    left: 0,
    zIndex: 4,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: '0 0 auto',
    gap: '0.125rem',
    padding: '0 0.75rem',
    borderRight: '1px solid var(--gantt-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--gantt-label-background-color, var(--background-basic-color-1, #ffffff))',
    overflow: 'hidden'
  },

  labelName: {
    color: 'var(--gantt-label-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--gantt-label-font-size, 0.8125rem)',
    fontWeight: 600,
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  labelDates: {
    color: 'var(--gantt-label-date-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--gantt-label-date-font-size, 0.6875rem)',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  track: {
    position: 'relative',
    flex: '0 0 auto',
    height: '100%'
  },

  columnGuide: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 0,
    borderLeft: '1px solid var(--gantt-grid-line-color, var(--border-basic-color-2, #edf1f7))',
    pointerEvents: 'none'
  },

  bar: {
    position: 'absolute',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    padding: '0 0.45rem',
    border: 0,
    borderRadius: 'var(--gantt-bar-border-radius, 0.3rem)',
    backgroundColor: 'var(--gantt-bar-background-color, var(--color-primary-500, #3366ff))',
    color: 'var(--gantt-bar-text-color, #ffffff)',
    font: 'inherit',
    fontSize: 'var(--gantt-bar-font-size, 0.6875rem)',
    lineHeight: 1.2,
    textAlign: 'left',
    overflow: 'hidden',
    cursor: 'pointer',
    userSelect: 'none',

    '&:hover': {
      filter: 'brightness(1.06)'
    },

    '&:focus-visible': {
      outline: '2px solid var(--gantt-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  barProgress: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'var(--gantt-bar-progress-color, rgba(0, 0, 0, 0.18))',
    pointerEvents: 'none'
  },

  baselineBar: {
    position: 'absolute',
    zIndex: 1,
    borderRadius: '999px',
    backgroundColor: 'var(--gantt-baseline-color, var(--text-hint-color, #8f9bb3))',
    opacity: 0.9
  },

  resourceDots: {
    position: 'absolute',
    top: '50%',
    right: '0.35rem',
    zIndex: 1,
    display: 'flex',
    gap: '0.15rem',
    transform: 'translateY(-50%)',
    pointerEvents: 'none'
  },

  resourceDot: {
    width: '0.4rem',
    height: '0.4rem',
    borderRadius: '50%',
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.85)'
  },

  laneHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },

  laneSwatch: {
    flex: '0 0 auto',
    width: '0.55rem',
    height: '0.55rem',
    borderRadius: '50%'
  },

  laneBand: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
    opacity: 0.12,
    pointerEvents: 'none'
  },

  progressHandle: {
    position: 'absolute',
    zIndex: 4,
    width: '0.7rem',
    height: '0.7rem',
    margin: 0,
    padding: 0,
    border: '2px solid var(--gantt-progress-handle-border-color, #ffffff)',
    borderRadius: '50%',
    backgroundColor: 'var(--gantt-progress-handle-color, var(--color-primary-600, #274bdb))',
    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.25)',
    transform: 'translate(-50%, -50%)',
    cursor: 'ew-resize',
    touchAction: 'none',

    '&:focus-visible': {
      outline: '2px solid var(--gantt-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  editableBar: {
    cursor: 'grab',

    '&:active': {
      cursor: 'grabbing'
    }
  },

  resizeHandle: {
    position: 'absolute',
    zIndex: 3,
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: '0.15rem',
    backgroundColor: 'transparent',
    cursor: 'col-resize',

    '&:hover': {
      backgroundColor: 'var(--gantt-handle-color, rgba(255, 255, 255, 0.65))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--gantt-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px',
      backgroundColor: 'var(--gantt-handle-color, rgba(255, 255, 255, 0.65))'
    }
  },

  linkHandle: {
    position: 'absolute',
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    padding: 0,
    border: '1px solid var(--gantt-handle-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: '50%',
    backgroundColor:
      'var(--gantt-handle-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--gantt-handle-text-color, var(--text-hint-color, #8f9bb3))',
    font: 'inherit',
    fontSize: '0.625rem',
    lineHeight: 1,
    cursor: 'pointer',

    '&:hover:not(:disabled)': {
      color: 'var(--gantt-handle-hover-color, var(--color-primary-500, #3366ff))',
      borderColor: 'var(--gantt-handle-hover-color, var(--color-primary-500, #3366ff))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--gantt-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    },

    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed'
    }
  },

  barLabel: {
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  dependency: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    overflow: 'visible',
    pointerEvents: 'none'
  },

  todayLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 3,
    width: '2px',
    backgroundColor: 'var(--gantt-today-color, var(--color-warning-500, #ffaa00))',
    pointerEvents: 'none'
  },

  todayLabel: {
    position: 'absolute',
    top: '0.125rem',
    left: '0.25rem',
    padding: 'var(--gantt-today-label-padding, 0.05rem 0.3rem)',
    borderRadius: 'var(--gantt-today-label-border-radius, 0.2rem)',
    backgroundColor: 'var(--gantt-today-color, var(--color-warning-500, #ffaa00))',
    color: 'var(--gantt-today-label-color, #222b45)',
    fontSize: 'var(--gantt-today-label-font-size, 0.625rem)',
    fontWeight: 700,
    lineHeight: 1.3,
    whiteSpace: 'nowrap'
  },

  empty: {
    padding: 'var(--gantt-empty-padding, 1.5rem)',
    color: 'var(--gantt-empty-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--gantt-empty-font-size, 0.8125rem)',
    textAlign: 'center'
  }
}));

export type GanttChartStylesNames = Selectors<typeof useStyles>;

export interface GanttLabels {
  task: string;
  resource: string;
  tasks(count: number): string;
  today: string;
  progress(name: string): string;
  resize(name: string): string;
  link(name: string): string;
  resourceLanes: string;
  lane(name: string): string;
  baseline: string;
  unassigned: string;
}

export interface GanttChartProps extends DefaultProps<GanttChartStylesNames> {
  tasks: GanttTask[];
  startDate?: Date | string;
  endDate?: Date | string;
  view?: GanttView;
  rowHeight?: number;
  labelWidth?: number;
  showToday?: boolean;
  showDependencies?: boolean;
  /** Highlights the longest finish-to-start dependency chain. */
  showCriticalPath?: boolean;
  /** Color used for critical bars, links and arrow heads. */
  criticalPathColor?: string;
  /** Renders the validated `baselineStart`/`baselineEnd` range behind each bar. */
  showBaseline?: boolean;
  /** Color used for the baseline bars. */
  baselineColor?: string;
  /** Resources displayed in the legend and used as task indicators. */
  resources?: GanttResource[];
  /** Shows the resource legend and the per-task indicators. Defaults to `true`. */
  showResources?: boolean;
  /** Accessible name of the resource legend. */
  resourceLabel?: string;
  /**
   * Groups the chart into one lane per resource. Tasks without a known resource are grouped in an
   * "Unassigned" lane and multi-resource tasks are repeated in every matching lane.
   */
  resourceView?: boolean;
  onTaskClick?(task: GanttTask): void;
  /** Enables drag/keyboard editing and the dependency link handles. */
  editable?: boolean;
  /**
   * Called when the user moves or resizes a task. `changes` always contains `start` and `end`.
   * Without a controlling parent the chart keeps an optimistic internal copy.
   */
  onTaskChange?(task: GanttTask, changes: Partial<GanttTask>): void;
  /** Called when the user links a task to the next task in the list. */
  onDependencyCreate?(fromId: string, toId: string): void;
  /** Renders a draggable progress handle on every bar. */
  editableProgress?: boolean;
  /**
   * Called once per interaction with the final progress (0–100). Pointer dragging snaps to 5%,
   * previews while moving and only emits on `pointerup`; the keyboard emits on each key press.
   */
  onProgressChange?(task: GanttTask, progress: number): void;
  /** Renders the "Export SVG" and "Export PNG" controls. */
  exportable?: boolean;
  /** Base file name used by the export controls (without extension). Defaults to `gantt`. */
  exportFileName?: string;
  /** Called after the chart was exported as `svg` or `png`. */
  onExport?(format: GanttExportFormat): void;
  ariaLabel?: string;
  emptyState?: React.ReactNode;
  maxHeight?: number;
  className?: string;
  locale?: string;
  /** Overrides the built-in messages for the visible labels and accessible names. */
  labels?: Partial<GanttLabels>;
}

const defaultProps: Partial<GanttChartProps> = {
  view: 'day',
  rowHeight: 36,
  labelWidth: 220,
  showToday: true,
  showDependencies: true,
  showCriticalPath: false,
  criticalPathColor: 'var(--gantt-critical-path-color, #ff3d71)',
  showBaseline: false,
  baselineColor: 'var(--gantt-baseline-color, #8f9bb3)',
  showResources: true,
  resourceLabel: 'Resources',
  resourceView: false,
  editable: false,
  editableProgress: false,
  exportable: false,
  exportFileName: 'gantt',
  ariaLabel: 'Gantt chart',
  emptyState: 'No tasks'
};

function getTaskText(task: GanttTask): string {
  if (typeof task.name === 'string' || typeof task.name === 'number') {
    return String(task.name);
  }

  return task.id;
}

/** Resolves (and de-duplicates) the known resources assigned to a task. */
function getTaskResources(
  task: GanttTask,
  resourceById: Map<string, GanttResourceEntry>,
  enabled: boolean
): GanttResourceEntry[] {
  if (!enabled) {
    return [];
  }

  const seen = new Set<string>();

  return (task.resourceIds ?? []).flatMap((resourceId) => {
    const entry = resourceById.get(resourceId);

    if (entry === undefined || seen.has(resourceId)) {
      return [];
    }

    seen.add(resourceId);

    return [entry];
  });
}

interface GanttExportSvgInput {
  range: GanttRange;
  columns: GanttColumn[];
  dayWidth: number;
  rowHeight: number;
  labelWidth: number;
  headerHeight: number;
  rows: GanttLayoutRow[];
  showBaseline: boolean;
  baselineColor: string;
  showToday: boolean;
  criticalTaskIds: Set<string>;
  criticalPathColor: string;
  labels: Pick<GanttLabels, 'task' | 'resource'>;
  getProgress(item: NormalizedGanttTask): number;
}

/**
 * Builds a standalone svg of the visible chart (timeline, lanes and bars) so the export does not
 * depend on the HTML/CSS layout and never ships tooltip metadata.
 */
function createGanttExportSvg(input: GanttExportSvgInput): SVGSVGElement | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const { range, columns, dayWidth, rowHeight, labelWidth, headerHeight } = input;
  const totalDays = range.days;
  const totalWidth = totalDays * dayWidth;
  const width = labelWidth + totalWidth;
  const height = headerHeight + input.rows.length * rowHeight;
  const svg = createSvgElement('svg', {
    xmlns: SVG_NAMESPACE,
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    'data-export-root': 'gantt'
  });

  svg.appendChild(createSvgElement('rect', { x: 0, y: 0, width, height, fill: '#ffffff' }));

  const header = createSvgElement('g', { 'data-export-timeline': 'true' });

  header.appendChild(
    createSvgElement('rect', { x: 0, y: 0, width, height: headerHeight, fill: '#f7f9fc' })
  );
  header.appendChild(
    createSvgText(
      input.rows.some((row) => row.kind === 'lane') ? input.labels.resource : input.labels.task,
      {
        x: 12,
        y: headerHeight / 2,
        'dominant-baseline': 'middle',
        fill: '#8f9bb3',
        'font-size': 10,
        'font-weight': 700,
        'letter-spacing': '0.04em'
      }
    )
  );

  let columnLeft = labelWidth;

  columns.forEach((column) => {
    const columnWidth = column.days * dayWidth;

    header.appendChild(
      createSvgElement('line', {
        x1: columnLeft,
        y1: 0,
        x2: columnLeft,
        y2: headerHeight,
        stroke: '#e4e9f2',
        'stroke-width': 1
      })
    );
    header.appendChild(
      createSvgText(column.label, {
        x: columnLeft + columnWidth / 2,
        y: headerHeight / 2,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: '#8f9bb3',
        'font-size': 10,
        'font-weight': 600
      })
    );

    columnLeft += columnWidth;
  });

  svg.appendChild(header);

  const barHeight = Math.max(12, rowHeight - 14);

  input.rows.forEach((row) => {
    const rowTop = headerHeight + row.rowIndex * rowHeight;
    const centerY = rowTop + rowHeight / 2;
    let guideLeft = labelWidth;

    columns.forEach((column) => {
      svg.appendChild(
        createSvgElement('line', {
          x1: guideLeft,
          y1: rowTop,
          x2: guideLeft,
          y2: rowTop + rowHeight,
          stroke: '#edf1f7',
          'stroke-width': 1
        })
      );

      guideLeft += column.days * dayWidth;
    });

    svg.appendChild(
      createSvgElement('line', {
        x1: 0,
        y1: rowTop + rowHeight,
        x2: width,
        y2: rowTop + rowHeight,
        stroke: '#edf1f7',
        'stroke-width': 1
      })
    );

    if (row.kind === 'lane') {
      const laneColor = resolveExportColor(row.laneColor, UNASSIGNED_LANE_COLOR);

      svg.appendChild(
        createSvgElement('rect', {
          x: labelWidth,
          y: rowTop,
          width: totalWidth,
          height: rowHeight,
          fill: laneColor,
          'fill-opacity': 0.12,
          'data-export-lane': row.laneId ?? UNASSIGNED_LANE_ID
        })
      );
      svg.appendChild(
        createSvgElement('circle', {
          cx: 20,
          cy: centerY,
          r: 4,
          fill: laneColor,
          'data-export-lane-swatch': row.laneId ?? UNASSIGNED_LANE_ID
        })
      );
      svg.appendChild(
        createSvgText(`${row.laneName ?? ''} (${row.taskCount ?? 0})`, {
          x: 32,
          y: centerY,
          'dominant-baseline': 'middle',
          fill: '#222b45',
          'font-size': 12,
          'font-weight': 700
        })
      );

      return;
    }

    const item = row.task;

    if (item === undefined) {
      return;
    }

    const text = getTaskText(item.task);
    const isCritical = input.criticalTaskIds.has(item.task.id);
    const barColor = resolveExportColor(
      isCritical ? input.criticalPathColor : item.task.color,
      isCritical ? '#ff3d71' : '#3366ff'
    );
    const metrics = getSpanMetrics(range, dayWidth, item.start, item.end);
    const barLeft = labelWidth + metrics.left;
    const barTop = rowTop + (rowHeight - barHeight) / 2;

    svg.appendChild(
      createSvgText(text, {
        x: 12,
        y: centerY,
        'dominant-baseline': 'middle',
        fill: '#222b45',
        'font-size': 12,
        'font-weight': 600
      })
    );

    if (input.showBaseline && item.baseline !== null) {
      const baselineMetrics = getSpanMetrics(
        range,
        dayWidth,
        item.baseline.start,
        item.baseline.end
      );

      svg.appendChild(
        createSvgElement('rect', {
          x: labelWidth + baselineMetrics.left,
          y: barTop + barHeight + 1,
          width: baselineMetrics.width,
          height: 2,
          rx: 1,
          fill: resolveExportColor(input.baselineColor, '#8f9bb3'),
          'data-export-baseline': item.task.id
        })
      );
    }

    svg.appendChild(
      createSvgElement('rect', {
        x: barLeft,
        y: barTop,
        width: Math.max(2, metrics.width),
        height: barHeight,
        rx: 4,
        fill: barColor,
        'data-export-task': item.task.id
      })
    );

    const progress = clampProgress(input.getProgress(item));

    if (progress > 0) {
      svg.appendChild(
        createSvgElement('rect', {
          x: barLeft,
          y: barTop,
          width: (Math.max(2, metrics.width) * progress) / 100,
          height: barHeight,
          fill: '#000000',
          'fill-opacity': 0.18,
          'data-export-progress': item.task.id
        })
      );
    }

    if (metrics.width >= 48) {
      svg.appendChild(
        createSvgText(text, {
          x: barLeft + 6,
          y: centerY,
          'dominant-baseline': 'middle',
          fill: '#ffffff',
          'font-size': 10
        })
      );
    }
  });

  const todayOffset = diffInDays(range.start, startOfDay(new Date()));

  if (input.showToday && todayOffset >= 0 && todayOffset < totalDays) {
    const todayX = labelWidth + todayOffset * dayWidth + dayWidth / 2;

    svg.appendChild(
      createSvgElement('line', {
        x1: todayX,
        y1: 0,
        x2: todayX,
        y2: height,
        stroke: '#ffaa00',
        'stroke-width': 2
      })
    );
  }

  return svg;
}

const _GanttChart = forwardRef<HTMLDivElement, GanttChartProps>((props, ref) => {
  const { t } = useNebularLocale();
  const defaultLocale = useDefaultLocale(props.locale, 'pt-BR');
  const defaultLabels = useMemo<GanttLabels>(
    () => ({
      task: t('gantt.task', 'Task'),
      resource: t('gantt.resource', 'Resource'),
      tasks: (count) => t('gantt.tasks', `${count} ${count === 1 ? 'task' : 'tasks'}`, { count }),
      today: t('gantt.today', 'Today'),
      progress: (name) => t('gantt.progress', `Progress for ${name}`, { name }),
      resize: (name) => t('gantt.resize', `Resize ${name}`, { name }),
      link: (name) => t('gantt.link', `Link to next task: ${name}`, { name }),
      resourceLanes: t('gantt.resourceLanes', 'Resource lanes'),
      lane: (name) => t('gantt.lane', `${name} lane`, { name }),
      baseline: t('gantt.baseline', 'Baseline'),
      unassigned: t('gantt.unassigned', 'Unassigned')
    }),
    [t]
  );
  const {
    tasks,
    startDate,
    endDate,
    view,
    rowHeight,
    labelWidth,
    showToday,
    showDependencies,
    showCriticalPath,
    criticalPathColor,
    showBaseline,
    baselineColor,
    resources,
    showResources,
    resourceLabel,
    resourceView,
    onTaskClick,
    editable,
    onTaskChange,
    onDependencyCreate,
    editableProgress,
    onProgressChange,
    exportable,
    exportFileName,
    onExport,
    ariaLabel,
    emptyState,
    maxHeight,
    locale,
    labels: labelsProp,
    className,
    style,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps({ ...defaultProps, locale: defaultLocale }, props);
  const labels = useMemo<GanttLabels>(
    () => ({ ...defaultLabels, ...labelsProp }),
    [defaultLabels, labelsProp]
  );
  const { classes, cx } = useStyles(null, {
    name: 'gantt-chart',
    classNames,
    styles,
    unstyled
  });
  const markerId = `gantt-arrow-${useId().replace(/:/g, '')}`;
  const criticalMarkerId = `${markerId}-critical`;

  /**
   * Optimistic copies of the tasks the user moved/resized. They are dropped whenever the `tasks`
   * prop changes, so a controlling parent always wins.
   */
  const [taskOverrides, setTaskOverrides] = useState<Record<string, { start: Date; end: Date }>>(
    {}
  );
  /** Dependencies created in this session, drawn until the parent feeds them back through `tasks`. */
  const [createdDependencies, setCreatedDependencies] = useState<GanttDependencyLink[]>([]);
  /** Optimistic progress values, dropped whenever the `tasks` prop changes. */
  const [progressOverrides, setProgressOverrides] = useState<Record<string, number>>({});
  const [progressPreview, setProgressPreview] = useState<GanttProgressPreview | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const previousTasksRef = useRef(tasks);
  const dragStateRef = useRef<GanttDragState | null>(null);
  const suppressClickRef = useRef(false);
  const progressDragRef = useRef<GanttProgressDragState | null>(null);
  const progressPreviewRef = useRef<GanttProgressPreview | null>(null);

  useEffect(() => {
    if (previousTasksRef.current === tasks) {
      return;
    }

    previousTasksRef.current = tasks;
    setTaskOverrides((current) => (Object.keys(current).length === 0 ? current : {}));
    setProgressOverrides((current) => (Object.keys(current).length === 0 ? current : {}));
    progressDragRef.current = null;
    progressPreviewRef.current = null;
    setProgressPreview(null);
  }, [tasks]);

  const effectiveTasks = useMemo(
    () =>
      tasks.map((task) => {
        const override = taskOverrides[task.id];

        return override ? { ...task, start: override.start, end: override.end } : task;
      }),
    [tasks, taskOverrides]
  );
  const originalTaskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const normalizedTasks = useMemo(() => normalizeGanttTasks(effectiveTasks), [effectiveTasks]);
  // The visible window follows the `tasks` prop, so optimistic edits never shift the grid.
  const range = useMemo(
    () => getGanttRange(tasks, startDate, endDate, view),
    [tasks, startDate, endDate, view]
  );
  const columns = useMemo(() => getGanttColumns(range, view, locale), [range, view, locale]);

  const resourceEntries = useMemo<GanttResourceEntry[]>(
    () =>
      (resources ?? []).map((resource, index) => ({
        resource,
        color: resource.color ?? RESOURCE_COLORS[index % RESOURCE_COLORS.length]
      })),
    [resources]
  );
  const resourceById = useMemo(
    () => new Map(resourceEntries.map((entry) => [entry.resource.id, entry])),
    [resourceEntries]
  );
  const showResourceLegend = showResources && resourceEntries.length > 0;

  /** Dependencies created in this session also feed the critical path computation. */
  const tasksWithCreatedDependencies = useMemo(() => {
    if (createdDependencies.length === 0) {
      return effectiveTasks;
    }

    return effectiveTasks.map((task) => {
      const extra = createdDependencies
        .filter((link) => link.to === task.id)
        .map((link) => link.from);

      if (extra.length === 0) {
        return task;
      }

      return {
        ...task,
        dependencies: Array.from(new Set([...(task.dependencies ?? []), ...extra]))
      };
    });
  }, [effectiveTasks, createdDependencies]);
  const criticalPath = useMemo(
    () => (showCriticalPath ? computeCriticalPath(tasksWithCreatedDependencies) : null),
    [showCriticalPath, tasksWithCreatedDependencies]
  );
  const criticalTaskIds = useMemo(() => new Set(criticalPath?.taskIds ?? []), [criticalPath]);
  const criticalLinkKeys = useMemo(
    () => new Set((criticalPath?.links ?? []).map((link) => `${link.from}->${link.to}`)),
    [criticalPath]
  );

  const dayWidth = DAY_WIDTH[view];
  const totalDays = range.days;
  const totalWidth = totalDays * dayWidth;
  const barHeight = Math.max(12, rowHeight - 14);
  const headerHeight = Math.max(36, rowHeight);

  /**
   * Resource view layout: one header row per resource plus one row per assigned task. Tasks with
   * multiple resources are repeated in each lane on purpose; unknown resource ids are ignored and
   * tasks left without a known resource land on the "Unassigned" lane.
   */
  const layoutRows = useMemo<GanttLayoutRow[]>(() => {
    if (!resourceView) {
      return normalizedTasks.map((item, index) => ({
        key: item.task.id,
        kind: 'task',
        rowIndex: index,
        task: item
      }));
    }

    const rows: Omit<GanttLayoutRow, 'rowIndex'>[] = [];
    const assignedTaskIds = new Set<string>();

    resourceEntries.forEach(({ resource, color }) => {
      const members = normalizedTasks.filter((item) =>
        getTaskResources(item.task, resourceById, true).some(
          (entry) => entry.resource.id === resource.id
        )
      );

      members.forEach((item) => assignedTaskIds.add(item.task.id));

      rows.push({
        key: `lane-${resource.id}`,
        kind: 'lane',
        laneId: resource.id,
        laneName: resource.name,
        laneColor: color,
        taskCount: members.length
      });

      members.forEach((item) => {
        rows.push({
          key: `lane-${resource.id}-${item.task.id}`,
          kind: 'task',
          task: item,
          laneId: resource.id,
          laneName: resource.name,
          laneColor: color
        });
      });
    });

    const unassigned = normalizedTasks.filter((item) => !assignedTaskIds.has(item.task.id));

    if (unassigned.length > 0) {
      rows.push({
        key: `lane-${UNASSIGNED_LANE_ID}`,
        kind: 'lane',
        laneId: UNASSIGNED_LANE_ID,
        laneName: labels.unassigned,
        laneColor: UNASSIGNED_LANE_COLOR,
        taskCount: unassigned.length
      });

      unassigned.forEach((item) => {
        rows.push({
          key: `lane-${UNASSIGNED_LANE_ID}-${item.task.id}`,
          kind: 'task',
          task: item,
          laneId: UNASSIGNED_LANE_ID,
          laneName: labels.unassigned,
          laneColor: UNASSIGNED_LANE_COLOR
        });
      });
    }

    return rows.map((row, rowIndex) => ({ ...row, rowIndex }));
  }, [resourceView, normalizedTasks, resourceEntries, resourceById, labels.unassigned]);

  /** First rendered row of each task; dependency paths use it instead of the source index. */
  const taskRowById = useMemo(() => {
    const rows = new Map<string, number>();

    layoutRows.forEach((row) => {
      if (row.kind === 'task' && row.task !== undefined && !rows.has(row.task.task.id)) {
        rows.set(row.task.task.id, row.rowIndex);
      }
    });

    return rows;
  }, [layoutRows]);

  const normalizedById = useMemo(
    () => new Map(normalizedTasks.map((item) => [item.task.id, item])),
    [normalizedTasks]
  );
  const taskListIndexById = useMemo(
    () => new Map(normalizedTasks.map((item, index) => [item.task.id, index])),
    [normalizedTasks]
  );

  const totalHeight = layoutRows.length * rowHeight;

  const getBarMetrics = (item: NormalizedGanttTask, rowIndex: number) => {
    const span = getSpanMetrics(range, dayWidth, item.start, item.end);

    return {
      ...span,
      top: rowIndex * rowHeight + (rowHeight - barHeight) / 2,
      height: barHeight,
      centerY: rowIndex * rowHeight + rowHeight / 2
    };
  };

  /** Preview wins over the optimistic value, which wins over the normalized task progress. */
  const getEffectiveProgress = (item: NormalizedGanttTask): number => {
    if (progressPreview !== null && progressPreview.taskId === item.task.id) {
      return progressPreview.value;
    }

    return progressOverrides[item.task.id] ?? item.progress;
  };

  const commitProgress = (item: NormalizedGanttTask, value: number) => {
    const next = clampProgress(value);
    const current = progressOverrides[item.task.id] ?? item.progress;

    if (next === current) {
      return;
    }

    setProgressOverrides((existing) => ({ ...existing, [item.task.id]: next }));

    if (typeof onProgressChange === 'function') {
      onProgressChange(originalTaskById.get(item.task.id) ?? item.task, next);
    }
  };

  const notifyTask = (item: NormalizedGanttTask) => {
    if (typeof onTaskClick === 'function') {
      onTaskClick(originalTaskById.get(item.task.id) ?? item.task);
    }
  };

  const applyTaskChange = (taskId: string, start: Date, end: Date) => {
    setTaskOverrides((current) => ({ ...current, [taskId]: { start, end } }));

    if (typeof onTaskChange === 'function') {
      const task = originalTaskById.get(taskId);

      if (task !== undefined) {
        onTaskChange(task, { start, end });
      }
    }
  };

  /** Keeps the task spanning at least one day when the end edge moves. */
  const resizeTaskEnd = (start: Date, end: Date, deltaDays: number): Date =>
    addDays(start, Math.max(0, diffInDays(start, end) + deltaDays));

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, item: NormalizedGanttTask) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      suppressClickRef.current = false;
      notifyTask(item);
      return;
    }

    if (!editable || !event.altKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
      return;
    }

    event.preventDefault();

    const step = event.key === 'ArrowLeft' ? -1 : 1;

    if (event.shiftKey) {
      applyTaskChange(item.task.id, item.start, resizeTaskEnd(item.start, item.end, step));
      return;
    }

    applyTaskChange(item.task.id, addDays(item.start, step), addDays(item.end, step));
  };

  const handleResizeKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    item: NormalizedGanttTask
  ) => {
    if (!editable || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
      return;
    }

    event.preventDefault();

    const step = event.key === 'ArrowLeft' ? -1 : 1;

    applyTaskChange(item.task.id, item.start, resizeTaskEnd(item.start, item.end, step));
  };

  const beginDrag = (
    event: React.PointerEvent<HTMLElement>,
    item: NormalizedGanttTask,
    mode: GanttEditMode
  ) => {
    if (!editable || event.button > 0) {
      return;
    }

    event.stopPropagation();
    suppressClickRef.current = false;
    dragStateRef.current = {
      taskId: item.task.id,
      mode,
      pointerX: event.clientX,
      start: item.start,
      end: item.end
    };

    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const moveDrag = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragStateRef.current;

    if (!editable || drag === null) {
      return;
    }

    const deltaDays = Math.round((event.clientX - drag.pointerX) / dayWidth);

    if (!Number.isFinite(deltaDays) || deltaDays === 0) {
      return;
    }

    suppressClickRef.current = true;

    if (drag.mode === 'resize') {
      applyTaskChange(drag.taskId, drag.start, resizeTaskEnd(drag.start, drag.end, deltaDays));
      return;
    }

    applyTaskChange(drag.taskId, addDays(drag.start, deltaDays), addDays(drag.end, deltaDays));
  };

  const endDrag = () => {
    dragStateRef.current = null;
  };

  const handleBarClick = (item: NormalizedGanttTask) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    notifyTask(item);
  };

  const beginProgressDrag = (
    event: React.PointerEvent<HTMLButtonElement>,
    item: NormalizedGanttTask,
    width: number
  ) => {
    if (!editableProgress || event.button > 0 || width <= 0) {
      return;
    }

    event.stopPropagation();

    const startProgress = getEffectiveProgress(item);

    progressDragRef.current = {
      taskId: item.task.id,
      pointerX: event.clientX,
      startProgress,
      width
    };
    progressPreviewRef.current = { taskId: item.task.id, value: startProgress };
    setProgressPreview({ taskId: item.task.id, value: startProgress });

    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const moveProgressDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = progressDragRef.current;

    if (!editableProgress || drag === null) {
      return;
    }

    event.stopPropagation();

    const delta = ((event.clientX - drag.pointerX) / drag.width) * 100;
    const preview = { taskId: drag.taskId, value: snapProgress(drag.startProgress + delta) };

    progressPreviewRef.current = preview;
    setProgressPreview(preview);
  };

  const endProgressDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = progressDragRef.current;

    if (drag === null) {
      return;
    }

    event.stopPropagation();

    progressDragRef.current = null;

    const preview = progressPreviewRef.current;
    const item = normalizedById.get(drag.taskId);

    progressPreviewRef.current = null;
    setProgressPreview(null);

    if (
      item !== undefined &&
      preview !== null &&
      preview.taskId === drag.taskId &&
      preview.value !== drag.startProgress
    ) {
      commitProgress(item, preview.value);
    }
  };

  /** A cancelled pointer reverts the preview without emitting. */
  const cancelProgressDrag = () => {
    progressDragRef.current = null;
    progressPreviewRef.current = null;
    setProgressPreview(null);
  };

  const handleProgressKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    item: NormalizedGanttTask
  ) => {
    if (!editableProgress) {
      return;
    }

    const step = event.shiftKey ? PROGRESS_SHIFT_STEP : PROGRESS_STEP;
    const current = getEffectiveProgress(item);
    let next: number | null = null;

    if (
      event.key === '+' ||
      event.key === '=' ||
      event.key === 'ArrowRight' ||
      event.key === 'ArrowUp'
    ) {
      next = current + step;
    } else if (
      event.key === '-' ||
      event.key === '_' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowDown'
    ) {
      next = current - step;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = 100;
    }

    if (next === null) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    commitProgress(item, next);
  };

  const handleExport = async (format: GanttExportFormat) => {
    try {
      const svg = createGanttExportSvg({
        range,
        columns,
        dayWidth,
        rowHeight,
        labelWidth,
        headerHeight,
        rows: layoutRows,
        showBaseline,
        baselineColor,
        showToday,
        criticalTaskIds,
        criticalPathColor,
        labels,
        getProgress: getEffectiveProgress
      });

      if (svg === null) {
        setExportStatus('Unable to export chart');
        return;
      }

      if (format === 'svg') {
        exportChartSvg(svg, exportFileName);
      } else {
        await exportChartPng(svg, exportFileName);
      }

      setExportStatus(`Exported ${resolveChartFileName(exportFileName, format)}`);

      if (typeof onExport === 'function') {
        onExport(format);
      }
    } catch {
      setExportStatus('Unable to export chart');
    }
  };

  const createDependency = (fromId: string, toId: string) => {
    setCreatedDependencies((current) =>
      current.some((link) => link.from === fromId && link.to === toId)
        ? current
        : [...current, { from: fromId, to: toId }]
    );

    if (typeof onDependencyCreate === 'function') {
      onDependencyCreate(fromId, toId);
    }
  };

  const dependencyLinks = normalizedTasks.flatMap((item) =>
    (item.task.dependencies ?? []).map((dependencyId) => ({
      from: dependencyId,
      to: item.task.id
    }))
  );

  createdDependencies.forEach((link) => {
    if (!dependencyLinks.some((item) => item.from === link.from && item.to === link.to)) {
      dependencyLinks.push(link);
    }
  });

  const dependencyPaths = showDependencies
    ? dependencyLinks.flatMap((link) => {
        const sourceItem = normalizedById.get(link.from);
        const targetItem = normalizedById.get(link.to);
        const sourceRow = taskRowById.get(link.from);
        const targetRow = taskRowById.get(link.to);

        if (
          sourceItem === undefined ||
          targetItem === undefined ||
          sourceRow === undefined ||
          targetRow === undefined
        ) {
          return [];
        }

        const source = getBarMetrics(sourceItem, sourceRow);
        const target = getBarMetrics(targetItem, targetRow);
        const startX = source.left + source.width;
        const startY = source.centerY;
        const endX = target.left;
        const endY = target.centerY;
        const cornerX = endX > startX + 16 ? startX + 8 : endX - 8;

        return [
          {
            key: `${link.from}->${link.to}`,
            critical: criticalLinkKeys.has(`${link.from}->${link.to}`),
            d: `M ${startX} ${startY} H ${cornerX} V ${endY} H ${endX}`
          }
        ];
      })
    : [];

  const todayOffset = diffInDays(range.start, startOfDay(new Date()));
  const showTodayLine = showToday && todayOffset >= 0 && todayOffset < totalDays;
  const columnOffsets = columns.reduce<{ column: GanttColumn; left: number }[]>((acc, column) => {
    const previous = acc[acc.length - 1];

    acc.push({
      column,
      left: previous ? previous.left + previous.column.days * dayWidth : 0
    });

    return acc;
  }, []);

  const rootStyle = {
    ...style,
    '--gantt-label-width': `${labelWidth}px`,
    '--gantt-row-height': `${rowHeight}px`,
    '--gantt-day-width': `${dayWidth}px`
  } as React.CSSProperties;

  const renderLaneRow = (row: GanttLayoutRow) => (
    <div
      key={row.key}
      role="row"
      aria-label={labels.lane(row.laneName ?? labels.unassigned)}
      className={cx(classes.row)}
      style={{ height: rowHeight }}
      data-resource-lane={row.laneId}
    >
      <div role="rowheader" className={cx(classes.label)} style={{ width: labelWidth }}>
        <span className={cx(classes.labelName, classes.laneHeader)}>
          <span
            className={cx(classes.laneSwatch)}
            data-resource-lane-swatch={row.laneId}
            style={{ backgroundColor: row.laneColor }}
            aria-hidden="true"
          />
          <span>{row.laneName}</span>
        </span>
        <span className={cx(classes.labelDates)}>{labels.tasks(row.taskCount ?? 0)}</span>
      </div>
      <div role="gridcell" className={cx(classes.track)} style={{ width: totalWidth }}>
        <span
          className={cx(classes.laneBand)}
          data-resource-lane-band={row.laneId}
          style={{ backgroundColor: row.laneColor }}
          aria-hidden="true"
        />
      </div>
    </div>
  );

  const renderTaskRow = (row: GanttLayoutRow) => {
    const item = row.task;

    if (item === undefined) {
      return null;
    }

    const metrics = getBarMetrics(item, row.rowIndex);
    const progressValue = getEffectiveProgress(item);
    const text = getTaskText(item.task);
    const startText = formatFullDate(item.start, locale);
    const endText = formatFullDate(item.end, locale);
    const isCritical = criticalTaskIds.has(item.task.id);
    const taskResources = getTaskResources(item.task, resourceById, showResources);
    const resourceNames = taskResources.map((entry) => entry.resource.name);
    const barAriaLabel = [
      `${text}, ${startText} – ${endText}, ${progressValue}% complete`,
      isCritical ? 'critical path' : null,
      resourceNames.length > 0 ? `resources: ${resourceNames.join(', ')}` : null,
      row.laneName !== undefined ? `lane: ${row.laneName}` : null
    ]
      .filter((part): part is string => part !== null)
      .join(', ');
    const baseline = showBaseline ? item.baseline : null;
    const baselineMetrics = baseline
      ? getSpanMetrics(range, dayWidth, baseline.start, baseline.end)
      : null;
    const baselineLabel =
      baseline === null
        ? ''
        : `${t('gantt.baselineFor', 'Baseline for {name}', { name: text })}: ${formatFullDate(
            baseline.start,
            locale
          )} – ${formatFullDate(baseline.end, locale)}`;
    const baselineTop = metrics.top + metrics.height + 1;
    const baselineHeight = Math.max(2, Math.min(4, rowHeight - baselineTop - 1));
    const listIndex = taskListIndexById.get(item.task.id);
    const nextTask = listIndex === undefined ? undefined : normalizedTasks[listIndex + 1];
    const isPreviewing = progressPreview !== null && progressPreview.taskId === item.task.id;

    return (
      <div
        key={row.key}
        role={resourceView ? 'row' : undefined}
        className={cx(classes.row)}
        style={{ height: rowHeight }}
        data-task-row={item.task.id}
        data-task-lane={row.laneId}
      >
        <div
          role={resourceView ? 'rowheader' : undefined}
          className={cx(classes.label)}
          style={{ width: labelWidth }}
        >
          <span className={cx(classes.labelName)}>{item.task.name}</span>
          <span className={cx(classes.labelDates)}>
            {startText} – {endText}
          </span>
        </div>
        <div
          role={resourceView ? 'gridcell' : undefined}
          className={cx(classes.track)}
          style={{ width: totalWidth }}
        >
          {baselineMetrics !== null && (
            <div
              role="img"
              aria-label={baselineLabel}
              title={baselineLabel}
              className={cx(classes.baselineBar)}
              data-baseline-task={item.task.id}
              style={{
                left: baselineMetrics.left,
                width: baselineMetrics.width,
                top: baselineTop,
                height: baselineHeight,
                backgroundColor: baselineColor
              }}
            />
          )}
          <div
            role="button"
            tabIndex={0}
            aria-label={barAriaLabel}
            className={cx(classes.bar, editable && classes.editableBar)}
            data-task-id={item.task.id}
            data-progress={progressValue}
            data-progress-preview={isPreviewing ? 'true' : undefined}
            data-critical={isCritical ? 'true' : undefined}
            data-resource-ids={
              taskResources.length > 0
                ? taskResources.map((entry) => entry.resource.id).join(' ')
                : undefined
            }
            style={{
              left: metrics.left,
              width: metrics.width,
              top: metrics.top,
              height: metrics.height,
              ...(editableProgress ? { overflow: 'visible' } : {}),
              ...(isCritical
                ? { backgroundColor: criticalPathColor }
                : item.task.color
                  ? { backgroundColor: item.task.color }
                  : {})
            }}
            onClick={() => handleBarClick(item)}
            onKeyDown={(event) => handleKeyDown(event, item)}
            onPointerDown={editable ? (event) => beginDrag(event, item, 'move') : undefined}
            onPointerMove={editable ? moveDrag : undefined}
            onPointerUp={editable ? endDrag : undefined}
          >
            <span
              className={cx(classes.barProgress)}
              style={{ width: `${progressValue}%` }}
              aria-hidden="true"
            />
            <span className={cx(classes.barLabel)} aria-hidden="true">
              {item.task.name}
            </span>
            {taskResources.length > 0 && (
              <span className={cx(classes.resourceDots)} aria-hidden="true">
                {taskResources.map((entry) => (
                  <span
                    key={entry.resource.id}
                    className={cx(classes.resourceDot)}
                    data-resource-dot={entry.resource.id}
                    title={entry.resource.name}
                    style={{ backgroundColor: entry.color }}
                  />
                ))}
              </span>
            )}
          </div>
          {editableProgress && (
            <button
              type="button"
              role="slider"
              aria-label={labels.progress(text)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressValue}
              aria-valuetext={`${progressValue}% complete`}
              className={cx(classes.progressHandle)}
              data-progress-handle={item.task.id}
              data-progress-preview={isPreviewing ? 'true' : undefined}
              style={{
                left: metrics.left + (progressValue / 100) * metrics.width,
                top: metrics.centerY
              }}
              onPointerDown={(event) => beginProgressDrag(event, item, metrics.width)}
              onPointerMove={moveProgressDrag}
              onPointerUp={endProgressDrag}
              onPointerCancel={cancelProgressDrag}
              onKeyDown={(event) => handleProgressKeyDown(event, item)}
              onClick={(event) => event.stopPropagation()}
            />
          )}
          {editable && (
            <>
              <button
                type="button"
                className={cx(classes.resizeHandle)}
                style={{
                  left: metrics.left + metrics.width - 6,
                  width: 10,
                  top: metrics.top,
                  height: metrics.height
                }}
                aria-label={labels.resize(text)}
                data-resize-task={item.task.id}
                onPointerDown={(event) => beginDrag(event, item, 'resize')}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onKeyDown={(event) => handleResizeKeyDown(event, item)}
              />
              <button
                type="button"
                className={cx(classes.linkHandle)}
                style={{
                  left: metrics.left + metrics.width + 4,
                  width: 18,
                  height: 18,
                  top: metrics.centerY - 9
                }}
                aria-label={labels.link(text)}
                data-link-task={item.task.id}
                disabled={nextTask === undefined}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => {
                  if (nextTask !== undefined) {
                    createDependency(item.task.id, nextTask.task.id);
                  }
                }}
              >
                <span aria-hidden="true">↗</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={ref}
      role="region"
      aria-label={ariaLabel}
      className={cx(classes.root, className)}
      style={rootStyle}
    >
      {showResourceLegend && (
        <div role="list" aria-label={resourceLabel} className={cx(classes.legend)}>
          {resourceEntries.map(({ resource, color }) => (
            <div
              key={resource.id}
              role="listitem"
              className={cx(classes.legendItem)}
              data-resource-id={resource.id}
            >
              <span
                className={cx(classes.legendSwatch)}
                data-resource-swatch={resource.id}
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span>{resource.name}</span>
            </div>
          ))}
        </div>
      )}
      {exportable && (
        <div className={cx(classes.toolbar)} data-gantt-export-toolbar="true">
          <button
            type="button"
            className={cx(classes.toolbarButton)}
            onClick={() => {
              handleExport('svg').catch(() => undefined);
            }}
          >
            Export SVG
          </button>
          <button
            type="button"
            className={cx(classes.toolbarButton)}
            onClick={() => {
              handleExport('png').catch(() => undefined);
            }}
          >
            Export PNG
          </button>
          {exportStatus !== null && (
            <span role="status" aria-live="polite" className={cx(classes.status)}>
              {exportStatus}
            </span>
          )}
        </div>
      )}
      {normalizedTasks.length === 0 ? (
        <div className={cx(classes.empty)}>{emptyState}</div>
      ) : (
        <div
          className={cx(classes.viewport)}
          style={maxHeight !== undefined ? { maxHeight } : undefined}
        >
          <div className={cx(classes.grid)} style={{ minWidth: labelWidth + totalWidth }}>
            <div className={cx(classes.header)} style={{ height: headerHeight }}>
              <div className={cx(classes.headerCorner)} style={{ width: labelWidth }}>
                {resourceView ? labels.resource : labels.task}
              </div>
              <div className={cx(classes.headerTimeline)} style={{ width: totalWidth }}>
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={cx(classes.headerColumn)}
                    style={{ width: column.days * dayWidth }}
                  >
                    {column.label}
                  </div>
                ))}
              </div>
            </div>
            <div className={cx(classes.body)}>
              {columnOffsets.map(({ column, left }) => (
                <div
                  key={column.key}
                  className={cx(classes.columnGuide)}
                  style={{ left: labelWidth + left, width: column.days * dayWidth }}
                  aria-hidden="true"
                />
              ))}
              <div
                className={cx(classes.rows)}
                role={resourceView ? 'grid' : undefined}
                aria-label={resourceView ? labels.resourceLanes : undefined}
                aria-rowcount={resourceView ? layoutRows.length : undefined}
              >
                {layoutRows.map((row) =>
                  row.kind === 'lane' ? renderLaneRow(row) : renderTaskRow(row)
                )}
              </div>
              {dependencyPaths.length > 0 && (
                <svg
                  className={cx(classes.dependency)}
                  style={{
                    left: labelWidth,
                    width: totalWidth,
                    height: totalHeight
                  }}
                  width={totalWidth}
                  height={totalHeight}
                  aria-hidden="true"
                  focusable="false"
                >
                  <defs>
                    <marker
                      id={markerId}
                      markerWidth="6"
                      markerHeight="6"
                      refX="5"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0,0 6,3 0,6" fill="var(--gantt-dependency-color, #8f9bb3)" />
                    </marker>
                    <marker
                      id={criticalMarkerId}
                      markerWidth="6"
                      markerHeight="6"
                      refX="5"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0,0 6,3 0,6" fill={criticalPathColor} />
                    </marker>
                  </defs>
                  {dependencyPaths.map((path) => (
                    <path
                      key={path.key}
                      d={path.d}
                      data-dependency={path.key}
                      data-critical={path.critical ? 'true' : undefined}
                      fill="none"
                      stroke={
                        path.critical ? criticalPathColor : 'var(--gantt-dependency-color, #8f9bb3)'
                      }
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd={`url(#${path.critical ? criticalMarkerId : markerId})`}
                    />
                  ))}
                </svg>
              )}
              {showTodayLine && (
                <div
                  role="separator"
                  aria-label={labels.today}
                  className={cx(classes.todayLine)}
                  style={{ left: labelWidth + todayOffset * dayWidth }}
                >
                  <span className={cx(classes.todayLabel)} aria-hidden="true">
                    {labels.today}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

_GanttChart.displayName = 'GanttChart';

export const GanttChart = _GanttChart;
