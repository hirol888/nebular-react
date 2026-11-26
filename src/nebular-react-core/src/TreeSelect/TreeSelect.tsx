import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import type { NebularMessageParams } from '@nebular-react/styles';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps,
  useNebularDir,
  useNebularLocale
} from '@nebular-react/styles';
import {
  useFlexibleConnectedPositionStrategy,
  useId,
  useMeasure,
  useOverlay,
  useOverlayClickOutside,
  useOverlayKeyboard,
  useRefEventListener
} from '@nebular-react/hooks';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { FormControl } from '../FormControl';
import { OptionalPortal } from '../OptionalPortal';

export interface TreeSelectNode {
  value: string;
  label: React.ReactNode;
  children?: TreeSelectNode[];
  disabled?: boolean;
  /** Indicates that children will be loaded on demand by `loadData`. */
  hasChildren?: boolean;
}

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' }
});

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'relative',
    width: '100%'
  },

  clearButton: {
    position: 'absolute',
    top: '50%',
    right: '0.5rem',
    transform: 'translateY(-50%)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.15rem',
    border: 0,
    background: 'transparent',
    color: 'var(--tree-select-clear-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',
    zIndex: 1,

    '&:focus-visible': {
      outline: '2px solid var(--tree-select-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  dropdown: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 'var(--tree-select-min-width, 14rem)',
    maxHeight: 'var(--tree-select-max-height, 20rem)',
    overflow: 'hidden',
    border:
      '1px solid var(--tree-select-dropdown-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--tree-select-dropdown-border-radius, 0.25rem)',
    backgroundColor:
      'var(--tree-select-dropdown-background-color, var(--background-basic-color-1, #fff))',
    boxShadow: 'var(--tree-select-dropdown-shadow, 0 4px 12px rgba(0, 0, 0, 0.12))'
  },

  searchContainer: {
    padding: '0.5rem',
    borderBottom:
      '1px solid var(--tree-select-search-border-color, var(--border-basic-color-3, #e4e9f2))'
  },

  searchInput: {
    width: '100%',
    padding: '0.4rem 0.5rem',
    border:
      '1px solid var(--tree-select-search-input-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--tree-select-search-input-border-radius, 0.25rem)',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    outline: 'none',

    '&:focus': {
      borderColor:
        'var(--tree-select-search-input-focus-border-color, var(--color-primary-500, #3366ff))'
    }
  },

  tree: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.25rem',
    overflowY: 'auto',
    fontFamily: 'inherit',
    fontSize: 'var(--tree-select-font-size, 0.875rem)'
  },

  item: {
    cursor: 'pointer',
    outline: 'none'
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    minHeight: '1.75rem',
    padding: '0.2rem 0.35rem',
    borderRadius: 'var(--tree-select-item-border-radius, 0.25rem)',
    color: 'var(--tree-select-text-color, var(--text-basic-color, #222b45))',

    '&:hover': {
      backgroundColor:
        'var(--tree-select-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    }
  },

  active: {
    backgroundColor:
      'var(--tree-select-item-active-background-color, var(--background-basic-color-2, #f7f9fc))',
    outline:
      '2px solid var(--tree-select-item-active-outline-color, var(--color-primary-500, #3366ff))',
    outlineOffset: '-2px'
  },

  selected: {
    backgroundColor:
      'var(--tree-select-item-selected-background-color, var(--background-basic-color-2, #f7f9fc))',
    color: 'var(--tree-select-item-selected-color, var(--color-primary-500, #3366ff))'
  },

  disabled: {
    opacity: 'var(--tree-select-item-disabled-opacity, 0.5)',
    cursor: 'not-allowed'
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
    background: 'transparent',
    color: 'var(--tree-select-icon-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',

    '&:disabled': {
      cursor: 'wait'
    }
  },

  expanderIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '1.25rem',
    height: '1.25rem',
    color: 'var(--tree-select-icon-color, var(--text-hint-color, #8f9bb3))'
  },

  spacer: {
    width: '1.25rem',
    flex: '0 0 auto'
  },

  checkbox: {
    flex: '0 0 auto',
    width: '0.95rem',
    height: '0.95rem',
    margin: 0,
    accentColor: 'var(--tree-select-checkbox-accent-color, var(--color-primary-500, #3366ff))',
    cursor: 'pointer',

    '&:disabled': {
      cursor: 'not-allowed'
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

  label: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  group: {
    display: 'flex',
    flexDirection: 'column'
  },

  dropdownStatus: {
    padding: '0.75rem 1rem',
    minWidth: 'var(--tree-select-min-width, 14rem)',
    color: 'var(--tree-select-status-color, inherit)',
    textAlign: 'center'
  }
}));

