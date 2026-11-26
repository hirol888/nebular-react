import React, { forwardRef, useRef } from 'react';
import { useMergedRef, useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

const LINE_COLOR = 'var(--org-chart-line-color, var(--border-basic-color-3, #e4e9f2))';
const GAP = 'var(--org-chart-gap, 1.25rem)';
const BRANCH = 'var(--org-chart-branch-length, 1.5rem)';

const useStyles = createStyles(() => ({
  root: {
    width: '100%',
    overflowX: 'auto',
    padding: 'var(--org-chart-padding, 0.5rem)',
    fontFamily: 'var(--org-chart-font-family, inherit)',
    color: 'var(--org-chart-color, var(--text-basic-color, #222b45))',

    '@media (max-width: 40em)': {
      padding: 'var(--org-chart-padding-mobile, 0.25rem)'
    }
  },

  tree: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: GAP,
    margin: 0,
    padding: 0,
    listStyle: 'none',
    minWidth: 'min-content'
  },

  treeHorizontal: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },

  node: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    listStyle: 'none'
  },

  nodeHorizontal: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  children: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: GAP,
    margin: 0,
    padding: `${BRANCH} 0 0`,
    listStyle: 'none',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '50%',
      width: 1,
      height: BRANCH,
      backgroundColor: LINE_COLOR
    }
  },

  childrenHorizontal: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: `0 0 0 ${BRANCH}`,

    '&::before': {
      top: '50%',
      left: 0,
      width: BRANCH,
      height: 1
    }
  },

  child: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: BRANCH,
    listStyle: 'none',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: `calc(${GAP} / -2)`,
      width: `calc(100% + ${GAP})`,
      height: 1,
      backgroundColor: LINE_COLOR
    },

    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '50%',
      width: 1,
      height: BRANCH,
      backgroundColor: LINE_COLOR
    },

    '&:first-of-type::before': {
      left: '50%',
      width: `calc(50% + ${GAP} / 2)`
    },

    '&:last-of-type::before': {
      width: `calc(50% + ${GAP} / 2)`
    },

    '&:only-child::before': {
      display: 'none'
    }
  },

  childHorizontal: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: BRANCH,
    listStyle: 'none',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: `calc(${GAP} / -2)`,
      left: 0,
      width: 1,
      height: `calc(100% + ${GAP})`,
      backgroundColor: LINE_COLOR
    },

    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: 0,
      width: BRANCH,
      height: 1,
      backgroundColor: LINE_COLOR
    },

    '&:first-of-type::before': {
      top: '50%',
      height: `calc(50% + ${GAP} / 2)`
    },

    '&:last-of-type::before': {
      top: `calc(${GAP} / -2)`,
      height: `calc(50% + ${GAP} / 2)`
    },

    '&:only-child::before': {
      display: 'none'
    }
  },

  card: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--org-chart-card-gap, 0.5rem)',
    minWidth: 'var(--org-chart-card-min-width, 11rem)',
    maxWidth: 'var(--org-chart-card-max-width, 16rem)',
    padding: 'var(--org-chart-card-padding, 0.5rem 0.65rem)',
    border: '1px solid var(--org-chart-card-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--org-chart-card-border-radius, 0.5rem)',
    backgroundColor:
      'var(--org-chart-card-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--org-chart-card-shadow, 0 1px 2px rgba(0, 0, 0, 0.06))',
    transition: 'border-color 120ms ease-in-out, box-shadow 120ms ease-in-out',

    '&:hover': {
      borderColor: 'var(--org-chart-card-hover-border-color, var(--color-primary-300, #8fb3ff))'
    },

    '@media (max-width: 40em)': {
      minWidth: 'var(--org-chart-card-min-width-mobile, 9rem)',
      maxWidth: 'var(--org-chart-card-max-width-mobile, 12rem)',
      padding: 'var(--org-chart-card-padding-mobile, 0.4rem 0.5rem)'
    }
  },

  cardDisabled: {
    opacity: 0.6
  },

  cardButton: {
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 auto',
    gap: 'var(--org-chart-card-gap, 0.5rem)',
    minWidth: 0,
    padding: 0,
    border: 0,
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: 'var(--org-chart-card-border-radius, 0.5rem)',

    '&:disabled': {
      cursor: 'not-allowed'
    },

    '&:focus-visible': {
      outline: '2px solid var(--org-chart-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  cardContent: {
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 auto',
    gap: 'var(--org-chart-card-gap, 0.5rem)',
    minWidth: 0,
    borderRadius: 'var(--org-chart-card-border-radius, 0.5rem)',

    '&:focus-visible': {
      outline: '2px solid var(--org-chart-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  avatar: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: 'var(--org-chart-avatar-size, 2rem)',
    height: 'var(--org-chart-avatar-size, 2rem)',
    overflow: 'hidden',
    borderRadius: '999px',
    backgroundColor: 'var(--org-chart-avatar-background-color, rgba(51, 102, 255, 0.12))',
    color: 'var(--org-chart-avatar-color, var(--color-primary-600, #274bdb))',
    fontSize: 'var(--org-chart-avatar-font-size, 0.75rem)',
    fontWeight: 700
  },

  info: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    gap: '0.05rem'
  },

  title: {
    overflow: 'hidden',
    color: 'var(--org-chart-title-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--org-chart-title-font-size, 0.8125rem)',
    fontWeight: 600,
    lineHeight: 1.3,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  subtitle: {
    overflow: 'hidden',
    color: 'var(--org-chart-subtitle-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--org-chart-subtitle-font-size, 0.6875rem)',
    lineHeight: 1.3,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  toggle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: 'var(--org-chart-toggle-size, 1.5rem)',
    height: 'var(--org-chart-toggle-size, 1.5rem)',
    padding: 0,
    border: 0,
    borderRadius: 'var(--org-chart-toggle-border-radius, 0.25rem)',
    background: 'transparent',
    color: 'var(--org-chart-toggle-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: 'var(--org-chart-toggle-hover-background-color, rgba(143, 155, 179, 0.16))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--org-chart-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  empty: {
    padding: 'var(--org-chart-empty-padding, 1.5rem)',
    color: 'var(--org-chart-empty-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--org-chart-empty-font-size, 0.8125rem)',
    textAlign: 'center'
  }
}));

