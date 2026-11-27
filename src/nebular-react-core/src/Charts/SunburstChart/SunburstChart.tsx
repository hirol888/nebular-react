import React, { forwardRef, useCallback, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Button } from '../../Button';
import { ChartDataTable } from '../ChartDataTable';
import { exportChartPng, exportChartSvg, resolveChartFileName } from '../chart-export';
import { usePrefersReducedMotion } from '../ChartContainer/chart-motion';
import { CHART_COLORS } from '../LineChart';

export interface SunburstNode {
  label: string;
  value?: number;
  color?: string;
  children?: SunburstNode[];
}

export type SunburstChartDataTableMode = 'hidden' | 'visible' | false;

export interface SunburstChartProps extends DefaultProps<SunburstChartStylesNames> {
  data: SunburstNode[];
  size?: number;
  innerRadius?: number;
  showLabels?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  onSegmentClick?(node: SunburstNode, depth: number): void;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: SunburstChartDataTableMode;
  /** Accessible caption used by the generated data table. */
  dataTableCaption?: string;
  /** Renders the "Export SVG" and "Export PNG" controls. */
  exportable?: boolean;
  /** Base file name used by the export controls (without extension). */
  exportFileName?: string;
  /** Adds a light entry animation that respects `prefers-reduced-motion`. */
  animated?: boolean;
}

const PADDING = 4;
const LABEL_CHAR_WIDTH = 6;
const LABEL_MIN_SWEEP = 8;
const LABEL_MIN_THICKNESS = 12;