export type TreeSelectStylesNames = Selectors<typeof useStyles>;

/**
 * Visible text and accessible names rendered by `TreeSelect`.
 * Defaults come from the Nebular locale catalog; every entry can be overridden.
 */
export interface TreeSelectLabels {
  /** Placeholder of the search input shown inside the dropdown. */
  search: string;
  /** Accessible name of the expander button of a collapsed node. */
  expand(name: string): string;
  /** Accessible name of the expander button of an expanded node. */
  collapse(name: string): string;
  /** Accessible name of the expander button while children are loading. */
  loadingChildren(name: string): string;
  /** Visible message shown when the filter matches no nodes. */
  empty: string;
  /** Placeholder used when the `placeholder` prop is not provided. */
  placeholder: string;
}

export interface TreeSelectProps
  extends
    DefaultProps<TreeSelectStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  data: TreeSelectNode[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?(value: string | null): void;
  /** Shows checkboxes and enables multi-selection with cascade behavior. */
  checkable?: boolean;
  checkedValues?: string[];
  defaultCheckedValues?: string[];
  onCheckedChange?(values: string[]): void;
  /** Disables parent/child cascade; only the toggled node changes. */
  checkStrictly?: boolean;
  /** Loads children when a node with `hasChildren` is expanded. */
  loadData?(node: TreeSelectNode): Promise<TreeSelectNode[]>;
  onLoadError?(node: TreeSelectNode, error: unknown): void;
  loadingLabel?: string;
  placeholder?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  withAsterisk?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  expandedValues?: string[];
  defaultExpandedValues?: string[];
  onExpandedChange?(values: string[]): void;
  ariaLabel?: string;
  nothingFoundMessage?: string;
  /** Overrides the visible text and accessible names rendered by the component. */
  labels?: Partial<TreeSelectLabels>;
}

interface VisibleTreeNode {
  node: TreeSelectNode;
  level: number;
  parentValue: string | null;
}

interface TreeSelectCheckboxProps {
  checked: boolean;
  indeterminate: boolean;
  disabled?: boolean;
  className?: string;
  label: string;
  onChange(): void;
}

const TreeSelectCheckbox = ({
  checked,
  indeterminate,
  disabled,
  className,
  label,
  onChange
}: TreeSelectCheckboxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={inputRef}
      type="checkbox"
      className={className}
      checked={checked}
      disabled={disabled}
      tabIndex={-1}
      aria-label={label}
      onClick={(event) => event.stopPropagation()}
      onChange={() => onChange()}
    />
  );
};

const defaultProps: Partial<TreeSelectProps> = {
  clearable: false,
  disabled: false,
  searchable: false,
  required: false,
  withAsterisk: false,
  defaultExpandedValues: [],
  defaultCheckedValues: [],
  checkable: false,
  checkStrictly: false
};

type TreeSelectTranslate = (key: string, fallback: string, params?: NebularMessageParams) => string;

