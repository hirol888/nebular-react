import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { DefaultProps, Selectors, createStyles } from '@nebular-react/styles';

const DEFAULT_NODE_WIDTH = 140;
const DEFAULT_NODE_HEIGHT = 48;
const CANVAS_PADDING = 40;
const HISTORY_LIMIT = 50;
const EMPTY_EDGES: WorkflowEdge[] = [];
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

const clampZoom = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 1;
  }

  const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

  return Math.round(clamped * 100) / 100;
};

const snapToGrid = (value: number, size: number): number => {
  const step = size > 0 ? size : 1;

  return Math.round(value / step) * step;
};

const getNodeWidth = (node: WorkflowNode): number => node.width ?? DEFAULT_NODE_WIDTH;
const getNodeHeight = (node: WorkflowNode): number => node.height ?? DEFAULT_NODE_HEIGHT;
const getNodeName = (node: WorkflowNode): string =>
  typeof node.label === 'string' ? node.label : node.id;

const sameItems = <T,>(left: T[], right: T[]) =>
  left === right ||
  (left.length === right.length && left.every((item, index) => item === right[index]));

function nextEdgeId(edges: WorkflowEdge[], from: string, to: string) {
  const base = `${from}-${to}`;
  const used = new Set(edges.map((edge) => edge.id));
  let id = base;
  for (let suffix = 2; used.has(id); suffix += 1) {
    id = `${base}-${suffix}`;
  }
  return id;
}

