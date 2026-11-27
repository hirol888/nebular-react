import React, { forwardRef, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useMergedRef } from '@nebular-react/hooks';
import { Button } from '../Button';
import { ChartDataTable } from './ChartDataTable';
import { exportChartPng, exportChartSvg, resolveChartFileName } from './chart-export';
import { usePrefersReducedMotion } from './ChartContainer/chart-motion';

export type SparklineDataTableMode = 'hidden' | 'visible' | false;

export type SparklineExportFormat = 'svg' | 'png';

export interface SparklineProps extends DefaultProps<SparklineStylesNames> {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  area?: boolean;
  ariaLabel?: string;
  formatValue?(value: number): string;
  /** `visible` renders a data table below the sparkline, `hidden` keeps it screen-reader only. */
  showDataTable?: SparklineDataTableMode;
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
      alignItems: 'stretch',
      gap: '0.25rem',
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

    empty: {
      color: 'var(--chart-empty-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.75rem'
    }
  };
});

export type SparklineStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<SparklineProps> = {
  width: 120,
  height: 36,
  color: '#3366ff',
  area: false,
  ariaLabel: 'Sparkline',
  formatValue: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'sparkline',
  animated: false
};

const _Sparkline = forwardRef<HTMLDivElement, SparklineProps>((props, ref) => {
  const {
    data,
    width,
    height,
    color,
    area,
    ariaLabel,
    formatValue,
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
    name: 'sparkline',
    classNames,
    styles,
    unstyled
  });
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;

  const handleExport = async (format: SparklineExportFormat) => {
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

      await exportChartPng(svg, exportFileName);
      setExportStatus(`Exported ${resolveChartFileName(exportFileName, 'png')}`);
    } catch {
      setExportStatus('Unable to export chart');
    }
  };

  if (data.length === 0) {
    return (
      <div
        ref={mergedRef}
        className={cx(classes.root, isAnimated && classes.animated, className)}
        data-animated={isAnimated ? 'true' : undefined}
      >
        <span className={cx(classes.empty)}>No data</span>
      </div>
    );
  }

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;
  const padding = 2;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const getX = (index: number) =>
    padding + (data.length <= 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
  const getY = (value: number) => padding + plotHeight - ((value - minValue) / range) * plotHeight;
  const linePath = data
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(value)}`)
    .join(' ');
  const areaPath = `${linePath} L ${getX(data.length - 1)} ${height - padding} L ${getX(0)} ${
    height - padding
  } Z`;
  const lastValue = data[data.length - 1];
  const dataTable = showDataTable
    ? {
        columns: ['Index', 'Value'],
        rows: data.map((value, index) => [index + 1, formatValue(value)])
      }
    : undefined;

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
      <svg
        className={cx(classes.svg)}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${ariaLabel}: last value ${formatValue(lastValue)}`}
      >
        <title>{`${ariaLabel}: last value ${formatValue(lastValue)}`}</title>
        {area && <path d={areaPath} fill={color} opacity={0.15} />}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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

_Sparkline.displayName = 'Sparkline';

export { _Sparkline as Sparkline };
