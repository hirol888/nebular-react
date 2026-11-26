import React, { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Button } from '../../Button';
import { EmptyState } from '../../EmptyState';
import { LoadingOverlay } from '../../LoadingOverlay';
import { ChartDataTable } from '../ChartDataTable';
import { exportChartPng, exportChartSvg, resolveChartFileName } from '../chart-export';
import { usePrefersReducedMotion } from './chart-motion';

export type ChartContainerExportFormat = 'svg' | 'png';

export type ChartContainerDataTableMode = 'hidden' | 'visible' | false;

export interface ChartContainerDataTable {
  caption?: string;
  columns: string[];
  rows: React.ReactNode[][];
}

export interface ChartContainerSize {
  width: number;
  height: number;
}

export interface ChartContainerProps extends DefaultProps<ChartContainerStylesNames> {
  /** Chart content, or a render prop that receives the measured size. */
  children: React.ReactNode | ((size: ChartContainerSize) => React.ReactNode);
  /** Height of the chart area in pixels. */
  height?: number;
  /** Fixed width. When omitted the container measures itself. */
  width?: number;
  /** Minimum height of the chart area. */
  minHeight?: number;
  /** Renders a loading overlay above the chart area. */
  loading?: boolean;
  /** Replaces the chart content with an empty state. */
  empty?: boolean;
  /** Message rendered by the empty state. */
  emptyMessage?: React.ReactNode;
  /** Header title. */
  title?: React.ReactNode;
  /** Header description. */
  description?: React.ReactNode;
  /** Extra actions rendered in the header. */
  actions?: React.ReactNode;
  /** Renders the export controls. */
  exportable?: boolean;
  /** Base file name used by the export controls (without extension). */
  exportFileName?: string;
  /** Called after a chart was serialized for export. */
  onExport?(format: ChartContainerExportFormat, blob: Blob): void;
  /** Accessible data table rendered for the chart. */
  dataTable?: ChartContainerDataTable;
  /** `visible` renders a toggle, `hidden` renders a screen-reader-only table. */
  showDataTable?: ChartContainerDataTableMode;
  /** Adds a light entry animation that respects `prefers-reduced-motion`. */
  animated?: boolean;
  ariaLabel?: string;
}

const DEFAULT_WIDTH = 640;
const EXPORT_PIXEL_RATIO = 2;

const useStyles = createStyles((_theme) => {
  const enter = keyframes({
    from: { opacity: 0, transform: 'translateY(6px)' },
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

    header: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },

    heading: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.15rem',
      minWidth: 0
    },

    title: {
      margin: 0,
      color: 'var(--chart-title-color, var(--text-basic-color, #222b45))',
      fontSize: 'var(--chart-title-font-size, 0.95rem)',
      fontWeight: 700,
      lineHeight: 1.3
    },

    description: {
      color: 'var(--chart-description-color, var(--text-hint-color, #8f9bb3))',
      fontSize: 'var(--chart-description-font-size, 0.75rem)',
      lineHeight: 1.4
    },

    actions: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.5rem'
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
      fontSize: 'var(--chart-status-font-size, 0.7rem)'
    },

    body: {
      position: 'relative',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'center',
      width: '100%'
    },

    content: {
      width: '100%',
      minWidth: 0
    }
  };
});

export type ChartContainerStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<ChartContainerProps> = {
  height: 280,
  loading: false,
  empty: false,
  emptyMessage: 'No data',
  exportable: false,
  exportFileName: 'chart',
  showDataTable: false,
  animated: false
};

