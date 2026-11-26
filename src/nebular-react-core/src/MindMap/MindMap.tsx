import React, { forwardRef, useId, useRef } from 'react';
import { useMergedRef, useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

const CONNECTOR_COLOR = 'var(--mind-map-connector-color, var(--border-basic-color-3, #e4e9f2))';
const GAP = 'var(--mind-map-gap, 1rem)';
const BRANCH = 'var(--mind-map-branch-length, 1.25rem)';
const FOCUS_OUTLINE = 'var(--mind-map-focus-color, var(--color-primary-500, #3366ff))';

const useStyles = createStyles(() => ({
  root: {
    width: '100%',
    overflow: 'auto',
    padding: 'var(--mind-map-padding, 1rem)',
    color: 'var(--mind-map-color, var(--text-basic-color, #222b45))',
    fontFamily: 'var(--mind-map-font-family, inherit)',

    '@media (max-width: 40em)': {
      padding: 'var(--mind-map-padding-mobile, 0.5rem)'
    }
  },

  canvas: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minWidth: 'min-content'
  },

  item: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,

    '&:focus': {
      outline: 'none'
    },

    '&:focus-visible [data-mind-map-card]': {
      outline: `2px solid ${FOCUS_OUTLINE}`,
      outlineOffset: '2px'
    }
  },

  itemRoot: {
    alignItems: 'center'
  },

  itemRight: {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: `calc(-1 * ${BRANCH})`,
      width: BRANCH,
      height: 1,
      backgroundColor: CONNECTOR_COLOR
    },

    '&::after': {
      content: '""',
      position: 'absolute',
      top: `calc(-1 * ${GAP} / 2)`,
      left: `calc(-1 * ${BRANCH})`,
      width: 1,
      height: `calc(100% + ${GAP})`,
      backgroundColor: CONNECTOR_COLOR
    },

    '&:first-of-type::after': {
      top: '50%',
      height: `calc(50% + ${GAP} / 2)`
    },

    '&:last-of-type::after': {
      top: `calc(-1 * ${GAP} / 2)`,
      height: `calc(50% + ${GAP} / 2)`
    },

    '&:only-of-type::after': {
      display: 'none'
    }
  },

  itemLeft: {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      right: `calc(-1 * ${BRANCH})`,
      width: BRANCH,
      height: 1,
      backgroundColor: CONNECTOR_COLOR
    },

    '&::after': {
      content: '""',
      position: 'absolute',
      top: `calc(-1 * ${GAP} / 2)`,
      right: `calc(-1 * ${BRANCH})`,
      width: 1,
      height: `calc(100% + ${GAP})`,
      backgroundColor: CONNECTOR_COLOR
    },

    '&:first-of-type::after': {
      top: '50%',
      height: `calc(50% + ${GAP} / 2)`
    },

    '&:last-of-type::after': {
      top: `calc(-1 * ${GAP} / 2)`,
      height: `calc(50% + ${GAP} / 2)`
    },

    '&:only-of-type::after': {
      display: 'none'
    }
  },

  itemBottom: {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: `calc(-1 * ${BRANCH})`,
      left: '50%',
      width: 1,
      height: BRANCH,
      backgroundColor: CONNECTOR_COLOR
    },

    '&::after': {
      content: '""',
      position: 'absolute',
      top: `calc(-1 * ${BRANCH})`,
      left: `calc(-1 * ${GAP} / 2)`,
      width: `calc(100% + ${GAP})`,
      height: 1,
      backgroundColor: CONNECTOR_COLOR
    },

    '&:first-of-type::after': {
      left: '50%',
      width: `calc(50% + ${GAP} / 2)`
    },

    '&:last-of-type::after': {
      width: `calc(50% + ${GAP} / 2)`
    },

    '&:only-of-type::after': {
      display: 'none'
    }
  },

  itemTop: {
    '&::before': {
      content: '""',
      position: 'absolute',
      bottom: `calc(-1 * ${BRANCH})`,
      left: '50%',
      width: 1,
      height: BRANCH,
      backgroundColor: CONNECTOR_COLOR
    },

    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: `calc(-1 * ${BRANCH})`,
      left: `calc(-1 * ${GAP} / 2)`,
      width: `calc(100% + ${GAP})`,
      height: 1,
      backgroundColor: CONNECTOR_COLOR
    },

    '&:first-of-type::after': {
      left: '50%',
      width: `calc(50% + ${GAP} / 2)`
    },

    '&:last-of-type::after': {
      width: `calc(50% + ${GAP} / 2)`
    },

    '&:only-of-type::after': {
      display: 'none'
    }
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  rowLeft: {
    flexDirection: 'row-reverse'
  },

  rowTop: {
    flexDirection: 'column-reverse'
  },

  rowVertical: {
    flexDirection: 'column'
  },

  branch: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center'
  },

  branchRight: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: GAP,
    marginLeft: BRANCH
  },

  branchLeft: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: GAP,
    marginRight: BRANCH
  },

  branchBottom: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: GAP,
    marginTop: BRANCH
  },

  branchTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: GAP,
    marginBottom: BRANCH
  },

  branchLeading: {
    order: -1
  },

  cardWrap: {
    position: 'relative',
    display: 'flex',
    flex: '0 0 auto'
  },

  card: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--mind-map-card-gap, 0.35rem)',
    minWidth: 'var(--mind-map-node-min-width, 6.5rem)',
    maxWidth: 'var(--mind-map-node-max-width, 13rem)',
    padding: 'var(--mind-map-node-padding, 0.4rem 0.65rem)',
    border:
      '1px solid var(--mind-map-node-border-color, var(--mind-map-node-accent, var(--border-basic-color-3, #e4e9f2)))',
    borderLeftWidth: 'var(--mind-map-node-accent-width, 3px)',
    borderLeftColor:
      'var(--mind-map-node-accent, var(--mind-map-node-border-color, var(--border-basic-color-3, #e4e9f2)))',
    borderRadius: 'var(--mind-map-node-border-radius, 0.5rem)',
    backgroundColor:
      'var(--mind-map-node-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--mind-map-node-shadow, 0 1px 2px rgba(0, 0, 0, 0.06))',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'left',
    transition: 'border-color 120ms ease-in-out, box-shadow 120ms ease-in-out',

    '&:hover': {
      borderColor: 'var(--mind-map-node-hover-border-color, var(--color-primary-300, #8fb3ff))'
    },

    '@media (max-width: 40em)': {
      minWidth: 'var(--mind-map-node-min-width-mobile, 5.5rem)',
      maxWidth: 'var(--mind-map-node-max-width-mobile, 9rem)',
      padding: 'var(--mind-map-node-padding-mobile, 0.3rem 0.5rem)'
    }
  },

  cardRoot: {
    minWidth: 'var(--mind-map-root-min-width, 8rem)',
    borderColor: 'var(--mind-map-root-border-color, var(--color-primary-500, #3366ff))',
    borderLeftColor: 'var(--mind-map-root-border-color, var(--color-primary-500, #3366ff))',
    backgroundColor: 'var(--mind-map-root-background-color, var(--color-primary-100, #e5edff))',
    fontWeight: 700
  },

  cardClickable: {
    cursor: 'pointer'
  },

  cardDisabled: {
    opacity: 0.55,
    cursor: 'not-allowed'
  },

  label: {
    minWidth: 0,
    overflow: 'hidden',
    fontSize: 'var(--mind-map-node-font-size, 0.8125rem)',
    lineHeight: 1.3,
    textOverflow: 'ellipsis'
  },

  toggle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: 'var(--mind-map-toggle-size, 1.25rem)',
    height: 'var(--mind-map-toggle-size, 1.25rem)',
    marginLeft: 'auto',
    padding: 0,
    border: 0,
    borderRadius: 'var(--mind-map-toggle-border-radius, 0.25rem)',
    background: 'transparent',
    color: 'var(--mind-map-toggle-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: 'var(--mind-map-toggle-hover-background-color, rgba(143, 155, 179, 0.16))'
    },

    '&:focus-visible': {
      outline: `2px solid ${FOCUS_OUTLINE}`,
      outlineOffset: '2px'
    }
  }
}));