const useStyles = createStyles(() => ({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--workflow-gap, 0.5rem)',
    width: '100%',
    fontFamily: 'var(--workflow-font-family, inherit)',
    color: 'var(--workflow-color, var(--text-basic-color, #222b45))'
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 'var(--workflow-toolbar-gap, 0.25rem)'
  },

  zoomButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 'var(--workflow-control-size, 1.75rem)',
    height: 'var(--workflow-control-size, 1.75rem)',
    padding: '0 0.375rem',
    border: '1px solid var(--workflow-control-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--workflow-control-border-radius, 0.25rem)',
    backgroundColor: 'var(--workflow-control-background-color, #ffffff)',
    color: 'var(--workflow-control-color, var(--text-basic-color, #222b45))',
    fontFamily: 'inherit',
    fontSize: 'var(--workflow-control-font-size, 0.75rem)',
    fontWeight: 600,
    lineHeight: 1,
    cursor: 'pointer',

    '&:hover:not(:disabled)': {
      borderColor: 'var(--workflow-control-hover-border-color, var(--color-primary-500, #3366ff))',
      color: 'var(--workflow-control-hover-color, var(--color-primary-500, #3366ff))'
    },

    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed'
    },

    '&:focus-visible': {
      outline: '2px solid var(--workflow-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    }
  },

  zoomValue: {
    minWidth: 'var(--workflow-zoom-value-width, 2.75rem)',
    color: 'var(--workflow-zoom-value-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--workflow-zoom-value-font-size, 0.75rem)',
    fontWeight: 600,
    textAlign: 'center'
  },

  viewport: {
    position: 'relative',
    overflow: 'auto',
    maxHeight: 'var(--workflow-max-height, 28rem)',
    border: '1px solid var(--workflow-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--workflow-border-radius, 0.5rem)',
    backgroundColor: 'var(--workflow-background-color, #ffffff)',

    '&:focus-visible': {
      outline: '2px solid var(--workflow-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    }
  },

  surface: {
    position: 'relative'
  },

  canvas: {
    position: 'relative',
    transformOrigin: '0 0',
    backgroundColor: 'var(--workflow-background-color, #ffffff)'
  },

  edges: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'visible',
    pointerEvents: 'none'
  },

  edge: {
    fill: 'none',
    stroke: 'var(--workflow-edge-color, var(--text-hint-color, #8f9bb3))',
    strokeWidth: 'var(--workflow-edge-width, 2)',
    strokeLinecap: 'round'
  },

  edgeLabelLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none'
  },

  edgeLabel: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    padding: 'var(--workflow-edge-label-padding, 0.0625rem 0.375rem)',
    border:
      '1px solid var(--workflow-edge-label-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--workflow-edge-label-border-radius, 0.75rem)',
    backgroundColor: 'var(--workflow-edge-label-background-color, #ffffff)',
    color: 'var(--workflow-edge-label-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--workflow-edge-label-font-size, 0.6875rem)',
    lineHeight: 1.4,
    whiteSpace: 'nowrap'
  },

  node: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    padding: 'var(--workflow-node-padding, 0.5rem 0.75rem)',
    border:
      'var(--workflow-node-border-width, 1px) solid var(--workflow-node-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--workflow-node-border-radius, 0.5rem)',
    backgroundColor: 'var(--workflow-node-background-color, #ffffff)',
    color: 'var(--workflow-node-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--workflow-node-font-size, 0.8125rem)',
    fontWeight: 600,
    lineHeight: 1.3,
    textAlign: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'none',
    transition: 'box-shadow 120ms ease, border-color 120ms ease',

    '&:hover': {
      borderColor: 'var(--workflow-node-hover-border-color, var(--color-primary-500, #3366ff))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--workflow-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  nodeSelected: {
    borderColor: 'var(--workflow-node-selected-border-color, var(--color-primary-500, #3366ff))',
    boxShadow: 'var(--workflow-node-selected-shadow, 0 0 0 2px rgba(51, 102, 255, 0.24))'
  },

  nodeDraggable: {
    cursor: 'grab',

    '&:active': {
      cursor: 'grabbing'
    }
  },

  nodeLabel: {
    display: 'block',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  nodeActions: {
    position: 'absolute',
    zIndex: 3,
    transform: 'translateY(0.25rem)'
  },

  connectButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: 'var(--workflow-connect-button-padding, 0.1875rem 0.5rem)',
    border:
      '1px solid var(--workflow-connect-button-border-color, var(--color-primary-500, #3366ff))',
    borderRadius: 'var(--workflow-connect-button-border-radius, 0.25rem)',
    backgroundColor: 'var(--workflow-connect-button-background-color, #ffffff)',
    color: 'var(--workflow-connect-button-color, var(--color-primary-500, #3366ff))',
    fontFamily: 'inherit',
    fontSize: 'var(--workflow-connect-button-font-size, 0.6875rem)',
    fontWeight: 600,
    lineHeight: 1.4,
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--workflow-connect-button-hover-background-color, rgba(51, 102, 255, 0.08))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--workflow-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    }
  },

  connectHint: {
    alignSelf: 'flex-start',
    color: 'var(--workflow-connect-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--workflow-connect-hint-font-size, 0.75rem)'
  },

  connectionError: {
    margin: 0,
    color: 'var(--workflow-error-color, var(--text-danger-color, #b00033))',
    fontSize: 'var(--workflow-connect-hint-font-size, 0.75rem)'
  },

  properties: {
    border: '1px solid var(--workflow-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--workflow-border-radius, 0.5rem)',
    padding: 'var(--workflow-properties-padding, 0.75rem)'
  },

  empty: {
    padding: 'var(--workflow-empty-padding, 1.5rem)',
    color: 'var(--workflow-empty-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--workflow-empty-font-size, 0.8125rem)',
    textAlign: 'center'
  }
}));

export type WorkflowDesignerStylesNames = Selectors<typeof useStyles>;