export type OrgChartStylesNames = Selectors<typeof useStyles>;

export type OrgChartOrientation = 'vertical' | 'horizontal';

export interface OrgNode {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  avatar?: React.ReactNode;
  children?: OrgNode[];
  disabled?: boolean;
}

export interface OrgChartProps
  extends DefaultProps<OrgChartStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  nodes: OrgNode[];
  renderNode?(node: OrgNode): React.ReactNode;
  onNodeClick?(node: OrgNode): void;
  collapsible?: boolean;
  defaultExpandedIds?: string[];
  expandedIds?: string[];
  onExpandedChange?(ids: string[]): void;
  orientation?: OrgChartOrientation;
  ariaLabel?: string;
  emptyState?: React.ReactNode;
}

const defaultProps: Partial<OrgChartProps> = {
  collapsible: true,
  defaultExpandedIds: [],
  orientation: 'vertical',
  ariaLabel: 'Org chart',
  emptyState: 'No people to display'
};

const getNodeLabel = (node: OrgNode): string =>
  typeof node.title === 'string' ? node.title : node.id;

const getNodeAriaLabel = (node: OrgNode): string | undefined => {
  if (typeof node.title !== 'string') {
    return undefined;
  }

  return typeof node.subtitle === 'string' ? `${node.title}, ${node.subtitle}` : node.title;
};

