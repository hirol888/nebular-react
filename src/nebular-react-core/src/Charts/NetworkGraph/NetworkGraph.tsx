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
import { CHART_COLORS, ChartLegend } from '../LineChart';
import { ChartDataTable } from '../ChartDataTable';
import { usePrefersReducedMotion } from '../ChartContainer/chart-motion';
import {
  ChartExportFormat,
  exportChartPng,
  exportChartSvg,
  resolveChartFileName
} from '../chart-export';

export interface NetworkGraphNode {
  id: string;
  label?: string;
  group?: string;
  color?: string;
  radius?: number;
}

export interface NetworkGraphEdge {
  source: string;
  target: string;
  label?: string;
  weight?: number;
}

export type NetworkGraphLayout = 'circular' | 'force';

export type NetworkGraphDataTableMode = 'hidden' | 'visible' | false;

export interface NetworkGraphProps extends DefaultProps<NetworkGraphStylesNames> {
  nodes: NetworkGraphNode[];
  edges: NetworkGraphEdge[];
  width?: number;
  height?: number;
  layout?: NetworkGraphLayout;
  showLegend?: boolean;
  ariaLabel?: string;
  onNodeClick?(node: NetworkGraphNode): void;
  /** `visible` renders data tables below the chart, `hidden` keeps them screen-reader only. */
  showDataTable?: NetworkGraphDataTableMode;
  /** Accessible caption used by the generated data tables. */
  dataTableCaption?: string;
  /** Renders the "Export SVG" and "Export PNG" controls. */
  exportable?: boolean;
  /** Base file name used by the export controls (without extension). */
  exportFileName?: string;
  /** Adds a light entry animation that respects `prefers-reduced-motion`. */
  animated?: boolean;
}

const PADDING = 40;
const DEFAULT_NODE_RADIUS = 10;
const FORCE_ITERATIONS = 80;

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
      gap: '0.5rem',
      width: '100%'
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

    edge: {
      stroke: 'var(--chart-network-edge-color, var(--border-basic-color-4, #c5cee0))',
      strokeOpacity: 0.9,
      outline: 'none',

      '&:focus-visible': {
        stroke: 'var(--color-primary-500, #3366ff)',
        strokeWidth: 2
      }
    },

    edgeLabel: {
      fill: 'var(--chart-axis-text-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.6rem',
      pointerEvents: 'none'
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

    nodeLabel: {
      fill: 'var(--chart-network-label-color, var(--text-basic-color, #222b45))',
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

    legend: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      margin: 0,
      padding: 0,
      listStyle: 'none'
    },

    legendItem: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      color: 'var(--chart-legend-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.75rem'
    },

    legendSwatch: {
      width: '0.65rem',
      height: '0.65rem',
      borderRadius: '2px',
      flex: '0 0 auto'
    },

    empty: {
      padding: '1.5rem',
      textAlign: 'center',
      color: 'var(--chart-empty-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.8125rem'
    }
  };
});

export type NetworkGraphStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<NetworkGraphProps> = {
  width: 480,
  height: 320,
  layout: 'circular',
  showLegend: true,
  ariaLabel: 'Network graph',
  showDataTable: false,
  exportable: false,
  exportFileName: 'network-graph',
  animated: false
};

interface Point {
  x: number;
  y: number;
}

interface ActiveItem {
  x: number;
  y: number;
  text: string;
}

function roundCoordinate(value: number) {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function circularLayout(count: number, width: number, height: number): Point[] {
  const centerX = width / 2;
  const centerY = height / 2;
  const ringRadius = Math.max(1, Math.min(width, height) / 2 - PADDING);

  return Array.from({ length: count }, (_item, index) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / Math.max(1, count);

    return {
      x: roundCoordinate(centerX + Math.cos(angle) * ringRadius),
      y: roundCoordinate(centerY + Math.sin(angle) * ringRadius)
    };
  });
}