export interface WorkflowNode {
  id: string;
  label: React.ReactNode;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  label?: React.ReactNode;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowConnection extends WorkflowGraph {
  source: WorkflowNode;
  target: WorkflowNode;
}

export interface WorkflowNodeProperties {
  node: WorkflowNode;
  readOnly: boolean;
  onChange(changes: Partial<Omit<WorkflowNode, 'id'>>): void;
}

export interface WorkflowDesignerLabels {
  undo: string;
  redo: string;
  connect: string;
  cancelConnection: string;
  connectingFrom: (node: WorkflowNode) => string;
  connectionError: string;
  sameNodeError: string;
  nodeProperties: (node: WorkflowNode) => string;
}

export interface WorkflowDesignerProps extends DefaultProps<WorkflowDesignerStylesNames> {
  nodes: WorkflowNode[];
  edges?: WorkflowEdge[];
  selectedNodeId?: string | null;
  defaultSelectedNodeId?: string | null;
  onSelectNode?(id: string | null): void;
  onNodesChange?(nodes: WorkflowNode[]): void;
  editable?: boolean;
  gridSize?: number;
  showGrid?: boolean;
  zoom?: number;
  defaultZoom?: number;
  onZoomChange?(zoom: number): void;
  onConnect?(fromId: string, toId: string): void;
  /** Receives atomic graph updates in place of onConnect and onNodesChange when provided. */
  onGraphChange?(graph: WorkflowGraph): void;
  /** Enable undo and redo for updates managed by onGraphChange. */
  withHistory?: boolean;
  /** Return true to accept a connection, false or an error message to reject it. */
  validateConnection?(connection: WorkflowConnection): boolean | string;
  renderNode?(node: WorkflowNode): React.ReactNode;
  renderNodeProperties?(properties: WorkflowNodeProperties): React.ReactNode;
  labels?: Partial<WorkflowDesignerLabels>;
  ariaLabel?: string;
}

interface WorkflowHistory {
  current: WorkflowGraph;
  past: WorkflowGraph[];
  future: WorkflowGraph[];
}

interface WorkflowDragState {
  nodeId: string;
  pointerX: number;
  pointerY: number;
  originX: number;
  originY: number;
  position?: WorkflowPosition;
}

interface WorkflowPosition {
  x: number;
  y: number;
}

const _WorkflowDesigner = forwardRef<HTMLDivElement, WorkflowDesignerProps>((props, ref) => {
  const {
    nodes,
    edges = EMPTY_EDGES,
    selectedNodeId,
    defaultSelectedNodeId = null,
    onSelectNode,
    onNodesChange,
    editable = false,
    gridSize = 20,
    showGrid = true,
    zoom,
    defaultZoom = 1,
    onZoomChange,
    onConnect,
    onGraphChange,
    withHistory = false,
    validateConnection,
    renderNode,
    renderNodeProperties,
    labels,
    ariaLabel = 'Workflow designer',
    className,
    classNames,
    styles,
    unstyled,
    style
  } = props;
  const { classes, cx } = useStyles(null, {
    name: 'workflow-designer',
    classNames,
    styles,
    unstyled
  });
  const rawId = useId();
  const markerId = `workflow-arrow-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [uncontrolledSelectedId, setUncontrolledSelectedId] = useState<string | null>(
    defaultSelectedNodeId
  );
  const [uncontrolledZoom, setUncontrolledZoom] = useState<number>(() => clampZoom(defaultZoom));
  const [positionOverrides, setPositionOverrides] = useState<Record<string, WorkflowPosition>>({});
  const [connectFromId, setConnectFromId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [history, setHistory] = useState<WorkflowHistory>();
  const dragRef = useRef<WorkflowDragState | null>(null);
  const previousNodesRef = useRef(nodes);
  const graph = { nodes, edges };
  const historyEnabled = withHistory && !!onGraphChange;
  const activeHistory =
    historyEnabled &&
    history &&
    sameItems(history.current.nodes, nodes) &&
    sameItems(history.current.edges, edges)
      ? history
      : undefined;

  useEffect(() => {
    if (previousNodesRef.current === nodes) {
      return;
    }

    previousNodesRef.current = nodes;
    setPositionOverrides({});
    if (onGraphChange) {
      dragRef.current = null;
    }
  }, [nodes, onGraphChange]);

  const isSelectionControlled = selectedNodeId !== undefined;
  const selectedId = isSelectionControlled ? selectedNodeId : uncontrolledSelectedId;
  const isZoomControlled = zoom !== undefined;
  const zoomValue = clampZoom(isZoomControlled ? zoom : uncontrolledZoom);

  const displayedNodes = nodes.map<WorkflowNode>((node) => {
    const override = positionOverrides[node.id];

    return override === undefined ? node : { ...node, x: override.x, y: override.y };
  });
  const nodeById = new Map(displayedNodes.map((node) => [node.id, node]));
  const selectedNode = selectedId === null ? null : (nodeById.get(selectedId) ?? null);
  const connectFromNode = connectFromId === null ? null : (nodeById.get(connectFromId) ?? null);
  const connectionEnabled = !!(onGraphChange || onConnect);
  const propertiesReadOnly = !editable || !(onGraphChange || onNodesChange);

  const commitGraph = (next: WorkflowGraph) => {
    if (historyEnabled) {
      setHistory({
        current: next,
        past: [...(activeHistory?.past ?? []), graph].slice(-HISTORY_LIMIT),
        future: []
      });
    }
    onGraphChange?.(next);
  };

  const stepThroughHistory = (direction: 'undo' | 'redo') => {
    if (!activeHistory) {
      return;
    }
    const { past, future } = activeHistory;
    const next = direction === 'undo' ? past.at(-1) : future[0];
    if (!next) {
      return;
    }

    setHistory({
      current: next,
      past: direction === 'undo' ? past.slice(0, -1) : [...past, graph],
      future: direction === 'undo' ? [graph, ...future] : future.slice(1)
    });
    dragRef.current = null;
    setPositionOverrides({});
    setConnectFromId(null);
    setConnectionError(null);
    onGraphChange?.(next);
  };

  const changeProperties = (changes: Partial<Omit<WorkflowNode, 'id'>>) => {
    if (propertiesReadOnly || !selectedNode) {
      return;
    }
    const keys = Object.keys(changes) as (keyof Omit<WorkflowNode, 'id'>)[];
    if (keys.every((key) => selectedNode[key] === changes[key])) {
      return;
    }
    const { id } = selectedNode;
    const nextNodes = displayedNodes.map((node) =>
      node.id === id ? { ...node, ...changes, id } : node
    );
    if (onGraphChange) {
      commitGraph({ nodes: nextNodes, edges });
    } else {
      onNodesChange?.(nextNodes);
    }
  };

  const notifySelection = (id: string | null) => {
    if (!isSelectionControlled) {
      setUncontrolledSelectedId(id);
    }

    onSelectNode?.(id);
  };

  const activateNode = (id: string) => {
    if (connectFromNode && connectionEnabled) {
      const source = connectFromNode;
      const target = nodeById.get(id);
      if (!target) {
        setConnectFromId(null);
        setConnectionError(null);
        return;
      }
      if (source.id === id) {
        if (validateConnection || onGraphChange) {
          setConnectionError(labels?.sameNodeError ?? 'Choose a different node to connect.');
        } else {
          setConnectFromId(null);
          setConnectionError(null);
        }
        return;
      }

      const validation = validateConnection?.({ ...graph, source, target }) ?? true;
      if (validation !== true) {
        setConnectionError(
          (typeof validation === 'string' && validation) ||
            labels?.connectionError ||
            'This connection is not allowed.'
        );
        return;
      }

      setConnectionError(null);
      setConnectFromId(null);
      if (onGraphChange) {
        const edge = { id: nextEdgeId(edges, source.id, id), from: source.id, to: id };
        commitGraph({ nodes, edges: [...edges, edge] });
      } else {
        onConnect?.(source.id, id);
      }
      notifySelection(id);

      return;
    }

    notifySelection(id);
  };

  const applyZoom = (next: number) => {
    const clamped = clampZoom(next);

    if (clamped === zoomValue) {
      return;
    }

    if (!isZoomControlled) {
      setUncontrolledZoom(clamped);
    }

    onZoomChange?.(clamped);
  };

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>, node: WorkflowNode) => {
    if (!editable || event.button > 0) {
      return;
    }

    event.stopPropagation();
    dragRef.current = {
      nodeId: node.id,
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: node.x,
      originY: node.y
    };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is optional (jsdom and older browsers do not implement it).
    }
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (!editable || drag === null) {
      return;
    }

    const nextX = snapToGrid(drag.originX + (event.clientX - drag.pointerX) / zoomValue, gridSize);
    const nextY = snapToGrid(drag.originY + (event.clientY - drag.pointerY) / zoomValue, gridSize);
    const currentOverride = positionOverrides[drag.nodeId];
    const currentNode = nodeById.get(drag.nodeId);
    const currentX = currentOverride?.x ?? currentNode?.x;
    const currentY = currentOverride?.y ?? currentNode?.y;

    if (currentX === nextX && currentY === nextY) {
      return;
    }

    const nextOverrides: Record<string, WorkflowPosition> = {
      ...positionOverrides,
      [drag.nodeId]: { x: nextX, y: nextY }
    };

    drag.position = { x: nextX, y: nextY };
    setPositionOverrides(nextOverrides);

    if (!onGraphChange && onNodesChange) {
      onNodesChange(
        nodes.map<WorkflowNode>((node) => {
          if (node.id === drag.nodeId) {
            return { ...node, x: nextX, y: nextY };
          }

          const override = positionOverrides[node.id];

          return override === undefined ? node : { ...node, x: override.x, y: override.y };
        })
      );
    }
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;

    if (onGraphChange && drag) {
      setPositionOverrides({});
      if (event.type !== 'pointercancel' && drag.position) {
        const { x, y } = drag.position;
        if (x !== drag.originX || y !== drag.originY) {
          commitGraph({
            nodes: nodes.map((node) => (node.id === drag.nodeId ? { ...node, x, y } : node)),
            edges
          });
        }
      }
    }

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture is optional (jsdom and older browsers do not implement it).
    }
  };

  const handleNodeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, id: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    activateNode(id);
  };

  const cancelConnection = () => {
    setConnectFromId(null);
    setConnectionError(null);
  };

  const handleDesignerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) {
      return;
    }
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, select, [contenteditable="true"]')) {
      return;
    }
    if (event.key === 'Escape' && connectFromNode) {
      event.preventDefault();
      event.stopPropagation();
      cancelConnection();
      return;
    }
    if (historyEnabled && (event.ctrlKey || event.metaKey) && !event.altKey) {
      const key = event.key.toLowerCase();
      if (key === 'z' || key === 'y') {
        event.preventDefault();
        stepThroughHistory(key === 'y' || event.shiftKey ? 'redo' : 'undo');
      }
    }
  };

  const maxNodeX = displayedNodes.reduce(
    (max, node) => Math.max(max, node.x + getNodeWidth(node)),
    0
  );
  const maxNodeY = displayedNodes.reduce(
    (max, node) => Math.max(max, node.y + getNodeHeight(node)),
    0
  );
  const contentWidth = Math.max(240, maxNodeX) + CANVAS_PADDING;
  const contentHeight = Math.max(180, maxNodeY) + CANVAS_PADDING;

  const edgeShapes = edges.flatMap((edge) => {
    const fromNode = nodeById.get(edge.from);
    const toNode = nodeById.get(edge.to);

    if (fromNode === undefined || toNode === undefined) {
      return [];
    }

    const goesRight = toNode.x >= fromNode.x;
    const fromWidth = getNodeWidth(fromNode);
    const fromHeight = getNodeHeight(fromNode);
    const toWidth = getNodeWidth(toNode);
    const toHeight = getNodeHeight(toNode);
    const sourceX = goesRight ? fromNode.x + fromWidth : fromNode.x;
    const targetX = goesRight ? toNode.x : toNode.x + toWidth;
    const sourceY = fromNode.y + fromHeight / 2;
    const targetY = toNode.y + toHeight / 2;
    const bend = Math.max(40, Math.abs(targetX - sourceX) / 2);
    const sourceControlX = sourceX + (goesRight ? bend : -bend);
    const targetControlX = targetX + (goesRight ? -bend : bend);

    return [
      {
        edge,
        path: `M ${sourceX} ${sourceY} C ${sourceControlX} ${sourceY}, ${targetControlX} ${targetY}, ${targetX} ${targetY}`,
        labelX: (sourceX + targetX) / 2,
        labelY: (sourceY + targetY) / 2
      }
    ];
  });

  const gridBackgroundImage = showGrid
    ? 'linear-gradient(to right, var(--workflow-grid-color, rgba(143, 155, 179, 0.2)) 1px, transparent 1px), linear-gradient(to bottom, var(--workflow-grid-color, rgba(143, 155, 179, 0.2)) 1px, transparent 1px)'
    : 'none';

  return (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel}
      className={cx(classes.root, className)}
      style={style}
      data-workflow-designer=""
      onKeyDown={handleDesignerKeyDown}
    >
      <div role="group" aria-label="Workflow zoom controls" className={cx(classes.toolbar)}>
        {historyEnabled && (
          <>
            <button
              type="button"
              className={cx(classes.zoomButton)}
              disabled={!activeHistory?.past.length}
              onClick={() => stepThroughHistory('undo')}
            >
              {labels?.undo ?? 'Undo'}
            </button>
            <button
              type="button"
              className={cx(classes.zoomButton)}
              disabled={!activeHistory?.future.length}
              onClick={() => stepThroughHistory('redo')}
            >
              {labels?.redo ?? 'Redo'}
            </button>
          </>
        )}
        <button
          type="button"
          className={cx(classes.zoomButton)}
          aria-label="Zoom out"
          disabled={zoomValue <= MIN_ZOOM}
          onClick={() => applyZoom(zoomValue - ZOOM_STEP)}
        >
          <span aria-hidden="true">−</span>
        </button>
        <span className={cx(classes.zoomValue)} aria-live="polite" data-workflow-zoom="">
          {Math.round(zoomValue * 100)}%
        </span>
        <button
          type="button"
          className={cx(classes.zoomButton)}
          aria-label="Zoom in"
          disabled={zoomValue >= MAX_ZOOM}
          onClick={() => applyZoom(zoomValue + ZOOM_STEP)}
        >
          <span aria-hidden="true">+</span>
        </button>
        <button
          type="button"
          className={cx(classes.zoomButton)}
          aria-label="Reset zoom"
          onClick={() => applyZoom(1)}
        >
          Reset
        </button>
      </div>

      {connectFromNode !== null && (
        <span role="status" className={cx(classes.connectHint)} data-workflow-connect-hint="">
          {labels?.connectingFrom?.(connectFromNode) ??
            `Connecting from ${getNodeName(connectFromNode)}. Select a target node.`}
        </span>
      )}
      {connectionError && (
        <p role="alert" className={cx(classes.connectionError)}>
          {connectionError}
        </p>
      )}

      <div
        role="region"
        aria-label={`${ariaLabel} canvas`}
        className={cx(classes.viewport)}
        data-workflow-viewport=""
      >
        {displayedNodes.length === 0 ? (
          <div className={cx(classes.empty)} data-workflow-empty="">
            No workflow nodes
          </div>
        ) : (
          <div
            className={cx(classes.surface)}
            style={{ width: contentWidth * zoomValue, height: contentHeight * zoomValue }}
          >
            <div
              className={cx(classes.canvas)}
              data-workflow-canvas=""
              data-grid-size={gridSize}
              style={{
                width: contentWidth,
                height: contentHeight,
                transform: `scale(${zoomValue})`,
                backgroundImage: gridBackgroundImage,
                backgroundSize: `${gridSize}px ${gridSize}px`
              }}
            >
              <svg
                className={cx(classes.edges)}
                width={contentWidth}
                height={contentHeight}
                viewBox={`0 0 ${contentWidth} ${contentHeight}`}
                aria-hidden="true"
                focusable="false"
              >
                <defs>
                  <marker
                    id={markerId}
                    data-workflow-marker=""
                    viewBox="0 0 10 10"
                    refX={9}
                    refY={5}
                    markerWidth={6}
                    markerHeight={6}
                    orient="auto-start-reverse"
                  >
                    <path
                      d="M 0 0 L 10 5 L 0 10 z"
                      fill="var(--workflow-edge-color, var(--text-hint-color, #8f9bb3))"
                    />
                  </marker>
                </defs>
                {edgeShapes.map(({ edge, path }) => (
                  <path
                    key={edge.id}
                    className={cx(classes.edge)}
                    d={path}
                    markerEnd={`url(#${markerId})`}
                    data-workflow-edge={edge.id}
                    data-workflow-edge-from={edge.from}
                    data-workflow-edge-to={edge.to}
                  />
                ))}
              </svg>