const findNode = (nodes: OrgNode[], id: string): OrgNode | null => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    if (node.children) {
      const found = findNode(node.children, id);

      if (found) {
        return found;
      }
    }
  }

  return null;
};

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
    style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 120ms' }}
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const _OrgChart = forwardRef<HTMLDivElement, OrgChartProps>((props, ref) => {
  const {
    nodes,
    renderNode,
    onNodeClick,
    collapsible,
    defaultExpandedIds,
    expandedIds,
    onExpandedChange,
    orientation,
    ariaLabel,
    emptyState,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'org-chart', classNames, styles, unstyled });
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(ref, rootRef);
  const [expanded, setExpanded] = useUncontrolled<string[]>({
    value: expandedIds,
    defaultValue: defaultExpandedIds,
    finalValue: [],
    onChange: onExpandedChange
  });

  const isHorizontal = orientation === 'horizontal';
  const clickable = typeof onNodeClick === 'function';

  const toggleExpanded = (id: string) => {
    setExpanded(expanded.includes(id) ? expanded.filter((item) => item !== id) : [...expanded, id]);
  };

  const renderCardBody = (node: OrgNode) => {
    if (typeof renderNode === 'function') {
      return renderNode(node);
    }

    return (
      <>
        {node.avatar != null && (
          <span className={cx(classes.avatar)} aria-hidden="true">
            {node.avatar}
          </span>
        )}
        <span className={cx(classes.info)}>
          <span className={cx(classes.title)}>{node.title}</span>
          {node.subtitle != null && <span className={cx(classes.subtitle)}>{node.subtitle}</span>}
        </span>
      </>
    );
  };

  const renderNodeItem = (node: OrgNode, depth: number) => {
    const hasChildren = !!node.children && node.children.length > 0;
    const nodeExpanded = hasChildren && (collapsible ? expanded.includes(node.id) : true);
    const showToggle = hasChildren && collapsible;
    const label = getNodeLabel(node);
    const connectorClass =
      depth > 0 ? (isHorizontal ? classes.childHorizontal : classes.child) : null;

    return (
      <li
        key={node.id}
        className={cx(classes.node, isHorizontal && classes.nodeHorizontal, connectorClass)}
        data-org-chart-node-id={node.id}
      >
        <div className={cx(classes.card, { [classes.cardDisabled]: node.disabled })}>
          {clickable ? (
            <button
              type="button"
              className={cx(classes.cardButton)}
              aria-label={getNodeAriaLabel(node)}
              data-org-chart-card={node.id}
              disabled={node.disabled}
              onClick={() => onNodeClick?.(node)}
            >
              {renderCardBody(node)}
            </button>
          ) : (
            // Static cards stay focusable so arrow-key navigation can reach every node.
            <div
              className={cx(classes.cardContent)}
              data-org-chart-card={node.id}
              tabIndex={node.disabled ? undefined : 0}
            >
              {renderCardBody(node)}
            </div>
          )}
          {showToggle && (
            <button
              type="button"
              className={cx(classes.toggle)}
              aria-expanded={nodeExpanded}
              aria-label={`${nodeExpanded ? 'Collapse' : 'Expand'} ${label}`}
              onClick={() => toggleExpanded(node.id)}
            >
              <ChevronIcon expanded={nodeExpanded} />
            </button>
          )}
        </div>
        {hasChildren && nodeExpanded && (
          <ul className={cx(classes.children, isHorizontal && classes.childrenHorizontal)}>
            {node.children?.map((child) => renderNodeItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const nodeElement = target.closest('[data-org-chart-node-id]');
    const nodeId = nodeElement?.getAttribute('data-org-chart-node-id');
    const node = nodeId ? findNode(nodes, nodeId) : null;

    if (!node) {
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const hasChildren = !!node.children && node.children.length > 0;

      if (!collapsible || !hasChildren) {
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

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const cards = Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>('[data-org-chart-card]') ?? []
      ).filter((element) => !element.hasAttribute('disabled'));
      const currentCard = target.closest('[data-org-chart-card]') as HTMLElement | null;
      const currentIndex = currentCard ? cards.indexOf(currentCard) : -1;

      if (currentIndex === -1) {
        return;
      }

      const nextCard = cards[currentIndex + (event.key === 'ArrowDown' ? 1 : -1)];

      if (nextCard) {
        event.preventDefault();
        nextCard.focus();
      }
    }
  };

  return (
    <div
      {...others}
      ref={mergedRef}
      role="group"
      aria-label={ariaLabel}
      data-orientation={orientation}
      className={cx(classes.root, className)}
      onKeyDown={handleKeyDown}
    >
      {nodes.length === 0 ? (
        <div className={cx(classes.empty)}>{emptyState}</div>
      ) : (
        <ul className={cx(classes.tree, isHorizontal && classes.treeHorizontal)}>
          {nodes.map((node) => renderNodeItem(node, 0))}
        </ul>
      )}
    </div>
  );
});

_OrgChart.displayName = 'OrgChart';

export const OrgChart = _OrgChart;
