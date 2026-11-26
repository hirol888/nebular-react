import React, { forwardRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type DendrogramOrientation = 'top' | 'left' | 'right' | 'bottom';

export interface DendrogramNode {
  id?: string;
  label?: string;
  distance?: number;
  children?: DendrogramNode[];
}

export interface DendrogramLayoutOptions {
  orientation?: DendrogramOrientation;
  width?: number;
  height?: number;
}

export interface DendrogramLayoutNode {
  id: string;
  label?: string;
  distance: number;
  normalizedDistance: number;
  depth: number;
  isLeaf: boolean;
  parentId: string | null;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  labelAnchor: 'start' | 'middle' | 'end';
  source: DendrogramNode;
}

export interface DendrogramLayoutLink {
  id: string;
  parentId: string;
  childId: string;
  path: string;
}

export interface DendrogramLayout {
  nodes: DendrogramLayoutNode[];
  links: DendrogramLayoutLink[];
  width: number;
  height: number;
  maxDistance: number;
  orientation: DendrogramOrientation;
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
    fontFamily: 'var(--chart-text-font-family, inherit)'
  },

  svg: {
    display: 'block',
    width: '100%',
    height: 'auto',
    overflow: 'visible'
  },

  link: {
    fill: 'none',
    stroke: 'var(--dendrogram-color, var(--color-primary-500, #3366ff))',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    pointerEvents: 'none'
  },

  node: {
    fill: 'var(--dendrogram-color, var(--color-primary-500, #3366ff))',
    stroke: 'var(--dendrogram-node-stroke-color, var(--background-basic-color-1, #ffffff))',
    strokeWidth: 1.5,
    cursor: 'pointer',
    outline: 'none',
    transition: 'stroke-width 120ms ease',

    '&:focus-visible': {
      outline: 'none',
      stroke: 'var(--dendrogram-focus-color, var(--color-primary-500, #3366ff))',
      strokeWidth: 3
    }
  },

  label: {
    fill: 'var(--dendrogram-label-color, var(--text-basic-color, #222b45))',
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
    padding: 'var(--dendrogram-empty-padding, 1.5rem)',
    textAlign: 'center',
    color: 'var(--chart-empty-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.8125rem'
  }
}));

export type DendrogramStylesNames = Selectors<typeof useStyles>;

export interface DendrogramProps extends DefaultProps<DendrogramStylesNames> {
  data?: DendrogramNode;
  orientation?: DendrogramOrientation;
  width?: number;
  height?: number;
  showLabels?: boolean;
  color?: string;
  ariaLabel?: string;
  onNodeClick?(node: DendrogramNode): void;
}

const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 320;
const PADDING = 28;
const LABEL_OFFSET = 8;
const TOOLTIP_CHAR_WIDTH = 6;

const defaultProps: Partial<DendrogramProps> = {
  orientation: 'top',
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  showLabels: true,
  ariaLabel: 'Dendrogram'
};

interface TreeEntry {
  id: string;
  label?: string;
  distance: number;
  depth: number;
  parent: TreeEntry | null;
  source: DendrogramNode;
  children: TreeEntry[];
}

const round = (value: number): number => Math.round(value * 100) / 100;

const readDistance = (node: DendrogramNode): number =>
  typeof node.distance === 'number' && Number.isFinite(node.distance) && node.distance > 0
    ? node.distance
    : 0;

const isBlankNode = (node: DendrogramNode): boolean =>
  !node.children &&
  node.label == null &&
  node.id == null &&
  (node.distance === undefined || node.distance === null);

function buildEntry(
  node: DendrogramNode,
  depth: number,
  path: string,
  parent: TreeEntry | null
): TreeEntry {
  const entry: TreeEntry = {
    id: node.id ?? path,
    label: node.label,
    distance: readDistance(node),
    depth,
    parent,
    source: node,
    children: []
  };

  entry.children = (node.children ?? []).map((child, index) =>
    buildEntry(child, depth + 1, `${path}-${index}`, entry)
  );

  return entry;
}