              {edgeShapes.some(({ edge }) => edge.label != null) && (
                <div
                  className={cx(classes.edgeLabelLayer)}
                  style={{ width: contentWidth, height: contentHeight }}
                >
                  {edgeShapes.map(({ edge, labelX, labelY }) =>
                    edge.label == null ? null : (
                      <span
                        key={edge.id}
                        className={cx(classes.edgeLabel)}
                        data-workflow-edge-label={edge.id}
                        style={{ left: labelX, top: labelY }}
                      >
                        {edge.label}
                      </span>
                    )
                  )}
                </div>
              )}

              {displayedNodes.map((node) => {
                const isSelected = selectedId === node.id;

                return (
                  <div
                    key={node.id}
                    role="button"
                    tabIndex={0}
                    aria-label={getNodeName(node)}
                    aria-pressed={isSelected}
                    data-workflow-node={node.id}
                    data-selected={isSelected ? 'true' : undefined}
                    className={cx(
                      classes.node,
                      editable && classes.nodeDraggable,
                      isSelected && classes.nodeSelected
                    )}
                    style={{
                      left: node.x,
                      top: node.y,
                      width: getNodeWidth(node),
                      height: getNodeHeight(node),
                      borderColor: node.color
                    }}
                    onClick={() => activateNode(node.id)}
                    onKeyDown={(event) => handleNodeKeyDown(event, node.id)}
                    onPointerDown={editable ? (event) => beginDrag(event, node) : undefined}
                    onPointerMove={editable ? moveDrag : undefined}
                    onPointerUp={editable ? endDrag : undefined}
                    onPointerCancel={editable ? endDrag : undefined}
                  >
                    {renderNode ? (
                      renderNode(node)
                    ) : (
                      <span className={cx(classes.nodeLabel)}>{node.label}</span>
                    )}
                  </div>
                );
              })}

              {selectedNode !== null && connectionEnabled && (
                <div
                  className={cx(classes.nodeActions)}
                  data-workflow-node-actions={selectedNode.id}
                  style={{
                    left: selectedNode.x,
                    top: selectedNode.y + getNodeHeight(selectedNode)
                  }}
                >
                  {connectFromNode === null ? (
                    <button
                      type="button"
                      className={cx(classes.connectButton)}
                      onClick={() => {
                        setConnectionError(null);
                        setConnectFromId(selectedNode.id);
                      }}
                    >
                      {labels?.connect ?? 'Connect to…'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={cx(classes.connectButton)}
                      onClick={cancelConnection}
                    >
                      {labels?.cancelConnection ?? 'Cancel connection'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {selectedNode && renderNodeProperties && (
        <section
          className={cx(classes.properties)}
          aria-label={
            labels?.nodeProperties?.(selectedNode) ?? `${getNodeName(selectedNode)} properties`
          }
        >
          {renderNodeProperties({
            node: selectedNode,
            readOnly: propertiesReadOnly,
            onChange: changeProperties
          })}
        </section>
      )}
    </div>
  );
});

_WorkflowDesigner.displayName = 'WorkflowDesigner';

export const WorkflowDesigner = _WorkflowDesigner;