const createTreeSelectLabels = (t: TreeSelectTranslate): TreeSelectLabels => ({
  search: t('treeSelect.search', 'Search…'),
  expand: (name) => t('treeSelect.expand', 'Expand {name}', { name }),
  collapse: (name) => t('treeSelect.collapse', 'Collapse {name}', { name }),
  loadingChildren: (name) => t('treeSelect.loading', 'Loading children of {name}', { name }),
  empty: t('treeSelect.noOptions', 'No options'),
  placeholder: t('treeSelect.placeholder', 'Select an item')
});

const getNodeLabelText = (node: TreeSelectNode): string =>
  typeof node.label === 'string' || typeof node.label === 'number'
    ? String(node.label)
    : node.value;

const getNodeSearchText = (node: TreeSelectNode): string => getNodeLabelText(node);

const resolveNodes = (
  nodes: TreeSelectNode[],
  loadedChildren: Record<string, TreeSelectNode[]>
): TreeSelectNode[] =>
  nodes.map((node) => {
    const declaredChildren = node.children ?? [];
    const children =
      declaredChildren.length > 0 ? declaredChildren : (loadedChildren[node.value] ?? []);

    return children.length > 0
      ? { ...node, children: resolveNodes(children, loadedChildren) }
      : node;
  });

const filterNodes = (nodes: TreeSelectNode[], query: string): TreeSelectNode[] =>
  nodes.reduce<TreeSelectNode[]>((acc, node) => {
    const children = node.children ? filterNodes(node.children, query) : undefined;
    const matches = getNodeSearchText(node).toLowerCase().includes(query);

    if (matches) {
      acc.push(node);
    } else if (children && children.length > 0) {
      acc.push({ ...node, children });
    }

    return acc;
  }, []);

const getAdjacentEnabledIndex = (nodes: VisibleTreeNode[], from: number, step: 1 | -1): number => {
  if (nodes.length === 0) {
    return -1;
  }

  let index = from < 0 ? (step > 0 ? 0 : nodes.length - 1) : from + step;

  while (index >= 0 && index < nodes.length) {
    if (!nodes[index].node.disabled) {
      return index;
    }

    index += step;
  }

  return from >= 0 && from < nodes.length && !nodes[from].node.disabled ? from : -1;
};

const getBoundaryEnabledIndex = (nodes: VisibleTreeNode[], fromEnd: boolean): number => {
  for (let index = 0; index < nodes.length; index += 1) {
    const targetIndex = fromEnd ? nodes.length - 1 - index : index;

    if (!nodes[targetIndex].node.disabled) {
      return targetIndex;
    }
  }

  return -1;
};

const canExpandNode = (node: TreeSelectNode): boolean =>
  (node.children?.length ?? 0) > 0 || node.hasChildren === true;

const collectEnabledValues = (node: TreeSelectNode): string[] => {
  const values: string[] = [];
  const visit = (current: TreeSelectNode) => {
    if (!current.disabled) {
      values.push(current.value);
    }

    (current.children ?? []).forEach(visit);
  };

  visit(node);
  return values;
};

