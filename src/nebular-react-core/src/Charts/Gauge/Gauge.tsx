import React, { forwardRef, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useMergedRef } from '@nebular-react/hooks';
import { Button } from '../../Button';
import { ChartDataTable } from '../ChartDataTable';
import { usePrefersReducedMotion } from '../ChartContainer/chart-motion';
import {
  ChartExportFormat,
  exportChartPng,
  exportChartSvg,
  resolveChartFileName
} from '../chart-export';

export type GaugeDataTableMode = 'hidden' | 'visible' | false;

export interface GaugeProps extends DefaultProps<GaugeStylesNames> {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  thickness?: number;
  color?: string;
  trackColor?: string;
  label?: React.ReactNode;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: GaugeDataTableMode;
  /** Accessible caption used by the generated data table. */
  dataTableCaption?: string;
  /** Renders the "Export SVG" and "Export PNG" controls. */
  exportable?: boolean;
  /** Base file name used by the export controls (without extension). */
  exportFileName?: string;
  /** Adds a light entry animation that respects `prefers-reduced-motion`. */
  animated?: boolean;
}

const useStyles = createStyles((_theme) => {
  const enter = keyframes({
    from: { opacity: 0, transform: 'translateY(4px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  });

  return {
    root: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '0.5rem',
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
      gap: '0.5rem',
      width: '100%'
    },

    status: {
      color: 'var(--chart-status-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.7rem'
    },

    gauge: {
      position: 'relative',
      display: 'inline-flex'
    },

    svg: {
      display: 'block',
      overflow: 'visible'
    },

    arc: {
      transition: 'stroke 120ms ease'
    },

    center: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.15rem',
      textAlign: 'center',
      pointerEvents: 'none'
    },

    value: {
      color: 'var(--gauge-value-color, var(--text-basic-color, #222b45))',
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1
    },

    label: {
      color: 'var(--gauge-label-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.75rem'
    }
  };
});

export type GaugeStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<GaugeProps> = {
  min: 0,
  max: 100,
  size: 180,
  thickness: 14,
  color: 'var(--gauge-color, var(--color-primary-500, #3366ff))',
  trackColor: 'var(--gauge-track-color, var(--border-basic-color-3, #e4e9f2))',
  ariaLabel: 'Gauge',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'gauge',
  animated: false
};

const startAngle = 135;
const totalSweep = 270;

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function arcPath(cx: number, cy: number, radius: number, from: number, to: number) {
  const start = polarToCartesian(cx, cy, radius, from);
  const end = polarToCartesian(cx, cy, radius, to);
  const largeArc = to - from > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

const _Gauge = forwardRef<HTMLDivElement, GaugeProps>((props, ref) => {
  const {
    value,
    min,
    max,
    size,
    thickness,
    color,
    trackColor,
    label,
    valueFormatter,
    ariaLabel,
    showDataTable,
    dataTableCaption,
    exportable,
    exportFileName,
    animated,
    className,
    classNames,
    styles,
    style,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'gauge',
    classNames,
    styles,
    unstyled
  });
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  const clamped = Math.min(Math.max(value, lower), upper);
  const range = upper - lower;
  const ratio = range > 0 ? (clamped - lower) / range : 0;
  const center = size / 2;
  const radius = Math.max(1, center - thickness / 2 - 2);
  const formatted = valueFormatter(clamped);
  const accessibleName = `${ariaLabel}: ${formatted}`;

  const handleExport = async (format: ChartExportFormat) => {
    const svg = rootRef.current?.querySelector('svg');

    if (!svg) {
      setExportStatus('No chart to export');
      return;
    }

    try {
      if (format === 'svg') {
        exportChartSvg(svg, exportFileName);
        setExportStatus(`Exported ${resolveChartFileName(exportFileName, 'svg')}`);
        return;
      }

      await exportChartPng(svg, exportFileName, { scale: 2 });
      setExportStatus(`Exported ${resolveChartFileName(exportFileName, 'png')}`);
    } catch {
      setExportStatus('Unable to export chart');
    }
  };

  return (
    <div
      ref={mergedRef}
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
      <div className={cx(classes.gauge)} style={{ width: size, height: size, ...style }}>
        <svg
          className={cx(classes.svg)}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={accessibleName}
        >
          <title>{accessibleName}</title>
          <path
            className={cx(classes.arc)}
            d={arcPath(center, center, radius, startAngle, startAngle + totalSweep)}
            fill="none"
            stroke={trackColor}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
          {ratio > 0 && (
            <path
              className={cx(classes.arc)}
              d={arcPath(center, center, radius, startAngle, startAngle + totalSweep * ratio)}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div className={cx(classes.center)} aria-hidden="true">
          <span className={cx(classes.value)}>{formatted}</span>
          {label != null && <div className={cx(classes.label)}>{label}</div>}
        </div>
      </div>
      {showDataTable && (
        <ChartDataTable
          caption={dataTableCaption}
          columns={['Label', 'Value', 'Min', 'Max']}
          rows={[[label ?? ariaLabel, formatted, valueFormatter(lower), valueFormatter(upper)]]}
          visuallyHidden={showDataTable === 'hidden'}
        />
      )}
    </div>
  );
});

_Gauge.displayName = 'Gauge';

export { _Gauge as Gauge };