const useStyles = createStyles((_theme) => {
  const enter = keyframes({
    from: { opacity: 0, transform: 'translateY(4px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  });

  return {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      width: '100%',
      fontFamily: 'var(--chart-text-font-family, inherit)'
    },

    animated: {
      animation: `${enter} 220ms ease-out both`,

      '@media (prefers-reduced-motion: reduce)': {
        animation: 'none'
      }
    },

    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },

    status: {
      color: 'var(--chart-status-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.7rem'
    },

    svg: {
      display: 'block',
      width: '100%',
      height: 'auto',
      overflow: 'visible'
    },

    segment: {
      cursor: 'pointer',
      outline: 'none',
      transition: 'opacity 120ms ease',

      '&:focus-visible': {
        outline: 'none',
        stroke: 'var(--color-primary-500, #3366ff)',
        strokeWidth: 2
      }
    },

    label: {
      fill: 'var(--chart-sunburst-label-color, #ffffff)',
      fontSize: '0.65rem',
      fontWeight: 600,
      pointerEvents: 'none'
    },

    tooltipBox: {
      fill: 'var(--chart-tooltip-background-color, var(--background-basic-color-1, #ffffff))',
      stroke: 'var(--chart-tooltip-border-color, var(--border-basic-color-3, #e4e9f2))',
      strokeWidth: 1
    },

    tooltipText: {
      fill: 'var(--chart-tooltip-text-color, var(--text-basic-color, #222b45))',
      fontSize: '0.65rem'
    },

    empty: {
      padding: '1.5rem',
      textAlign: 'center',
      color: 'var(--chart-empty-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.8125rem'
    }
  };
});

export type SunburstChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<SunburstChartProps> = {
  size: 320,
  innerRadius: 0,
  showLabels: true,
  ariaLabel: 'Sunburst chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'sunburst-chart',
  animated: false
};

interface SunburstSegment {
  node: SunburstNode;
  depth: number;
  value: number;
  color: string;
  path: string;
  children: SunburstSegment[];
  startAngle: number;
  endAngle: number;
}

interface ActiveItem {
  x: number;
  y: number;
  text: string;
}

function resolveLevel(
  nodes: SunburstNode[],
  depth: number,
  parentColor: string | null,
  parentPath: string[],
  paletteOffset: number
): SunburstSegment[] {
  return nodes.map((node, index) => {
    const color =
      node.color ?? parentColor ?? CHART_COLORS[(paletteOffset + index) % CHART_COLORS.length];
    const path = [...parentPath, node.label];
    const children = resolveLevel(node.children ?? [], depth + 1, color, path, 0);
    const childTotal = children.reduce((total, child) => total + child.value, 0);
    const ownValue =
      typeof node.value === 'number' && Number.isFinite(node.value) && node.value > 0
        ? node.value
        : 0;
    const value = children.length > 0 ? childTotal : ownValue;

    return {
      node,
      depth,
      value,
      color,
      path: path.join(' · '),
      children,
      startAngle: 0,
      endAngle: 0
    };
  });
}

function assignAngles(
  segments: SunburstSegment[],
  startAngle: number,
  total: number,
  span: number
) {
  let angle = startAngle;

  segments.forEach((segment) => {
    const sweep = total > 0 ? (segment.value / total) * span : 0;

    segment.startAngle = angle;
    segment.endAngle = angle + sweep;
    angle += sweep;

    assignAngles(
      segment.children,
      segment.startAngle,
      segment.value,
      segment.endAngle - segment.startAngle
    );
  });
}

function flattenSegments(segments: SunburstSegment[]): SunburstSegment[] {
  return segments.reduce(
    (all, segment) => [...all, segment, ...flattenSegments(segment.children)],
    [] as SunburstSegment[]
  );
}

function depthOf(segments: SunburstSegment[]): number {
  return segments.reduce(
    (deepest, segment) =>
      Math.max(deepest, segment.children.length > 0 ? depthOf(segment.children) + 1 : 0),
    0
  );
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function fullCirclePath(cx: number, cy: number, outerRadius: number, innerRadius: number) {
  const outer = [
    `M ${cx} ${cy - outerRadius}`,
    `A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy + outerRadius}`,
    `A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy - outerRadius}`,
    'Z'
  ].join(' ');

  if (innerRadius <= 0) {
    return outer;
  }

  const inner = [
    `M ${cx} ${cy - innerRadius}`,
    `A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy + innerRadius}`,
    `A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy - innerRadius}`,
    'Z'
  ].join(' ');

  return `${outer} ${inner}`;
}

function segmentPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  if (endAngle - startAngle >= 359.999) {
    return fullCirclePath(cx, cy, outerRadius, innerRadius);
  }

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);

  if (innerRadius <= 0) {
    return [
      `M ${cx} ${cy}`,
      `L ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      'Z'
    ].join(' ');
  }

  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z'
  ].join(' ');
}

function truncateLabel(label: string, maxChars: number) {
  if (maxChars < 3) {
    return '';
  }

  if (label.length <= maxChars) {
    return label;
  }

  return `${label.slice(0, maxChars - 1)}…`;
}

const _SunburstChart = forwardRef<HTMLDivElement, SunburstChartProps>((props, ref) => {
  const {
    data,
    size,
    innerRadius,
    showLabels,
    valueFormatter,
    ariaLabel,
    onSegmentClick,
    showDataTable,
    dataTableCaption,
    exportable,
    exportFileName,
    animated,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'sunburst-chart',
    classNames,
    styles,
    unstyled
  });
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;
  const assignRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );
  const roots = resolveLevel(data, 0, null, [], 0);
  const total = roots.reduce((sum, root) => sum + root.value, 0);

  const handleExport = async (format: 'svg' | 'png') => {
    const svg = rootRef.current?.querySelector('svg');

    if (!svg) {
      setExportStatus('No chart to export');
      return;
    }

    try {
      if (format === 'svg') {
        exportChartSvg(svg, exportFileName);
      } else {
        await exportChartPng(svg, exportFileName);
      }

      setExportStatus(`Exported ${resolveChartFileName(exportFileName, format)}`);
    } catch {
      setExportStatus('Unable to export chart');
    }
  };

  if (data.length === 0 || total <= 0) {
    return (
      <div
        ref={ref}
        className={cx(classes.root, isAnimated && classes.animated, className)}
        data-animated={isAnimated ? 'true' : undefined}
      >
        <div className={cx(classes.empty)}>No data</div>
      </div>
    );
  }

  assignAngles(roots, 0, total, 360);

  const center = size / 2;
  const outerRadius = Math.max(1, center - PADDING);
  const inner = Math.min(Math.max(0, innerRadius), outerRadius - 1);
  const ringCount = depthOf(roots) + 1;
  const ringThickness = (outerRadius - inner) / ringCount;
  const segments = flattenSegments(roots).filter(
    (segment) => segment.value > 0 && segment.endAngle > segment.startAngle
  );
  const interactive = typeof onSegmentClick === 'function';
  const dataTable = showDataTable
    ? {
        columns: ['Label', 'Value', 'Parent'],
        rows: segments.map((segment) => {
          const path = segment.path.split(' · ');
          const parent = path.length > 1 ? path[path.length - 2] : '';

          return [segment.node.label, valueFormatter(segment.value), parent];
        })
      }
    : null;

  return (
    <div
      ref={assignRef}
      className={cx(classes.root, isAnimated && classes.animated, className)}
      data-animated={isAnimated ? 'true' : undefined}
    >
      {exportable && (
        <div className={cx(classes.toolbar)}>
          <Button
            size="tiny"
            appearance="outline"
            type="button"
            onClick={() => {
              handleExport('svg').catch(() => undefined);
            }}
          >
            Export SVG
          </Button>
          <Button
            size="tiny"
            appearance="outline"
            type="button"
            onClick={() => {
              handleExport('png').catch(() => undefined);
            }}
          >
            Export PNG
          </Button>
          {exportStatus && (
            <span role="status" aria-live="polite" className={cx(classes.status)}>
              {exportStatus}
            </span>
          )}
        </div>
      )}
      <svg
        className={cx(classes.svg)}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveItem(null)}
      >
        <title>{ariaLabel}</title>
        {segments.map((segment) => {
          const segmentInner = inner + segment.depth * ringThickness;
          const segmentOuter = segmentInner + ringThickness;
          const sweep = segment.endAngle - segment.startAngle;
          const midAngle = (segment.startAngle + segment.endAngle) / 2;
          const midRadius = (segmentInner + segmentOuter) / 2;
          const anchor = polarToCartesian(center, center, midRadius, midAngle);
          const text = `${segment.path}: ${valueFormatter(segment.value)}`;
          const arcLength = ((sweep * Math.PI) / 180) * midRadius;
          const maxChars = Math.floor(arcLength / LABEL_CHAR_WIDTH);
          const label =
            showLabels && sweep >= LABEL_MIN_SWEEP && ringThickness >= LABEL_MIN_THICKNESS
              ? truncateLabel(segment.node.label, maxChars)
              : '';

          return (
            <g key={`${segment.path}-${segment.depth}`}>
              <path
                className={cx(classes.segment)}
                d={segmentPath(
                  center,
                  center,
                  segmentOuter,
                  segmentInner,
                  segment.startAngle,
                  segment.endAngle
                )}
                fill={segment.color}
                fillOpacity={Math.max(0.55, 1 - segment.depth * 0.18)}
                fillRule="evenodd"
                stroke="var(--background-basic-color-1, #ffffff)"
                strokeWidth={1}
                data-sunburst-depth={segment.depth}
                data-sunburst-label={segment.node.label}
                data-sunburst-value={segment.value}
                data-start-angle={segment.startAngle}
                data-end-angle={segment.endAngle}
                data-inner-radius={segmentInner}
                data-outer-radius={segmentOuter}
                role={interactive ? 'button' : 'img'}
                tabIndex={0}
                aria-label={text}
                onMouseEnter={() => setActiveItem({ x: anchor.x, y: anchor.y, text })}
                onFocus={() => setActiveItem({ x: anchor.x, y: anchor.y, text })}
                onBlur={() => setActiveItem(null)}
                onClick={() => onSegmentClick?.(segment.node, segment.depth)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSegmentClick?.(segment.node, segment.depth);
                  }
                }}
              />
              {label.length > 0 && (
                <text
                  className={cx(classes.label)}
                  x={anchor.x}
                  y={anchor.y + 3}
                  textAnchor="middle"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
        {activeItem && (
          <g transform={`translate(${activeItem.x}, ${activeItem.y - 12})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeItem.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeItem.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeItem.text}
            </text>
          </g>
        )}
      </svg>
      {dataTable && (
        <ChartDataTable
          caption={dataTableCaption}
          columns={dataTable.columns}
          rows={dataTable.rows}
          visuallyHidden={showDataTable === 'hidden'}
        />
      )}
    </div>
  );
});

_SunburstChart.displayName = 'SunburstChart';

export { _SunburstChart as SunburstChart };
