import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Icon } from '../Icon';

export interface TreeNode {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: TreeNode[];
  /** Indicates that children will be loaded on demand by `loadData`. */
  hasChildren?: boolean;
}

export interface TreeProps
  extends DefaultProps<TreeStylesNames>, Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  data: TreeNode[];
  selectedValues?: string[];
  defaultSelectedValues?: string[];
  onSelectionChange?(values: string[]): void;
  expandedValues?: string[];
  defaultExpandedValues?: string[];
  onExpandedChange?(values: string[]): void;
  /** Shows checkboxes and enables cascade selection. */
  checkable?: boolean;
  checkedValues?: string[];
  defaultCheckedValues?: string[];
  onCheckedChange?(values: string[]): void;
  /** Disables parent/child cascade; only the clicked node changes. */
  checkStrictly?: boolean;
  /** Loads children when a node with `hasChildren` is expanded. */
  loadData?(node: TreeNode): Promise<TreeNode[]>;
  onLoadError?(node: TreeNode, error: unknown): void;
  loadingLabel?: string;
  multiSelect?: boolean;
  allowDeselect?: boolean;
  ariaLabel?: string;
}

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' }
});

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    fontFamily: 'inherit',
    fontSize: 'var(--tree-font-size, 0.875rem)'
  },

  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    outline: 'none'
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    minHeight: '1.75rem',
    padding: '0.2rem 0.35rem',
    borderRadius: 'var(--tree-item-border-radius, 0.25rem)',
    color: 'var(--tree-text-color, var(--text-basic-color, #222b45))',

    '&:hover': {
      backgroundColor:
        'var(--tree-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    }
  },

  selected: {
    backgroundColor:
      'var(--tree-item-selected-background-color, var(--background-basic-color-2, #f7f9fc))',
    color: 'var(--tree-item-selected-color, var(--color-primary-500, #3366ff))'
  },

  expander: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '1.25rem',
    height: '1.25rem',
    padding: 0,
    border: 0,
    borderRadius: '0.2rem',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  spacer: {
    width: '1.25rem',
    flex: '0 0 auto'
  },

  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--tree-icon-color, var(--text-hint-color, #8f9bb3))'
  },

  label: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  checkbox: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '0.95rem',
    height: '0.95rem',
    border: '1px solid var(--tree-checkbox-border-color, var(--border-basic-color-4, #c5cee0))',
    borderRadius: 'var(--tree-checkbox-border-radius, 0.2rem)',
    backgroundColor:
      'var(--tree-checkbox-background-color, var(--background-basic-color-1, #ffffff))',
    boxSizing: 'border-box'
  },

  checkboxChecked: {
    backgroundColor:
      'var(--tree-checkbox-checked-background-color, var(--color-primary-500, #3366ff))',
    borderColor: 'var(--tree-checkbox-checked-border-color, var(--color-primary-500, #3366ff))',

    '&::after': {
      content: '""',
      width: '0.25rem',
      height: '0.45rem',
      border: 'solid var(--tree-checkbox-mark-color, #ffffff)',
      borderWidth: '0 2px 2px 0',
      transform: 'rotate(45deg)',
      marginTop: '-0.1rem'
    }
  },

  checkboxIndeterminate: {
    backgroundColor:
      'var(--tree-checkbox-checked-background-color, var(--color-primary-500, #3366ff))',
    borderColor: 'var(--tree-checkbox-checked-border-color, var(--color-primary-500, #3366ff))',

    '&::after': {
      content: '""',
      width: '0.45rem',
      height: '2px',
      borderRadius: '1px',
      backgroundColor: 'var(--tree-checkbox-mark-color, #ffffff)'
    }
  },

  spinner: {
    display: 'inline-block',
    width: '0.85rem',
    height: '0.85rem',
    border: '2px solid currentColor',
    borderRightColor: 'transparent',
    borderRadius: '50%',
    animation: `${spin} 600ms linear infinite`
  },

  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem'
  }
}));

export type TreeStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<TreeProps> = {
  defaultSelectedValues: [],
  defaultExpandedValues: [],
  defaultCheckedValues: [],
  multiSelect: true,
  allowDeselect: true,
  checkable: false,
  checkStrictly: false,
  loadingLabel: 'Loading children',
  ariaLabel: 'Tree'
};