function forceLayout(
  nodes: NetworkGraphNode[],
  edges: NetworkGraphEdge[],
  width: number,
  height: number
): Point[] {
  const centerX = width / 2;
  const centerY = height / 2;
  const seedRadius = Math.min(width, height) * 0.3;
  const indexById = new Map(nodes.map((node, index) => [node.id, index]));
  const resolvedEdges = edges.flatMap((edge) => {
    const source = indexById.get(edge.source);
    const target = indexById.get(edge.target);

    if (source === undefined || target === undefined || source === target) {
      return [];
    }

    return [{ source, target }];
  });
  const area = Math.max(1, (width - PADDING * 2) * (height - PADDING * 2));
  const idealDistance = Math.sqrt(area / Math.max(1, nodes.length));
  let positions: Point[] = nodes.map((_node, index) => {
    const angle = (2 * Math.PI * index) / Math.max(1, nodes.length);

    return {
      x: centerX + Math.cos(angle) * seedRadius,
      y: centerY + Math.sin(angle) * seedRadius
    };
  });

  for (let iteration = 0; iteration < FORCE_ITERATIONS; iteration += 1) {
    const displacement = positions.map(() => ({ x: 0, y: 0 }));

    for (let first = 0; first < positions.length; first += 1) {
      for (let second = first + 1; second < positions.length; second += 1) {
        let dx = positions[first].x - positions[second].x;
        let dy = positions[first].y - positions[second].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.01) {
          dx = 0.01 * (first + 1);
          dy = 0.01 * (second + 1);
          distance = Math.sqrt(dx * dx + dy * dy);
        }

        const force = (idealDistance * idealDistance) / distance;
        const forceX = (dx / distance) * force;
        const forceY = (dy / distance) * force;

        displacement[first].x += forceX;
        displacement[first].y += forceY;
        displacement[second].x -= forceX;
        displacement[second].y -= forceY;
      }
    }

    for (let edgeIndex = 0; edgeIndex < resolvedEdges.length; edgeIndex += 1) {
      const edge = resolvedEdges[edgeIndex];
      const dx = positions[edge.target].x - positions[edge.source].x;
      const dy = positions[edge.target].y - positions[edge.source].y;
      const distance = Math.max(0.01, Math.sqrt(dx * dx + dy * dy));
      const force = (distance * distance) / idealDistance;
      const forceX = (dx / distance) * force;
      const forceY = (dy / distance) * force;

      displacement[edge.source].x += forceX;
      displacement[edge.source].y += forceY;
      displacement[edge.target].x -= forceX;
      displacement[edge.target].y -= forceY;
    }

    const temperature = Math.max(
      1,
      (Math.min(width, height) / 8) * (1 - iteration / FORCE_ITERATIONS)
    );

    positions = positions.map((position, index) => {
      const dx = displacement[index].x + (centerX - position.x) * 0.05;
      const dy = displacement[index].y + (centerY - position.y) * 0.05;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) {
        return position;
      }

      const limited = Math.min(distance, temperature);

      return {
        x: position.x + (dx / distance) * limited,
        y: position.y + (dy / distance) * limited
      };
    });
  }

  return positions.map((position) => ({
    x: roundCoordinate(clamp(position.x, PADDING, width - PADDING)),
    y: roundCoordinate(clamp(position.y, PADDING, height - PADDING))
  }));
}

