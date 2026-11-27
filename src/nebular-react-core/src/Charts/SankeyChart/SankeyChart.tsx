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

export interface SankeyChartNode {
  id: string;
  label: string;
  color?: string;
}

export interface SankeyChartLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

export type SankeyChartDataTableMode = 'hidden' | 'visible' | false;

export interface SankeyChartProps extends DefaultProps<SankeyChartStylesNames> {
  nodes: SankeyChartNode[];
  links: SankeyChartLink[];
  height?: number;
  nodeWidth?: number;
  nodePadding?: number;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  onNodeClick?(node: SankeyChartNode): void;
  onLinkClick?(link: SankeyChartLink): void;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: SankeyChartDataTableMode;
  /** Accessible caption used by the generated data table. */
  dataTableCaption?: string;
  /** Renders the "Export SVG" and "Export PNG" controls. */
  exportable?: boolean;
  /** Base file name used by the export controls (without extension). */
  exportFileName?: string;
  /** Adds a light entry animation that respects `prefers-reduced-motion`. */
  animated?: boolean;
}

const CHART_WIDTH = 480;
const PADDING = 12;

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

    node: {
      cursor: 'pointer',
      outline: 'none',
      transition: 'opacity 120ms ease',

      '&:focus-visible': {
        outline: 'none',
        stroke: 'var(--color-primary-500, #3366ff)',
        strokeWidth: 2
      }
    },

    link: {
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
      fill: 'var(--chart-sankey-label-color, var(--text-basic-color, #222b45))',
      fontSize: '0.65rem',
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

export type SankeyChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<SankeyChartProps> = {
  height: 320,
  nodeWidth: 12,
  nodePadding: 10,
  ariaLabel: 'Sankey chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'sankey-chart',
  animated: false
};

interface SankeyNodeLayout {
  node: SankeyChartNode;
  index: number;
  layer: number;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface SankeyLinkLayout {
  link: SankeyChartLink;
  source: SankeyNodeLayout;
  target: SankeyNodeLayout;
  value: number;
  thickness: number;
  d: string;
  color: string;
  anchorX: number;
  anchorY: number;
}

interface ActiveItem {
  x: number;
  y: number;
  text: string;
}

function resolveLayers(nodes: SankeyChartNode[], links: SankeyChartLink[]): Map<string, number> {
  const layerById = new Map<string, number>();

  nodes.forEach((node) => layerById.set(node.id, 0));

  const iterations = Math.max(1, nodes.length);

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    let changed = false;

    links.forEach((link) => {
      const sourceLayer = layerById.get(link.source) ?? 0;
      const targetLayer = layerById.get(link.target) ?? 0;

      if (sourceLayer + 1 > targetLayer) {
        layerById.set(link.target, sourceLayer + 1);
        changed = true;
      }
    });

    if (!changed) {
      break;
    }
  }

  layerById.forEach((layer, id) => {
    if (layer > iterations - 1) {
      layerById.set(id, iterations - 1);
    }
  });

  return layerById;
}

function linkPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  thickness: number
) {
  const control = Math.max(8, Math.abs(targetX - sourceX) * 0.5);
  const sourceControl = sourceX + control;
  const targetControl = targetX - control;

  return [
    `M ${sourceX} ${sourceY}`,
    `C ${sourceControl} ${sourceY}, ${targetControl} ${targetY}, ${targetX} ${targetY}`,
    `L ${targetX} ${targetY + thickness}`,
    `C ${targetControl} ${targetY + thickness}, ${sourceControl} ${sourceY + thickness}, ${sourceX} ${
      sourceY + thickness
    }`,
    'Z'
  ].join(' ');
}