const _Tree = forwardRef<HTMLDivElement, TreeProps>((props, ref) => {
  const {
    data,
    selectedValues,
    defaultSelectedValues,
    onSelectionChange,
    expandedValues,
    defaultExpandedValues,
    onExpandedChange,
    checkable,
    checkedValues,
    defaultCheckedValues,
    onCheckedChange,
    checkStrictly,
    loadData,
    onLoadError,
    loadingLabel,
    multiSelect,
    allowDeselect,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'tree', classNames, styles, unstyled });
  const [selected, setSelected] = useUncontrolled<string[]>({
    value: selectedValues,
    defaultValue: defaultSelectedValues,
    finalValue: [],
    onChange: onSelectionChange
  });
  const [expanded, setExpanded] = useUncontrolled<string[]>({
    value: expandedValues,
    defaultValue: defaultExpandedValues,
    finalValue: [],
    onChange: onExpandedChange
  });
  const [checked, setChecked] = useUncontrolled<string[]>({
    value: checkedValues,
    defaultValue: defaultCheckedValues,
    finalValue: [],
    onChange: onCheckedChange
  });
  const [loadedChildren, setLoadedChildren] = useState<Record<string, TreeNode[]>>({});
  const [loadingValues, setLoadingValues] = useState<string[]>([]);
  const loadedValues = useRef<Set<string>>(new Set());

  const getChildren = (node: TreeNode): TreeNode[] =>
    node.children ?? loadedChildren[node.value] ?? [];

  const parents = useMemo(() => {
    const map = new Map<string, TreeNode>();
    const walk = (nodes: TreeNode[], parent?: TreeNode) => {
      nodes.forEach((node) => {
        if (parent) {
          map.set(node.value, parent);
        }
        walk(getChildren(node), node);
      });
    };

    walk(data);
    return map;
    // getChildren reads loadedChildren, which is the only mutable source here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loadedChildren]);

  const collectEnabled = (node: TreeNode): string[] => {
    const values: string[] = [];
    const visit = (current: TreeNode) => {
      if (!current.disabled) {
        values.push(current.value);
      }
      getChildren(current).forEach(visit);
    };

    visit(node);
    return values;
  };

  const loadChildren = async (node: TreeNode) => {
    if (typeof loadData !== 'function' || loadedValues.current.has(node.value)) {
      return;
    }

    loadedValues.current.add(node.value);
    setLoadingValues((current) =>
      current.includes(node.value) ? current : [...current, node.value]
    );

    try {
      const children = await loadData(node);
      setLoadedChildren((current) => ({ ...current, [node.value]: children ?? [] }));
    } catch (error) {
      loadedValues.current.delete(node.value);
      onLoadError?.(node, error);
    } finally {
      setLoadingValues((current) => current.filter((value) => value !== node.value));
    }
  };

  const toggleExpanded = (node: TreeNode) => {
    const isExpanded = expanded.includes(node.value);

    setExpanded(
      isExpanded ? expanded.filter((item) => item !== node.value) : [...expanded, node.value]
    );

    if (
      !isExpanded &&
      typeof loadData === 'function' &&
      node.hasChildren &&
      getChildren(node).length === 0 &&
      !loadedValues.current.has(node.value)
    ) {
      loadChildren(node);
    }
  };

  const toggleSelected = (node: TreeNode) => {
    if (node.disabled) {
      return;
    }

    if (multiSelect) {
      setSelected(
        selected.includes(node.value)
          ? allowDeselect
            ? selected.filter((item) => item !== node.value)
            : selected
          : [...selected, node.value]
      );
    } else {
      setSelected(selected.includes(node.value) && allowDeselect ? [] : [node.value]);
    }
  };

  const toggleChecked = (node: TreeNode) => {
    if (node.disabled) {
      return;
    }

    const targets = checkStrictly ? [node.value] : collectEnabled(node);
    const allChecked = targets.every((value) => checked.includes(value));
    const next = new Set(checked);

    targets.forEach((value) => {
      if (allChecked) {
        next.delete(value);
      } else {
        next.add(value);
      }
    });

    if (!checkStrictly) {
      let parent = parents.get(node.value);

      while (parent) {
        const currentParent = parent;

        if (!currentParent.disabled) {
          const descendants = collectEnabled(currentParent).filter(
            (value) => value !== currentParent.value
          );

          if (descendants.length > 0 && descendants.every((value) => next.has(value))) {
            next.add(currentParent.value);
          } else {
            next.delete(currentParent.value);
          }
        }

        parent = parents.get(currentParent.value);
      }
    }

    setChecked([...next]);
  };

  const isIndeterminate = (node: TreeNode): boolean =>
    checkable &&
    !checked.includes(node.value) &&
    getChildren(node).some((child) =>
      collectEnabled(child).some((value) => checked.includes(value))
    );

  const getLabelText = (node: TreeNode): string =>
    typeof node.label === 'string' ? node.label : node.value;

  const renderNode = (node: TreeNode, level: number): React.ReactNode => {
    const children = getChildren(node);
    const hasChildren = children.length > 0 || node.hasChildren === true;
    const isExpanded = expanded.includes(node.value);
    const isSelected = selected.includes(node.value);
    const isChecked = checked.includes(node.value);
    const indeterminate = isIndeterminate(node);
    const isLoading = loadingValues.includes(node.value);

    return (
      <div
        key={node.value}
        role="treeitem"
        aria-selected={checkable ? undefined : isSelected}
        aria-checked={checkable ? (isChecked ? true : indeterminate ? 'mixed' : false) : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-busy={isLoading || undefined}
        aria-disabled={node.disabled || undefined}
        tabIndex={0}
        className={cx(classes.item)}
        onClick={(event) => {
          event.stopPropagation();
          if (checkable) {
            toggleChecked(node);
          } else {
            toggleSelected(node);
          }
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) {
            return;
          }

          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (checkable) {
              toggleChecked(node);
            } else {
              toggleSelected(node);
            }
          } else if (event.key === 'ArrowRight' && hasChildren && !isExpanded) {
            event.preventDefault();
            toggleExpanded(node);
          } else if (event.key === 'ArrowLeft' && hasChildren && isExpanded) {
            event.preventDefault();
            toggleExpanded(node);
          }
        }}
      >
        <div
          className={cx(classes.row, {
            [classes.selected]: isSelected || (checkable && isChecked)
          })}
          style={{ marginLeft: level * 1.25 }}
        >
          {hasChildren ? (
            <button
              type="button"
              className={cx(classes.expander)}
              aria-label={
                isLoading
                  ? `${loadingLabel} ${getLabelText(node)}`
                  : `${isExpanded ? 'Collapse' : 'Expand'} ${getLabelText(node)}`
              }
              disabled={isLoading}
              onClick={(event) => {
                event.stopPropagation();
                toggleExpanded(node);
              }}
            >
              {isLoading ? (
                <span className={cx(classes.spinner)} aria-hidden="true" />
              ) : (
                <Icon
                  icon={isExpanded ? 'chevron-down-outline' : 'chevron-right-outline'}
                  pack="nebular-essentials"
                  aria-hidden="true"
                />
              )}
            </button>
          ) : (
            <span className={cx(classes.spacer)} />
          )}
          {checkable && (
            <span
              className={cx(classes.checkbox, {
                [classes.checkboxChecked]: isChecked,
                [classes.checkboxIndeterminate]: indeterminate
              })}
              aria-hidden="true"
            />
          )}
          {node.icon && <span className={cx(classes.icon)}>{node.icon}</span>}
          <span className={cx(classes.label)}>{node.label}</span>
        </div>
        {hasChildren && isExpanded && (
          <div role="group" className={cx(classes.group)}>
            {children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      {...others}
      ref={ref}
      role="tree"
      aria-label={ariaLabel}
      aria-multiselectable={checkable || multiSelect || undefined}
      className={cx(classes.root, className)}
    >
      {data.map((node) => renderNode(node, 0))}
    </div>
  );
});

_Tree.displayName = 'Tree';

export { _Tree as Tree };