const _ChartContainer = forwardRef<HTMLDivElement, ChartContainerProps>((props, ref) => {
  const {
    children,
    height,
    width,
    minHeight,
    loading,
    empty,
    emptyMessage,
    title,
    description,
    actions,
    exportable,
    exportFileName,
    onExport,
    dataTable,
    showDataTable,
    animated,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'chart-container',
    classNames,
    styles,
    unstyled
  });
  const bodyRef = useRef<HTMLDivElement>(null);
  const tableId = useId();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const [tableOpen, setTableOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const node = bodyRef.current;

    if (!node) {
      return undefined;
    }

    const apply = (nextWidth: number) => {
      if (nextWidth > 0) {
        setMeasuredWidth(nextWidth);
      }
    };

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];

        if (entry) {
          apply(entry.contentRect.width);
        }
      });

      observer.observe(node);

      return () => observer.disconnect();
    }

    const handleResize = () => apply(node.getBoundingClientRect().width);

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resolvedWidth = width ?? (measuredWidth > 0 ? Math.round(measuredWidth) : DEFAULT_WIDTH);
  const hasHeader = Boolean(title || description || actions);
  const isAnimated = animated && !prefersReducedMotion;
  const hasDataTable = Boolean(dataTable && dataTable.columns.length > 0);
  const showTableToggle = showDataTable === 'visible' && hasDataTable;
  const showHiddenTable = showDataTable === 'hidden' && hasDataTable;

  const handleExport = useCallback(
    async (format: ChartContainerExportFormat) => {
      const svg = bodyRef.current?.querySelector('svg');

      if (!svg) {
        setStatus('No chart to export');
        return;
      }

      try {
        if (format === 'svg') {
          exportChartSvg(svg, exportFileName, {
            onBlob: (blob) => onExport?.('svg', blob)
          });
          setStatus(`Exported ${resolveChartFileName(exportFileName, 'svg')}`);
          return;
        }

        await exportChartPng(svg, exportFileName, {
          scale: EXPORT_PIXEL_RATIO,
          onBlob: (blob) => onExport?.('png', blob)
        });
        setStatus(`Exported ${resolveChartFileName(exportFileName, 'png')}`);
      } catch {
        setStatus('Unable to export chart');
      }
    },
    [exportFileName, onExport]
  );

  const bodyContent =
    typeof children === 'function' ? children({ width: resolvedWidth, height }) : children;

  return (
    <div
      ref={ref}
      className={cx(classes.root, isAnimated && classes.animated, className)}
      data-animated={isAnimated ? 'true' : undefined}
      role={ariaLabel ? 'group' : undefined}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
    >
      {hasHeader && (
        <div className={cx(classes.header)}>
          <div className={cx(classes.heading)}>
            {title && <h3 className={cx(classes.title)}>{title}</h3>}
            {description && <div className={cx(classes.description)}>{description}</div>}
          </div>
          {actions && <div className={cx(classes.actions)}>{actions}</div>}
        </div>
      )}
      {(exportable || showTableToggle) && (
        <div className={cx(classes.toolbar)}>
          {exportable && (
            <>
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
            </>
          )}
          {showTableToggle && (
            <Button
              size="tiny"
              appearance="outline"
              type="button"
              aria-expanded={tableOpen}
              aria-controls={tableId}
              onClick={() => setTableOpen((open) => !open)}
            >
              {tableOpen ? 'Ocultar tabela' : 'Mostrar tabela'}
            </Button>
          )}
          {status && (
            <span role="status" aria-live="polite" className={cx(classes.status)}>
              {status}
            </span>
          )}
        </div>
      )}
      <LoadingOverlay visible={loading} message="Loading">
        <div
          ref={bodyRef}
          className={cx(classes.body)}
          style={{ height, minHeight }}
          aria-busy={loading || undefined}
        >
          {empty ? (
            <EmptyState compact description={emptyMessage} />
          ) : (
            <div className={cx(classes.content)}>{bodyContent}</div>
          )}
        </div>
      </LoadingOverlay>
      {showTableToggle && dataTable && (
        <div id={tableId} hidden={!tableOpen}>
          <ChartDataTable
            caption={dataTable.caption}
            columns={dataTable.columns}
            rows={dataTable.rows}
          />
        </div>
      )}
      {showHiddenTable && dataTable && (
        <ChartDataTable
          caption={dataTable.caption}
          columns={dataTable.columns}
          rows={dataTable.rows}
          visuallyHidden
        />
      )}
    </div>
  );
});

_ChartContainer.displayName = 'ChartContainer';

export { _ChartContainer as ChartContainer };