export type MindMapStylesNames = Selectors<typeof useStyles>;

export type MindMapOrientation = 'horizontal' | 'vertical';

export interface MindMapNode {
  id: string;
  label: React.ReactNode;
  children?: MindMapNode[];
  color?: string;
  disabled?: boolean;
}

export interface MindMapProps
  extends DefaultProps<MindMapStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  root: MindMapNode;
  renderNode?(node: MindMapNode): React.ReactNode;
  onNodeClick?(node: MindMapNode): void;
  collapsible?: boolean;
  defaultExpandedIds?: string[];
  expandedIds?: string[];
  onExpandedChange?(ids: string[]): void;
  orientation?: MindMapOrientation;
  ariaLabel?: string;
}

const defaultProps: Partial<MindMapProps> = {
  collapsible: true,
  orientation: 'horizontal',
  ariaLabel: 'Mind map'
};

type MindMapSide = 'root' | 'left' | 'right' | 'top' | 'bottom';

const findNode = (node: MindMapNode, id: string): MindMapNode | null => {
  if (node.id === id) {
    return node;
  }

  for (const child of node.children ?? []) {
    const found = findNode(child, id);

    if (found) {
      return found;
    }
  }

  return null;
};

const getNodeName = (node: MindMapNode): string =>
  typeof node.label === 'string' ? node.label : node.id;

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    style={{
      transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
      transition: 'transform 120ms'
    }}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const _MindMap = forwardRef<HTMLDivElement, MindMapProps>((props, ref) => {
  const {
    root,
    renderNode,
    onNodeClick,
    collapsible,
    defaultExpandedIds,
    expandedIds,
    onExpandedChange,
    orientation,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'mind-map', classNames, styles, unstyled });
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(ref, rootRef);
  const generatedId = useId();
  const [expanded, setExpanded] = useUncontrolled<string[]>({
    value: expandedIds,
    defaultValue: defaultExpandedIds ?? [root.id],
    finalValue: [],
    onChange: onExpandedChange
  });

  const isHorizontal = orientation !== 'vertical';
  const clickable = typeof onNodeClick === 'function';

  const labelId = (node: MindMapNode) =>
    `${generatedId}-label-${node.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  const toggleExpanded = (id: string) => {
    setExpanded(expanded.includes(id) ? expanded.filter((item) => item !== id) : [...expanded, id]);
  };

  const handleNodeClick = (node: MindMapNode, event: React.MouseEvent<HTMLDivElement>) => {
    if (!clickable || node.disabled) {
      return;
    }

    // The collapse toggle lives inside the card; clicking it must not select the node.
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    onNodeClick?.(node);
  };

  const renderCard = (node: MindMapNode, isRoot: boolean) => {
    const hasChildren = !!node.children && node.children.length > 0;
    const nodeExpanded = hasChildren && (collapsible ? expanded.includes(node.id) : true);

    return (
      <div className={cx(classes.cardWrap)}>
        <div
          className={cx(
            classes.card,
            isRoot && classes.cardRoot,
            clickable && classes.cardClickable,
            node.disabled && classes.cardDisabled
          )}
          data-mind-map-card={node.id}
          onClick={(event) => handleNodeClick(node, event)}
        >
          <span id={labelId(node)} className={cx(classes.label)}>
            {typeof renderNode === 'function' ? renderNode(node) : node.label}
          </span>
          {hasChildren && collapsible && (
            <button
              type="button"
              className={cx(classes.toggle)}
              aria-expanded={nodeExpanded}
              aria-label={`${nodeExpanded ? 'Collapse' : 'Expand'} ${getNodeName(node)}`}
              onClick={(event) => {
                event.stopPropagation();
                toggleExpanded(node.id);
              }}
            >
              <ChevronIcon expanded={nodeExpanded} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const branchClass: Record<MindMapSide, string | null> = {
    root: null,
    left: classes.branchLeft,
    right: classes.branchRight,
    top: classes.branchTop,
    bottom: classes.branchBottom
  };

  const renderGroup = (
    nodes: MindMapNode[],
    depth: number,
    side: MindMapSide,
    leading: boolean
  ) => (
    <div
      role="group"
      className={cx(classes.branch, branchClass[side], leading && classes.branchLeading)}
      data-mind-map-side={side}
    >
      {nodes.map((child) => renderItem(child, depth, side))}
    </div>
  );

  const renderItem = (node: MindMapNode, depth: number, side: MindMapSide): React.ReactNode => {
    const children = node.children ?? [];
    const hasChildren = children.length > 0;
    const isRoot = depth === 0;
    const nodeExpanded = hasChildren && (collapsible ? expanded.includes(node.id) : true);

    let leadingGroup: React.ReactNode = null;
    let trailingGroup: React.ReactNode = null;

    if (hasChildren && nodeExpanded) {
      if (isRoot) {
        const midpoint = Math.ceil(children.length / 2);
        const leadingSide: MindMapSide = isHorizontal ? 'left' : 'top';
        const trailingSide: MindMapSide = isHorizontal ? 'right' : 'bottom';

        leadingGroup = renderGroup(children.slice(0, midpoint), depth + 1, leadingSide, true);
        trailingGroup = renderGroup(children.slice(midpoint), depth + 1, trailingSide, false);
      } else {
        trailingGroup = renderGroup(children, depth + 1, side, false);
      }
    }

    return (
      <div
        key={node.id}
        role="treeitem"
        aria-level={depth + 1}
        aria-expanded={hasChildren ? nodeExpanded : undefined}
        aria-selected={false}
        aria-disabled={node.disabled || undefined}
        aria-labelledby={labelId(node)}
        tabIndex={node.disabled ? -1 : 0}
        data-mind-map-node-id={node.id}
        data-mind-map-side={side}
        style={
          node.color ? ({ '--mind-map-node-accent': node.color } as React.CSSProperties) : undefined
        }
        className={cx(
          classes.item,
          isRoot && classes.itemRoot,
          side === 'left' && classes.itemLeft,
          side === 'right' && classes.itemRight,
          side === 'top' && classes.itemTop,
          side === 'bottom' && classes.itemBottom
        )}
      >
        <div
          className={cx(
            classes.row,
            side === 'left' && classes.rowLeft,
            side === 'top' && classes.rowTop,
            isRoot && !isHorizontal && classes.rowVertical
          )}
        >
          {renderCard(node, isRoot)}
          {leadingGroup}
          {trailingGroup}
        </div>
      </div>
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const itemElement = target.closest<HTMLElement>('[data-mind-map-node-id]');
    const nodeId = itemElement?.getAttribute('data-mind-map-node-id');
    const node = nodeId ? findNode(root, nodeId) : null;

    if (!node || !itemElement) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const items = Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>('[data-mind-map-node-id]') ?? []
      ).filter((element) => element.getAttribute('aria-disabled') !== 'true');
      const currentIndex = items.indexOf(itemElement);
      const nextItem =
        currentIndex === -1
          ? undefined
          : items[currentIndex + (event.key === 'ArrowDown' ? 1 : -1)];

      if (nextItem) {
        event.preventDefault();
        nextItem.focus();
      }

      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const hasChildren = !!node.children && node.children.length > 0;

      if (!collapsible || !hasChildren || node.disabled) {
        return;
      }

      const nodeExpanded = expanded.includes(node.id);

      if (event.key === 'ArrowRight' && !nodeExpanded) {
        event.preventDefault();
        setExpanded([...expanded, node.id]);
      }

      if (event.key === 'ArrowLeft' && nodeExpanded) {
        event.preventDefault();
        setExpanded(expanded.filter((id) => id !== node.id));
      }

      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      if (target.closest('button') || node.disabled || !clickable) {
        return;
      }

      event.preventDefault();
      onNodeClick?.(node);
    }
  };

  return (
    <div
      {...others}
      ref={mergedRef}
      role="tree"
      tabIndex={-1}
      aria-label={ariaLabel}
      aria-orientation={orientation}
      data-orientation={orientation}
      className={cx(classes.root, className)}
      onKeyDown={handleKeyDown}
    >
      <div className={cx(classes.canvas)}>{renderItem(root, 0, 'root')}</div>
    </div>
  );
});

_MindMap.displayName = 'MindMap';

export const MindMap = _MindMap;