const _NetworkGraph = forwardRef<HTMLDivElement, NetworkGraphProps>((props, ref) => {
  const {
    nodes,
    edges,
    width,
    height,
    layout,
    showLegend,
    ariaLabel,
    onNodeClick,
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
    name: 'network-graph',
    classNames,
    styles,
    unstyled
  });
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;

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

  if (nodes.length === 0) {
    return (
      <div
        ref={mergedRef}
        className={cx(classes.root, isAnimated && classes.animated, className)}
        data-animated={isAnimated ? 'true' : undefined}
      >
        <div className={cx(classes.empty)}>No data</div>
      </div>
    );
  }

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const validEdges = edges.filter(
    (edge) => nodeById.has(edge.source) && nodeById.has(edge.target) && edge.source !== edge.target
  );
  const positions =
    layout === 'force'
      ? forceLayout(nodes, edges, width, height)
      : circularLayout(nodes.length, width, height);
  const positionById = new Map(nodes.map((node, index) => [node.id, positions[index]]));
  const groups: string[] = [];

  nodes.forEach((node) => {
    if (node.group && !groups.includes(node.group)) {
      groups.push(node.group);
    }
  });

  const groupColor = new Map(
    groups.map((group, index) => [group, CHART_COLORS[index % CHART_COLORS.length]])
  );
  const getNodeColor = (node: NetworkGraphNode, index: number) =>
    node.color ??
    (node.group ? groupColor.get(node.group) : undefined) ??
    CHART_COLORS[index % CHART_COLORS.length];
  const getNodeRadius = (node: NetworkGraphNode) => node.radius ?? DEFAULT_NODE_RADIUS;
  const getNodeText = (node: NetworkGraphNode) =>
    `${node.label ?? node.id}${node.group ? ` (${node.group})` : ''}`;
  const getEdgeText = (edge: NetworkGraphEdge) => {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    const base = `${source?.label ?? edge.source} → ${target?.label ?? edge.target}`;

    return edge.label ? `${base}: ${edge.label}` : base;
  };
  const interactive = typeof onNodeClick === 'function';
  const legendSeries = groups.map((group) => ({
    name: group,
    color: groupColor.get(group) ?? CHART_COLORS[0],
    data: []
  }));

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
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={ariaLabel}
        data-network-layout={layout}
        onMouseLeave={() => setActiveItem(null)}
      >
        <title>{ariaLabel}</title>
        {validEdges.map((edge, index) => {
          const sourcePosition = positionById.get(edge.source);
          const targetPosition = positionById.get(edge.target);

          if (!sourcePosition || !targetPosition) {
            return null;
          }

          const text = getEdgeText(edge);
          const middleX = (sourcePosition.x + targetPosition.x) / 2;
          const middleY = (sourcePosition.y + targetPosition.y) / 2;
          const strokeWidth = 1 + Math.min(2, Math.max(0, edge.weight ?? 1) * 0.5);

          return (
            <g key={`edge-${edge.source}-${edge.target}-${index}`}>
              <line
                className={cx(classes.edge)}
                data-network-edge={`${edge.source}->${edge.target}`}
                data-network-weight={edge.weight ?? 1}
                x1={sourcePosition.x}
                y1={sourcePosition.y}
                x2={targetPosition.x}
                y2={targetPosition.y}
                strokeWidth={strokeWidth}
                role="img"
                tabIndex={0}
                aria-label={text}
                onMouseEnter={() => setActiveItem({ x: middleX, y: middleY, text })}
                onFocus={() => setActiveItem({ x: middleX, y: middleY, text })}
                onBlur={() => setActiveItem(null)}
              />
              {edge.label && (
                <text
                  className={cx(classes.edgeLabel)}
                  data-network-edge-label={`${edge.source}->${edge.target}`}
                  x={middleX}
                  y={middleY - 6}
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
        {nodes.map((node, index) => {
          const position = positions[index];
          const radius = getNodeRadius(node);
          const text = getNodeText(node);

          return (
            <g key={`node-${node.id}`}>
              <circle
                className={cx(classes.node)}
                data-network-node={node.id}
                data-network-group={node.group}
                data-network-x={position.x}
                data-network-y={position.y}
                cx={position.x}
                cy={position.y}
                r={radius}
                fill={getNodeColor(node, index)}
                role={interactive ? 'button' : 'img'}
                tabIndex={0}
                aria-label={text}
                onMouseEnter={() => setActiveItem({ x: position.x, y: position.y, text })}
                onFocus={() => setActiveItem({ x: position.x, y: position.y, text })}
                onBlur={() => setActiveItem(null)}
                onClick={() => onNodeClick?.(node)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onNodeClick?.(node);
                  }
                }}
              />
              <text
                className={cx(classes.nodeLabel)}
                data-network-node-label={node.id}
                x={position.x}
                y={position.y + radius + 12}
                textAnchor="middle"
              >
                {node.label ?? node.id}
              </text>
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
      {showLegend && groups.length > 0 && (
        <ChartLegend series={legendSeries} classes={classes} cx={cx} />
      )}
      {showDataTable && (
        <>
          <ChartDataTable
            caption={dataTableCaption}
            columns={['Source', 'Target', 'Weight']}
            rows={validEdges.map((edge) => [
              nodeById.get(edge.source)?.label ?? edge.source,
              nodeById.get(edge.target)?.label ?? edge.target,
              String(edge.weight ?? 1)
            ])}
            visuallyHidden={showDataTable === 'hidden'}
          />
          <ChartDataTable
            caption={dataTableCaption ? `${dataTableCaption} (nodes)` : 'Nodes'}
            columns={['Node', 'Group']}
            rows={nodes.map((node) => [node.label ?? node.id, node.group ?? '—'])}
            visuallyHidden={showDataTable === 'hidden'}
          />
        </>
      )}
    </div>
  );
});

_NetworkGraph.displayName = 'NetworkGraph';

export { _NetworkGraph as NetworkGraph };