const _TreeSelect = forwardRef<HTMLDivElement, TreeSelectProps>((props, ref) => {
  const {
    data,
    value,
    defaultValue,
    onChange,
    checkable,
    checkedValues,
    defaultCheckedValues,
    onCheckedChange,
    checkStrictly,
    loadData,
    onLoadError,
    loadingLabel,
    placeholder,
    label,
    description,
    error,
    required,
    withAsterisk,
    clearable,
    disabled,
    searchable,
    expandedValues,
    defaultExpandedValues,
    onExpandedChange,
    ariaLabel,
    nothingFoundMessage,
    labels,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { t } = useNebularLocale();
  const resolvedLabels: TreeSelectLabels = { ...createTreeSelectLabels(t), ...labels };
  const resolvedPlaceholder = placeholder ?? resolvedLabels.placeholder;
  const { classes, cx } = useStyles(null, { name: 'tree-select', classNames, styles, unstyled });
  const uuid = useId();
  const dir = useNebularDir();

  const [selectedValue, setSelectedValue] = useUncontrolled<string | null>({
    value,
    defaultValue: defaultValue ?? null,
    finalValue: null,
    onChange
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

  const [loadedChildren, setLoadedChildren] = useState<Record<string, TreeSelectNode[]>>({});
  const [loadingValues, setLoadingValues] = useState<string[]>([]);
  const loadedValues = useRef<Set<string>>(new Set());

  const [opened, setOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const triggerRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [wrapperRef, { width: wrapperWidth }] = useMeasure<HTMLDivElement>();

  const resolvedData = useMemo(() => resolveNodes(data, loadedChildren), [data, loadedChildren]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, TreeSelectNode>();
    const walk = (nodes: TreeSelectNode[]) => {
      nodes.forEach((node) => {
        map.set(node.value, node);
        walk(node.children ?? []);
      });
    };

    walk(resolvedData);
    return map;
  }, [resolvedData]);

  const parents = useMemo(() => {
    const map = new Map<string, TreeSelectNode>();
    const walk = (nodes: TreeSelectNode[], parent?: TreeSelectNode) => {
      nodes.forEach((node) => {
        if (parent) {
          map.set(node.value, parent);
        }

        walk(node.children ?? [], node);
      });
    };

    walk(resolvedData);
    return map;
  }, [resolvedData]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const filteredData = useMemo(
    () => (isSearching ? filterNodes(resolvedData, normalizedQuery) : resolvedData),
    [isSearching, normalizedQuery, resolvedData]
  );

  const selectedNode = selectedValue === null ? null : (nodeMap.get(selectedValue) ?? null);

  const visibleNodes = useMemo(() => {
    const result: VisibleTreeNode[] = [];

    const walk = (nodes: TreeSelectNode[], level: number, parentValue: string | null) => {
      nodes.forEach((node) => {
        result.push({ node, level, parentValue });

        if (canExpandNode(node) && (isSearching || expanded.includes(node.value))) {
          walk(node.children ?? [], level + 1, node.value);
        }
      });
    };

    walk(filteredData, 0, null);

    return result;
  }, [expanded, filteredData, isSearching]);

  const hide = () => {
    setOpened(false);
    setSearchQuery('');
    setActiveIndex(-1);
  };

  const show = () => {
    setOpened(true);
    setActiveIndex(-1);
  };

  const closeAndFocus = () => {
    hide();
    triggerRef.current?.focus();
  };

  const loadChildren = async (node: TreeSelectNode) => {
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
    } catch (loadError) {
      loadedValues.current.delete(node.value);
      onLoadError?.(node, loadError);
    } finally {
      setLoadingValues((current) => current.filter((item) => item !== node.value));
    }
  };

  const toggleExpanded = (node: TreeSelectNode) => {
    const isExpanded = expanded.includes(node.value);

    setExpanded(
      isExpanded ? expanded.filter((item) => item !== node.value) : [...expanded, node.value]
    );

    if (
      !isExpanded &&
      typeof loadData === 'function' &&
      node.hasChildren === true &&
      (node.children?.length ?? 0) === 0
    ) {
      loadChildren(node);
    }
  };

  const toggleChecked = (node: TreeSelectNode) => {
    if (node.disabled) {
      return;
    }

    const targets = checkStrictly ? [node.value] : collectEnabledValues(node);
    const allChecked = targets.every((item) => checked.includes(item));
    const next = new Set(checked);

    targets.forEach((item) => {
      if (allChecked) {
        next.delete(item);
      } else {
        next.add(item);
      }
    });

    if (!checkStrictly) {
      let parent = parents.get(node.value);

      while (parent) {
        const currentParent = parent;

        if (!currentParent.disabled) {
          const descendants = collectEnabledValues(currentParent).filter(
            (item) => item !== currentParent.value
          );

          if (descendants.length > 0 && descendants.every((item) => next.has(item))) {
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

  const hasCheckedDescendant = (node: TreeSelectNode): boolean =>
    (node.children ?? []).some(
      (child) => checked.includes(child.value) || hasCheckedDescendant(child)
    );

  const isIndeterminate = (node: TreeSelectNode): boolean =>
    checkable && !checked.includes(node.value) && hasCheckedDescendant(node);

  const selectNode = (node: TreeSelectNode) => {
    if (node.disabled || canExpandNode(node)) {
      return;
    }

    setSelectedValue(node.value);
    closeAndFocus();
  };

  const { apply, paneRef, boundingBoxRef } = useFlexibleConnectedPositionStrategy(
    'bottom',
    'vertical',
    triggerRef.current,
    dir,
    8
  );

  useOverlay({
    apply,
    paneRef,
    paneWrapperRef: boundingBoxRef,
    opened
  });
  useOverlayClickOutside([triggerRef, paneRef], hide);

  useEffect(() => {
    if (activeIndex >= visibleNodes.length) {
      setActiveIndex(visibleNodes.length > 0 ? 0 : -1);
    }
  }, [activeIndex, visibleNodes.length]);

  useEffect(() => {
    if (opened && searchable) {
      const timeout = setTimeout(() => searchInputRef.current?.focus(), 0);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [opened, searchable]);

  const activateNode = (event: KeyboardEvent, index: number) => {
    const item = visibleNodes[index];

    if (!item || item.node.disabled) {
      return;
    }

    if (checkable) {
      event.preventDefault();
      toggleChecked(item.node);
      return;
    }

    if (canExpandNode(item.node)) {
      if (!isSearching) {
        toggleExpanded(item.node);
      }
    } else {
      event.preventDefault();
      selectNode(item.node);
    }
  };

  const keydownHandler = useRefEventListener((event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    const trigger = triggerRef.current;
    const pane = paneRef.current;

    if (!target || (!trigger?.contains(target) && !pane?.contains(target))) {
      return;
    }

    const isSearchInput = target.getAttribute('data-nebular-tree-select-search') === 'true';
    const navigationKeys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];

    if (isSearchInput && !navigationKeys.includes(event.key) && event.key !== 'Escape') {
      if (event.key === 'Enter') {
        event.preventDefault();
        activateNode(event, activeIndex);
      }

      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closeAndFocus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((current) => getAdjacentEnabledIndex(visibleNodes, current, 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((current) => getAdjacentEnabledIndex(visibleNodes, current, -1));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(getBoundaryEnabledIndex(visibleNodes, false));
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(getBoundaryEnabledIndex(visibleNodes, true));
        break;
      case 'ArrowRight': {
        event.preventDefault();
        const current = visibleNodes[activeIndex];

        if (!current || !canExpandNode(current.node)) {
          break;
        }

        if (!isSearching && !expanded.includes(current.node.value)) {
          toggleExpanded(current.node);
        } else {
          setActiveIndex(getAdjacentEnabledIndex(visibleNodes, activeIndex, 1));
        }
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        const current = visibleNodes[activeIndex];

        if (!current) {
          break;
        }

        if (canExpandNode(current.node) && !isSearching && expanded.includes(current.node.value)) {
          toggleExpanded(current.node);
        } else if (current.parentValue) {
          const parentIndex = visibleNodes.findIndex(
            (item) => item.node.value === current.parentValue
          );

          if (parentIndex >= 0) {
            setActiveIndex(parentIndex);
          }
        }
        break;
      }
      case 'Enter':
      case ' ':
      case 'Spacebar':
        event.preventDefault();
        activateNode(event, activeIndex);
        break;
      default:
        break;
    }
  });

  useOverlayKeyboard(keydownHandler, opened);

  const triggerKeydownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || opened) {
      return;
    }

    if (['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Spacebar'].includes(event.key)) {
      event.preventDefault();
      show();
    }
  };

  const triggerClickHandler = () => {
    if (disabled) {
      return;
    }

    if (opened) {
      hide();
    } else {
      show();
    }
  };

  const clearSelection = () => {
    if (checkable) {
      setChecked([]);
    } else {
      setSelectedValue(null);
    }

    triggerRef.current?.focus();
  };

  const selectedLabel =
    selectedNode !== null
      ? typeof selectedNode.label === 'string' || typeof selectedNode.label === 'number'
        ? String(selectedNode.label)
        : (selectedValue ?? '')
      : (selectedValue ?? '');

  const checkedLabels = checked.map((item) => {
    const node = nodeMap.get(item);

    return node ? getNodeLabelText(node) : item;
  });

  const checkedSummary =
    checkedLabels.length === 0
      ? ''
      : checkedLabels.length <= 2
        ? checkedLabels.join(', ')
        : `${checkedLabels.length} selected`;

  const inputValue = checkable ? checkedSummary : selectedLabel;
  const hasValue = checkable ? checked.length > 0 : selectedValue !== null;

  const inputAriaLabel = ariaLabel ?? (label ? undefined : resolvedPlaceholder);
  const treeAriaLabel =
    ariaLabel ?? (typeof label === 'string' ? `${label} options` : 'Tree options');
  const popupId = `${uuid}-tree-select-popup`;
  const activeNodeId =
    opened && activeIndex >= 0 && visibleNodes[activeIndex]
      ? `${uuid}-tree-node-${visibleNodes[activeIndex].node.value.replace(/[^a-zA-Z0-9_-]/g, '-')}`
      : undefined;

  const handleNodeClick = (event: React.MouseEvent<HTMLDivElement>, node: TreeSelectNode) => {
    event.stopPropagation();

    if (node.disabled) {
      return;
    }

    if (checkable) {
      toggleChecked(node);
      return;
    }

    if (canExpandNode(node)) {
      if (!isSearching) {
        toggleExpanded(node);
      }

      return;
    }

    selectNode(node);
  };

  const getNodeId = (nodeValue: string) =>
    `${uuid}-tree-node-${nodeValue.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  const renderNodes = (nodes: TreeSelectNode[], level: number): React.ReactNode =>
    nodes.map((node) => {
      const nodeCanExpand = canExpandNode(node);
      const nodeExpanded = isSearching || expanded.includes(node.value);
      const isSelected = !checkable && selectedValue === node.value;
      const isChecked = checked.includes(node.value);
      const indeterminate = isIndeterminate(node);
      const isLoading = loadingValues.includes(node.value);
      const labelText = getNodeLabelText(node);
      const hasLoadedChildren = (node.children?.length ?? 0) > 0;
      const nodeIndex = visibleNodes.findIndex((item) => item.node.value === node.value);
      const isActive = nodeIndex === activeIndex;

      return (
        <div
          key={node.value}
          id={getNodeId(node.value)}
          role="treeitem"
          tabIndex={-1}
          aria-label={typeof node.label === 'string' ? node.label : undefined}
          aria-level={level + 1}
          aria-selected={checkable ? undefined : isSelected}
          aria-checked={
            checkable ? (isChecked ? true : indeterminate ? 'mixed' : false) : undefined
          }
          aria-expanded={nodeCanExpand ? nodeExpanded : undefined}
          aria-busy={isLoading || undefined}
          aria-disabled={node.disabled || undefined}
          data-active={isActive || undefined}
          className={cx(classes.item)}
          onClick={(event) => handleNodeClick(event, node)}
        >
          <div
            className={cx(classes.row, {
              [classes.active]: isActive,
              [classes.selected]: checkable ? isChecked : isSelected,
              [classes.disabled]: node.disabled
            })}
            style={{ paddingLeft: `${level * 1.25}rem` }}
          >
            {nodeCanExpand ? (
              <button
                type="button"
                className={cx(classes.expander)}
                tabIndex={-1}
                aria-label={
                  isLoading
                    ? loadingLabel
                      ? `${loadingLabel} ${labelText}`
                      : resolvedLabels.loadingChildren(labelText)
                    : nodeExpanded
                      ? resolvedLabels.collapse(labelText)
                      : resolvedLabels.expand(labelText)
                }
                aria-busy={isLoading || undefined}
                disabled={isLoading || node.disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleExpanded(node);
                }}
              >
                {isLoading ? (
                  <span className={cx(classes.spinner)} aria-hidden="true" />
                ) : (
                  <Icon
                    icon={nodeExpanded ? 'chevron-down-outline' : 'chevron-right-outline'}
                    pack="nebular-essentials"
                    aria-hidden="true"
                    className={cx(classes.expanderIcon)}
                  />
                )}
              </button>
            ) : (
              <span className={cx(classes.spacer)} aria-hidden="true" />
            )}
            {checkable && (
              <TreeSelectCheckbox
                checked={isChecked}
                indeterminate={indeterminate}
                disabled={node.disabled}
                className={cx(classes.checkbox)}
                label={`Select ${labelText}`}
                onChange={() => toggleChecked(node)}
              />
            )}
            <span className={cx(classes.label)}>{node.label}</span>
          </div>
          {nodeCanExpand && nodeExpanded && hasLoadedChildren && (
            <div role="group" className={cx(classes.group)}>
              {renderNodes(node.children as TreeSelectNode[], level + 1)}
            </div>
          )}
        </div>
      );
    });

  return (
    <FormControl
      ref={ref}
      label={label}
      description={description}
      error={error}
      required={required}
      withAsterisk={withAsterisk}
      htmlFor={uuid}
      className={className}
    >
      <div {...others} ref={wrapperRef} className={cx(classes.root)}>
        <Input
          id={uuid}
          ref={triggerRef}
          value={inputValue}
          readOnly
          disabled={disabled}
          placeholder={resolvedPlaceholder}
          fullWidth
          role="combobox"
          aria-haspopup="tree"
          aria-expanded={opened}
          aria-controls={opened ? popupId : undefined}
          aria-activedescendant={activeNodeId}
          aria-label={inputAriaLabel}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          title={checkable && checkedLabels.length > 2 ? checkedLabels.join(', ') : undefined}
          onClick={triggerClickHandler}
          onKeyDown={triggerKeydownHandler}
        />
        {clearable && hasValue && !disabled && (
          <button
            type="button"
            className={cx(classes.clearButton)}
            aria-label="Clear selection"
            onClick={clearSelection}
          >
            <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
          </button>
        )}
        <OptionalPortal withinPortal>
          <div ref={boundingBoxRef} style={{ display: opened ? 'flex' : 'none' }}>
            <div ref={paneRef} className="overlay-pane">
              {opened && (
                <div
                  id={popupId}
                  className={cx(classes.dropdown)}
                  style={wrapperWidth > 0 ? { width: `${wrapperWidth}px` } : undefined}
                >
                  {searchable && (
                    <div className={cx(classes.searchContainer)}>
                      <input
                        ref={searchInputRef}
                        data-nebular-tree-select-search="true"
                        type="search"
                        className={cx(classes.searchInput)}
                        value={searchQuery}
                        placeholder={resolvedLabels.search}
                        aria-label="Search options"
                        onChange={(event) => {
                          setSearchQuery(event.target.value);
                          setActiveIndex(-1);
                        }}
                      />
                    </div>
                  )}
                  {filteredData.length > 0 ? (
                    <div
                      id={`${uuid}-tree`}
                      role="tree"
                      aria-label={treeAriaLabel}
                      aria-multiselectable={checkable ? true : undefined}
                      className={cx(classes.tree)}
                    >
                      {renderNodes(filteredData, 0)}
                    </div>
                  ) : (
                    <div role="status" aria-live="polite" className={cx(classes.dropdownStatus)}>
                      {nothingFoundMessage ?? resolvedLabels.empty}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </OptionalPortal>
      </div>
    </FormControl>
  );
});

_TreeSelect.displayName = 'TreeSelect';

export { _TreeSelect as TreeSelect };