const _SankeyChart = forwardRef<HTMLDivElement, SankeyChartProps>((props, ref) => {
  const {
    nodes,
    links,
    height,
    nodeWidth,
    nodePadding,
    valueFormatter,
    ariaLabel,
    onNodeClick,
    onLinkClick,
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
    name: 'sankey-chart',
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

  const nodeIds = new Set(nodes.map((node) => node.id));
  const validLinks = links.filter(
    (link) =>
      nodeIds.has(link.source) &&
      nodeIds.has(link.target) &&
      link.source !== link.target &&
      Number.isFinite(link.value) &&
      link.value > 0
  );

  if (nodes.length === 0 || validLinks.length === 0) {
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

  const plotWidth = CHART_WIDTH - PADDING * 2;
  const plotHeight = height - PADDING * 2;
  const outgoingById = new Map<string, number>();
  const incomingById = new Map<string, number>();

  nodes.forEach((node) => {
    outgoingById.set(node.id, 0);
    incomingById.set(node.id, 0);
  });

  validLinks.forEach((link) => {
    outgoingById.set(link.source, (outgoingById.get(link.source) ?? 0) + link.value);
    incomingById.set(link.target, (incomingById.get(link.target) ?? 0) + link.value);
  });

  const valueById = new Map<string, number>();

  nodes.forEach((node) => {
    valueById.set(
      node.id,
      Math.max(outgoingById.get(node.id) ?? 0, incomingById.get(node.id) ?? 0)
    );
  });

  const layers = resolveLayers(nodes, validLinks);
  const layerNumbers = Array.from(new Set(layers.values())).sort((first, second) => first - second);
  const columns = layerNumbers.map((layer) =>
    nodes.filter((node) => (layers.get(node.id) ?? 0) === layer)
  );
  const columnTotals = columns.map((column) =>
    column.reduce((total, node) => total + (valueById.get(node.id) ?? 0), 0)
  );
  const maxColumnTotal = Math.max(...columnTotals);
  const maxColumnCount = Math.max(...columns.map((column) => column.length));
  const availableHeight = plotHeight - nodePadding * Math.max(0, maxColumnCount - 1);
  const scale = maxColumnTotal > 0 ? Math.min(1, Math.max(0, availableHeight) / maxColumnTotal) : 1;
  const lastColumn = Math.max(0, columns.length - 1);
  const indexById = new Map(nodes.map((node, index) => [node.id, index]));
  const columnX = columns.map((_column, columnIndex) => {
    if (lastColumn === 0) {
      return PADDING + (plotWidth - nodeWidth) / 2;
    }

    return PADDING + (columnIndex / lastColumn) * (plotWidth - nodeWidth);
  });
  const nodeLayouts: SankeyNodeLayout[] = [];

  columns.forEach((column, columnIndex) => {
    const heights = column.map((node) => (valueById.get(node.id) ?? 0) * scale);
    const contentHeight =
      heights.reduce((total, nodeHeight) => total + nodeHeight, 0) +
      nodePadding * Math.max(0, column.length - 1);
    let offset = PADDING + (plotHeight - contentHeight) / 2;

    column.forEach((node, nodeIndex) => {
      const index = indexById.get(node.id) ?? 0;

      nodeLayouts.push({
        node,
        index,
        layer: layers.get(node.id) ?? 0,
        value: valueById.get(node.id) ?? 0,
        x: columnX[columnIndex],
        y: offset,
        width: nodeWidth,
        height: heights[nodeIndex],
        color: node.color ?? CHART_COLORS[index % CHART_COLORS.length]
      });

      offset += heights[nodeIndex] + nodePadding;
    });
  });

  const layoutById = new Map(nodeLayouts.map((nodeLayout) => [nodeLayout.node.id, nodeLayout]));
  const sourceCursor = new Map(nodeLayouts.map((nodeLayout) => [nodeLayout.node.id, nodeLayout.y]));
  const targetCursor = new Map(nodeLayouts.map((nodeLayout) => [nodeLayout.node.id, nodeLayout.y]));
  const linkLayouts: SankeyLinkLayout[] = validLinks.map((link) => {
    const source = layoutById.get(link.source) as SankeyNodeLayout;
    const target = layoutById.get(link.target) as SankeyNodeLayout;
    const thickness = link.value * scale;
    const sourceY = sourceCursor.get(link.source) ?? source.y;
    const targetY = targetCursor.get(link.target) ?? target.y;

    sourceCursor.set(link.source, sourceY + thickness);
    targetCursor.set(link.target, targetY + thickness);

    const sourceX = source.x + source.width;
    const targetX = target.x;

    return {
      link,
      source,
      target,
      value: link.value,
      thickness,
      d: linkPath(sourceX, sourceY, targetX, targetY, thickness),
      color: link.color ?? source.color,
      anchorX: (sourceX + targetX) / 2,
      anchorY: (sourceY + targetY) / 2 + thickness / 2
    };
  });
  const nodeInteractive = typeof onNodeClick === 'function';
  const linkInteractive = typeof onLinkClick === 'function';
  const labelById = new Map(nodes.map((node) => [node.id, node.label]));
  const dataTable = showDataTable
    ? {
        columns: ['Source', 'Target', 'Value'],
        rows: validLinks.map((link) => [
          labelById.get(link.source) ?? link.source,
          labelById.get(link.target) ?? link.target,
          valueFormatter(link.value)
        ])
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
        viewBox={`0 0 ${CHART_WIDTH} ${height}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveItem(null)}
      >
        <title>{ariaLabel}</title>
        {linkLayouts.map((linkLayout) => {
          const text = `${linkLayout.source.node.label} → ${
            linkLayout.target.node.label
          }: ${valueFormatter(linkLayout.value)}`;

          return (
            <path
              key={`${linkLayout.link.source}-${linkLayout.link.target}-${linkLayout.value}`}
              className={cx(classes.link)}
              d={linkLayout.d}
              fill={linkLayout.color}
              fillOpacity={0.35}
              data-sankey-link={`${linkLayout.link.source}->${linkLayout.link.target}`}
              data-sankey-value={linkLayout.value}
              data-sankey-thickness={linkLayout.thickness}
              role={linkInteractive ? 'button' : 'img'}
              tabIndex={0}
              aria-label={text}
              onMouseEnter={() =>
                setActiveItem({
                  x: linkLayout.anchorX,
                  y: linkLayout.anchorY,
                  text
                })
              }
              onFocus={() =>
                setActiveItem({
                  x: linkLayout.anchorX,
                  y: linkLayout.anchorY,
                  text
                })
              }
              onBlur={() => setActiveItem(null)}
              onClick={() => onLinkClick?.(linkLayout.link)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onLinkClick?.(linkLayout.link);
                }
              }}
            />
          );
        })}
        {nodeLayouts.map((nodeLayout) => {
          const text = `${nodeLayout.node.label}: ${valueFormatter(nodeLayout.value)}`;
          const centerX = nodeLayout.x + nodeLayout.width / 2;
          const centerY = nodeLayout.y + nodeLayout.height / 2;
          const isLastColumn = nodeLayout.layer === layerNumbers[layerNumbers.length - 1];

          return (
            <g key={nodeLayout.node.id}>
              <rect
                className={cx(classes.node)}
                x={nodeLayout.x}
                y={nodeLayout.y}
                width={nodeLayout.width}
                height={nodeLayout.height}
                rx={2}
                fill={nodeLayout.color}
                data-sankey-node={nodeLayout.node.id}
                data-sankey-layer={nodeLayout.layer}
                data-sankey-value={nodeLayout.value}
                data-sankey-height={nodeLayout.height}
                role={nodeInteractive ? 'button' : 'img'}
                tabIndex={0}
                aria-label={text}
                onMouseEnter={() => setActiveItem({ x: centerX, y: centerY, text })}
                onFocus={() => setActiveItem({ x: centerX, y: centerY, text })}
                onBlur={() => setActiveItem(null)}
                onClick={() => onNodeClick?.(nodeLayout.node)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onNodeClick?.(nodeLayout.node);
                  }
                }}
              />
              {nodeLayout.height >= 14 && (
                <text
                  className={cx(classes.label)}
                  x={isLastColumn ? nodeLayout.x - 6 : nodeLayout.x + nodeLayout.width + 6}
                  y={centerY + 3}
                  textAnchor={isLastColumn ? 'end' : 'start'}
                >
                  {nodeLayout.node.label}
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

_SankeyChart.displayName = 'SankeyChart';

export { _SankeyChart as SankeyChart };