function resolveSize(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

/**
 * Pure, deterministic dendrogram layout.
 *
 * Leaves are spread evenly along the category axis and the distance axis is
 * normalized by the largest `distance` in the tree. When no distance is
 * provided the depth is used instead, so the tree keeps its shape.
 * The root is placed on the side requested by `orientation` and the leaves
 * sit on the opposite side. Internal nodes are centered between their children
 * and connected with orthogonal elbow links.
 */
export function layoutDendrogram(
  data: DendrogramNode | undefined,
  options: DendrogramLayoutOptions = {}
): DendrogramLayout {
  const width = resolveSize(options.width, DEFAULT_WIDTH);
  const height = resolveSize(options.height, DEFAULT_HEIGHT);
  const orientation = options.orientation ?? 'top';

  if (!data || isBlankNode(data)) {
    return { nodes: [], links: [], width, height, maxDistance: 0, orientation };
  }

  const root = buildEntry(data, 0, 'root', null);
  const isVertical = orientation === 'top' || orientation === 'bottom';
  const plotWidth = Math.max(0, width - PADDING * 2);
  const plotHeight = Math.max(0, height - PADDING * 2);
  const categorySpan = isVertical ? plotWidth : plotHeight;
  const leaves: TreeEntry[] = [];
  let maxDistance = 0;
  let maxDepth = 0;

  const collect = (entry: TreeEntry) => {
    maxDistance = Math.max(maxDistance, entry.distance);
    maxDepth = Math.max(maxDepth, entry.depth);

    if (entry.children.length === 0) {
      leaves.push(entry);

      return;
    }

    entry.children.forEach(collect);
  };

  collect(root);

  const slot = leaves.length > 0 ? categorySpan / leaves.length : 0;
  const useDepth = maxDistance === 0;
  const normalizedOf = (entry: TreeEntry): number => {
    if (useDepth) {
      return maxDepth > 0 ? 1 - entry.depth / maxDepth : 0;
    }

    return Math.min(1, Math.max(0, entry.distance / maxDistance));
  };
  const distanceCoordinate = (normalized: number): number => {
    if (orientation === 'top') {
      return PADDING + (1 - normalized) * plotHeight;
    }

    if (orientation === 'bottom') {
      return PADDING + normalized * plotHeight;
    }

    if (orientation === 'left') {
      return PADDING + (1 - normalized) * plotWidth;
    }

    return PADDING + normalized * plotWidth;
  };

  const ordered: TreeEntry[] = [];
  const categories = new Map<TreeEntry, number>();
  let leafIndex = 0;

  const assignCategory = (entry: TreeEntry): number => {
    ordered.push(entry);

    let category: number;

    if (entry.children.length === 0) {
      category = PADDING + (leafIndex + 0.5) * slot;
      leafIndex += 1;
    } else {
      const childCategories = entry.children.map(assignCategory);
      category =
        childCategories.reduce((total, value) => total + value, 0) / childCategories.length;
    }

    categories.set(entry, category);

    return category;
  };

  assignCategory(root);

  const positionByEntry = new Map<TreeEntry, { x: number; y: number }>();
  const nodes = ordered.map((entry) => {
    const category = categories.get(entry) ?? 0;
    const normalizedDistance = normalizedOf(entry);
    const distancePosition = distanceCoordinate(normalizedDistance);
    const x = round(isVertical ? category : distancePosition);
    const y = round(isVertical ? distancePosition : category);
    const isLeaf = entry.children.length === 0;
    let labelX: number;
    let labelY: number;
    let labelAnchor: 'start' | 'middle' | 'end';

    if (isVertical) {
      if (isLeaf) {
        labelAnchor = 'middle';
        labelX = x;
        labelY = round(orientation === 'top' ? height - PADDING + 14 : PADDING - 12);
      } else {
        labelAnchor = 'start';
        labelX = round(x + LABEL_OFFSET);
        labelY = round(orientation === 'top' ? y - LABEL_OFFSET + 2 : y + 12);
      }
    } else if (isLeaf) {
      labelAnchor = orientation === 'left' ? 'start' : 'end';
      labelX = round(orientation === 'left' ? width - PADDING + LABEL_OFFSET - 2 : PADDING - 6);
      labelY = round(y + 3);
    } else {
      labelAnchor = 'middle';
      labelX = x;
      labelY = round(y - LABEL_OFFSET);
    }

    positionByEntry.set(entry, { x, y });

    return {
      id: entry.id,
      label: entry.label,
      distance: entry.distance,
      normalizedDistance,
      depth: entry.depth,
      isLeaf,
      parentId: entry.parent ? entry.parent.id : null,
      x,
      y,
      labelX,
      labelY,
      labelAnchor,
      source: entry.source
    } satisfies DendrogramLayoutNode;
  });
  const links = ordered.reduce<DendrogramLayoutLink[]>((result, entry) => {
    if (!entry.parent) {
      return result;
    }

    const parent = positionByEntry.get(entry.parent);
    const child = positionByEntry.get(entry);

    if (!parent || !child) {
      return result;
    }

    const path = isVertical
      ? `M ${parent.x} ${parent.y} L ${parent.x} ${child.y} L ${child.x} ${child.y}`
      : `M ${parent.x} ${parent.y} L ${child.x} ${parent.y} L ${child.x} ${child.y}`;

    result.push({
      id: `${entry.parent.id}->${entry.id}`,
      parentId: entry.parent.id,
      childId: entry.id,
      path
    });

    return result;
  }, []);

  return { nodes, links, width, height, maxDistance, orientation };
}

const formatDistance = (distance: number): string => String(round(distance));

const getNodeText = (node: DendrogramLayoutNode): string => {
  const parts: string[] = [];

  if (node.label != null && node.label !== '') {
    parts.push(node.label);
  }

  if (node.distance > 0) {
    parts.push(formatDistance(node.distance));
  }

  return parts.length > 0 ? parts.join(' · ') : node.id;
};

const getVisibleLabel = (node: DendrogramLayoutNode): string => {
  if (node.label != null && node.label !== '') {
    return node.label;
  }

  return node.isLeaf ? '' : formatDistance(node.distance);
};

const _Dendrogram = forwardRef<HTMLDivElement, DendrogramProps>((props, ref) => {
  const {
    data,
    orientation,
    width,
    height,
    showLabels,
    color,
    ariaLabel,
    onNodeClick,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'dendrogram',
    classNames,
    styles,
    unstyled
  });
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const layout = layoutDendrogram(data, { orientation, width, height });
  const interactive = typeof onNodeClick === 'function';

  if (layout.nodes.length === 0) {
    return (
      <div ref={ref} className={cx(classes.root, className)}>
        <div className={cx(classes.empty)}>No data</div>
      </div>
    );
  }

  const activeNode = activeNodeId
    ? (layout.nodes.find((node) => node.id === activeNodeId) ?? null)
    : null;
  const activeText = activeNode ? getNodeText(activeNode) : '';
  const tooltipWidth = Math.max(60, activeText.length * TOOLTIP_CHAR_WIDTH + 20);

  const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    const target = event.target as Element;
    const nodeElement = target.closest('[data-dendrogram-node-id]');

    if (!nodeElement) {
      return;
    }

    const node = layout.nodes.find(
      (item) => item.id === nodeElement.getAttribute('data-dendrogram-node-id')
    );

    if (!node) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      if (!interactive) {
        return;
      }

      event.preventDefault();
      onNodeClick?.(node.source);

      return;
    }

    if (
      event.key === 'ArrowRight' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowUp'
    ) {
      const elements = Array.from(
        event.currentTarget.querySelectorAll<SVGElement>('[data-dendrogram-node-id]')
      );
      const index = elements.indexOf(nodeElement as SVGElement);
      const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
      const next = index === -1 ? undefined : elements[index + (forward ? 1 : -1)];

      if (next) {
        event.preventDefault();
        next.focus();
      }
    }
  };

  const renderNode = (node: DendrogramLayoutNode) => {
    const visibleLabel = showLabels ? getVisibleLabel(node) : '';

    return (
      <g key={node.id}>
        <circle
          className={cx(classes.node)}
          cx={node.x}
          cy={node.y}
          r={node.isLeaf ? 3 : 4}
          fill={color}
          data-dendrogram-node-id={node.id}
          data-dendrogram-depth={node.depth}
          role={interactive ? 'button' : 'img'}
          tabIndex={0}
          aria-label={getNodeText(node)}
          onMouseEnter={() => setActiveNodeId(node.id)}
          onMouseLeave={() => setActiveNodeId(null)}
          onFocus={() => setActiveNodeId(node.id)}
          onBlur={() => setActiveNodeId(null)}
          onClick={() => onNodeClick?.(node.source)}
        />
        {visibleLabel !== '' && (
          <text
            className={cx(classes.label)}
            x={node.labelX}
            y={node.labelY}
            textAnchor={node.labelAnchor}
          >
            {visibleLabel}
          </text>
        )}
      </g>
    );
  };

  return (
    <div
      ref={ref}
      className={cx(classes.root, className)}
      data-orientation={layout.orientation}
      onMouseLeave={() => setActiveNodeId(null)}
    >
      <svg
        className={cx(classes.svg)}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="group"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        <title>{ariaLabel}</title>
        {layout.links.map((link) => (
          <path
            key={link.id}
            className={cx(classes.link)}
            d={link.path}
            stroke={color}
            data-dendrogram-link={link.id}
          />
        ))}
        {layout.nodes.map(renderNode)}
        {activeNode && activeText !== '' && (
          <g transform={`translate(${activeNode.x}, ${activeNode.y - 12})`} pointerEvents="none">
            <rect
              className={cx(classes.tooltipBox)}
              x={-tooltipWidth / 2}
              y={-30}
              width={tooltipWidth}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeText}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
});

_Dendrogram.displayName = 'Dendrogram';

export const Dendrogram = _Dendrogram;
