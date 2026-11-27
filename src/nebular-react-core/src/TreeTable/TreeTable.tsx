import React, { useMemo } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import type { NebularMessageParams } from '@nebular-react/styles';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { EmptyState } from '../EmptyState';
import { Icon } from '../Icon';
import { Table } from '../Table';

export interface TreeTableNode<T> {
  id: string | number;
  data: T;
  children?: TreeTableNode<T>[];
}

export interface TreeTableColumn<T> {
  key: string;
  title: React.ReactNode;
  render?(node: TreeTableNode<T>, depth: number): React.ReactNode;
  width?: React.CSSProperties['width'];
  align?: 'left' | 'center' | 'right';
  /** Enables sorting by this column. */
  sortable?: boolean;
  /** Value used by the sorter. Defaults to `node.data[column.key]`. */
  sortValue?(node: TreeTableNode<T>): string | number | Date | null | undefined;
}

/**
 * Visible text and accessible names rendered by `TreeTable`.
 * Defaults come from the Nebular locale catalog; every entry can be overridden.
 */
export interface TreeTableLabels {
  /** Accessible name of the expander button of a collapsed row. */
  expand(name: string): string;
  /** Accessible name of the expander button of an expanded row. */
  collapse(name: string): string;
  /** Accessible name of the checkbox that selects a row. */
  select(name: string): string;
  /** Accessible name of the header checkbox that selects every row. */
  selectAll: string;
  /** Visible message shown when the table has no rows. */
  empty?: string;
}

export interface TreeTableProps<T>
  extends DefaultProps<TreeTableStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  data: TreeTableNode<T>[];
  columns: TreeTableColumn<T>[];
  expandedIds?: (string | number)[];
  defaultExpandedIds?: (string | number)[];
  onExpandedChange?(ids: (string | number)[]): void;
  selectedId?: string | number | null;
  defaultSelectedId?: string | number | null;
  onSelectionChange?(id: string | number | null): void;
  selectable?: boolean;
  /** Adds a checkbox column with cascade selection. */
  checkable?: boolean;
  checkedIds?: (string | number)[];
  defaultCheckedIds?: (string | number)[];
  onCheckedChange?(ids: (string | number)[]): void;
  /** Disables parent/child cascade for checkboxes. */
  checkStrictly?: boolean;
  sortBy?: string | null;
  defaultSortBy?: string | null;
  sortDirection?: 'asc' | 'desc';
  defaultSortDirection?: 'asc' | 'desc';
  onSortChange?(key: string | null, direction: 'asc' | 'desc'): void;
  indentSize?: number;
  caption?: React.ReactNode;
  ariaLabel?: string;
  emptyState?: React.ReactNode;
  /** Overrides the visible text and accessible names rendered by the component. */
  labels?: Partial<TreeTableLabels>;
  striped?: boolean;
  highlightOnHover?: boolean;
  withBorder?: boolean;
}

const useStyles = createStyles((_theme, { indentSize }: { indentSize: number }) => ({
  root: {
    width: '100%'
  },

  treeCell: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    minWidth: 0
  },

  indent: {
    flex: '0 0 auto',
    width: indentSize
  },

  expander: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '1.5rem',
    height: '1.5rem',
    padding: 0,
    border: 0,
    borderRadius: '0.2rem',
    background: 'transparent',
    color: 'var(--tree-table-expander-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  placeholder: {
    flex: '0 0 auto',
    width: '1.5rem',
    height: '1.5rem'
  },

  label: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  selected: {
    backgroundColor:
      'var(--tree-table-selected-background-color, var(--background-basic-color-2, #f7f9fc))',
    color: 'var(--tree-table-selected-color, var(--color-primary-500, #3366ff))'
  },

  sortButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: 0,
    border: 0,
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  sortIndicator: {
    fontSize: '0.7rem',
    lineHeight: 1
  },

  checkboxCell: {
    width: '2.25rem',
    paddingRight: 0
  },

  checkbox: {
    width: '0.95rem',
    height: '0.95rem',
    margin: 0,
    accentColor: 'var(--color-primary-500, #3366ff)',
    cursor: 'pointer'
  },

  alignCenter: {
    textAlign: 'center'
  },

  alignRight: {
    textAlign: 'right'
  },

  empty: {
    padding: '1.5rem',
    textAlign: 'center'
  }
}));

export type TreeTableStylesNames = Selectors<typeof useStyles>;

type TreeTableTranslate = (key: string, fallback: string, params?: NebularMessageParams) => string;

const createTreeTableLabels = (t: TreeTableTranslate): TreeTableLabels => ({
  expand: (name) => t('treeTable.expand', 'Expand {name}', { name }),
  collapse: (name) => t('treeTable.collapse', 'Collapse {name}', { name }),
  select: (name) => t('treeTable.select', 'Select {name}', { name }),
  selectAll: t('treeTable.selectAll', 'Select all rows'),
  empty: t('treeTable.empty', 'No data')
});

const defaultProps: Partial<TreeTableProps<any>> = {
  defaultExpandedIds: [],
  defaultSelectedId: null,
  selectable: false,
  checkable: false,
  checkStrictly: false,
  defaultCheckedIds: [],
  defaultSortBy: null,
  defaultSortDirection: 'asc',
  indentSize: 20,
  ariaLabel: 'Tree table',
  striped: false,
  highlightOnHover: true,
  withBorder: true
};

function TreeTable<T>(props: TreeTableProps<T>) {
  const {
    data,
    columns,
    expandedIds,
    defaultExpandedIds,
    onExpandedChange,
    selectedId,
    defaultSelectedId,
    onSelectionChange,
    selectable,
    checkable,
    checkedIds,
    defaultCheckedIds,
    onCheckedChange,
    checkStrictly,
    sortBy: sortByProp,
    defaultSortBy,
    sortDirection: sortDirectionProp,
    defaultSortDirection,
    onSortChange,
    indentSize,
    caption,
    ariaLabel,
    emptyState,
    labels,
    striped,
    highlightOnHover,
    withBorder,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps as TreeTableProps<T>, props);
  const { t } = useNebularLocale();
  const resolvedLabels: TreeTableLabels = { ...createTreeTableLabels(t), ...labels };
  const { classes, cx } = useStyles(
    { indentSize },
    { name: 'tree-table', classNames, styles, unstyled }
  );
  const [expanded, setExpanded] = useUncontrolled<(string | number)[]>({
    value: expandedIds,
    defaultValue: defaultExpandedIds,
    finalValue: [],
    onChange: onExpandedChange
  });
  const [selected, setSelected] = useUncontrolled<string | number | null>({
    value: selectedId,
    defaultValue: defaultSelectedId,
    finalValue: null,
    onChange: onSelectionChange
  });
  const [checked, setChecked] = useUncontrolled<(string | number)[]>({
    value: checkedIds,
    defaultValue: defaultCheckedIds,
    finalValue: [],
    onChange: onCheckedChange
  });
  const [sortBy, setSortBy] = useUncontrolled<string | null>({
    value: sortByProp,
    defaultValue: defaultSortBy,
    finalValue: null
  });
  const [sortDirection, setSortDirection] = useUncontrolled<'asc' | 'desc'>({
    value: sortDirectionProp,
    defaultValue: defaultSortDirection,
    finalValue: 'asc'
  });

  const parents = useMemo(() => {
    const map = new Map<string | number, TreeTableNode<T>>();
    const walk = (nodes: TreeTableNode<T>[], parent?: TreeTableNode<T>) => {
      nodes.forEach((node) => {
        if (parent) {
          map.set(node.id, parent);
        }
        walk(node.children ?? [], node);
      });
    };

    walk(data);
    return map;
  }, [data]);

  const allIds = useMemo(() => {
    const ids: (string | number)[] = [];
    const walk = (nodes: TreeTableNode<T>[]) => {
      nodes.forEach((node) => {
        ids.push(node.id);
        walk(node.children ?? []);
      });
    };

    walk(data);
    return ids;
  }, [data]);

  const nodesById = useMemo(() => {
    const map = new Map<string | number, TreeTableNode<T>>();
    const walk = (nodes: TreeTableNode<T>[]) => {
      nodes.forEach((node) => {
        map.set(node.id, node);
        walk(node.children ?? []);
      });
    };

    walk(data);
    return map;
  }, [data]);

  const getDescendantIds = (node: TreeTableNode<T>): (string | number)[] => {
    const ids: (string | number)[] = [];
    const walk = (children: TreeTableNode<T>[]) => {
      children.forEach((child) => {
        ids.push(child.id);
        walk(child.children ?? []);
      });
    };

    walk(node.children ?? []);
    return ids;
  };

  const getNodeLabel = (node: TreeTableNode<T>): string => {
    const firstColumn = columns[0];

    if (!firstColumn) {
      return String(node.id);
    }

    const raw = firstColumn.render
      ? firstColumn.render(node, 0)
      : (node.data as Record<string, unknown>)[firstColumn.key];

    return typeof raw === 'string' || typeof raw === 'number' ? String(raw) : String(node.id);
  };

  const toggleChecked = (node: TreeTableNode<T>) => {
    const targets = checkStrictly ? [node.id] : [node.id, ...getDescendantIds(node)];
    const allChecked = targets.every((id) => checked.includes(id));
    const next = new Set(checked);

    targets.forEach((id) => {
      if (allChecked) {
        next.delete(id);
      } else {
        next.add(id);
      }
    });

    if (!checkStrictly) {
      let parent = parents.get(node.id);

      while (parent) {
        const currentParent = parent;
        const descendants = getDescendantIds(currentParent);

        if (descendants.length > 0 && descendants.every((id) => next.has(id))) {
          next.add(currentParent.id);
        } else {
          next.delete(currentParent.id);
        }

        parent = parents.get(currentParent.id);
      }
    }

    setChecked([...next]);
  };

  const allChecked = allIds.length > 0 && allIds.every((id) => checked.includes(id));
  const someChecked = checked.some((id) => allIds.includes(id));

  const toggleAll = () => {
    if (allChecked) {
      setChecked(checked.filter((id) => !allIds.includes(id)));
    } else {
      setChecked([...new Set([...checked, ...allIds])]);
    }
  };

  const isIndeterminate = (id: string | number) => {
    if (checkStrictly || checked.includes(id)) {
      return false;
    }

    const node = nodesById.get(id);

    return node ? getDescendantIds(node).some((childId) => checked.includes(childId)) : false;
  };

  const compareValues = (
    first: string | number | Date | null | undefined,
    second: string | number | Date | null | undefined
  ): number => {
    if (first == null && second == null) {
      return 0;
    }
    if (first == null) {
      return 1;
    }
    if (second == null) {
      return -1;
    }
    if (first instanceof Date && second instanceof Date) {
      return first.getTime() - second.getTime();
    }
    if (typeof first === 'number' && typeof second === 'number') {
      return first - second;
    }

    return String(first).localeCompare(String(second), undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  };

  const sortColumn = columns.find((column) => column.sortable && column.key === sortBy);
  const getSortValue = (node: TreeTableNode<T>): string | number | Date | null | undefined =>
    sortColumn?.sortValue
      ? sortColumn.sortValue(node)
      : ((node.data as Record<string, unknown>)[sortColumn?.key ?? ''] as
          string | number | Date | null | undefined);
  const directionFactor = sortDirection === 'asc' ? 1 : -1;

  const handleSort = (column: TreeTableColumn<T>) => {
    const nextDirection: 'asc' | 'desc' =
      sortBy === column.key && sortDirection === 'asc' ? 'desc' : 'asc';

    setSortBy(column.key);
    setSortDirection(nextDirection);
    onSortChange?.(column.key, nextDirection);
  };

  const isExpanded = (id: string | number) => expanded.includes(id);

  const toggleExpanded = (id: string | number) => {
    setExpanded(expanded.includes(id) ? expanded.filter((item) => item !== id) : [...expanded, id]);
  };

  const selectNode = (id: string | number) => {
    if (selectable) {
      setSelected(selected === id ? null : id);
    }
  };

  const flattenNodes = (
    nodes: TreeTableNode<T>[],
    depth = 0
  ): { node: TreeTableNode<T>; depth: number }[] => {
    const rows: { node: TreeTableNode<T>; depth: number }[] = [];
    const orderedNodes = sortColumn
      ? [...nodes].sort(
          (first, second) =>
            compareValues(getSortValue(first), getSortValue(second)) * directionFactor
        )
      : nodes;

    orderedNodes.forEach((node) => {
      rows.push({ node, depth });

      if (node.children && node.children.length > 0 && isExpanded(node.id)) {
        rows.push(...flattenNodes(node.children, depth + 1));
      }
    });

    return rows;
  };

  const visibleRows = flattenNodes(data);

  const renderCell = (
    node: TreeTableNode<T>,
    column: TreeTableColumn<T>,
    depth: number,
    isTreeColumn: boolean
  ) => {
    const content = column.render
      ? column.render(node, depth)
      : ((node.data as any)?.[column.key] as React.ReactNode);
    const hasChildren = !!node.children && node.children.length > 0;
    const nodeExpanded = isExpanded(node.id);

    return (
      <Table.Cell
        key={column.key}
        className={cx({
          [classes.alignCenter]: column.align === 'center',
          [classes.alignRight]: column.align === 'right'
        })}
      >
        {isTreeColumn ? (
          <span className={cx(classes.treeCell)} style={{ marginLeft: depth * indentSize }}>
            {hasChildren ? (
              <button
                type="button"
                className={cx(classes.expander)}
                aria-label={
                  nodeExpanded
                    ? resolvedLabels.collapse(getNodeLabel(node))
                    : resolvedLabels.expand(getNodeLabel(node))
                }
                aria-expanded={nodeExpanded}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleExpanded(node.id);
                }}
              >
                <Icon
                  icon={nodeExpanded ? 'chevron-down-outline' : 'chevron-right-outline'}
                  pack="nebular-essentials"
                  aria-hidden="true"
                />
              </button>
            ) : (
              <span className={cx(classes.placeholder)} />
            )}
            <span className={cx(classes.label)}>{content}</span>
          </span>
        ) : (
          content
        )}
      </Table.Cell>
    );
  };

  return (
    <div {...others} className={cx(classes.root, className)}>
      <Table
        role="treegrid"
        aria-label={ariaLabel}
        striped={striped}
        highlightOnHover={highlightOnHover}
        withBorder={withBorder}
      >
        {caption && <Table.Caption>{caption}</Table.Caption>}
        <Table.Head>
          <Table.Row>
            {checkable && (
              <Table.HeaderCell className={cx(classes.checkboxCell)}>
                <input
                  type="checkbox"
                  className={cx(classes.checkbox)}
                  checked={allChecked}
                  ref={(element) => {
                    if (element) {
                      element.indeterminate = someChecked && !allChecked;
                    }
                  }}
                  onChange={toggleAll}
                  aria-label={resolvedLabels.selectAll}
                />
              </Table.HeaderCell>
            )}
            {columns.map((column) => {
              const isSorted = column.sortable && sortBy === column.key;

              return (
                <Table.HeaderCell
                  key={column.key}
                  style={{ width: column.width }}
                  aria-sort={
                    column.sortable
                      ? isSorted
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                      : undefined
                  }
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className={cx(classes.sortButton)}
                      onClick={() => handleSort(column)}
                    >
                      <span>{column.title}</span>
                      <span className={cx(classes.sortIndicator)} aria-hidden="true">
                        {isSorted ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  ) : (
                    column.title
                  )}
                </Table.HeaderCell>
              );
            })}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {visibleRows.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns.length + (checkable ? 1 : 0)}>
                <div className={cx(classes.empty)}>
                  {emptyState === undefined || typeof emptyState === 'string' ? (
                    <EmptyState compact title={emptyState ?? resolvedLabels.empty ?? 'No data'} />
                  ) : (
                    emptyState
                  )}
                </div>
              </Table.Cell>
            </Table.Row>
          ) : (
            visibleRows.map(({ node, depth }) => {
              const hasChildren = !!node.children && node.children.length > 0;
              const nodeExpanded = isExpanded(node.id);
              const nodeChecked = checked.includes(node.id);
              const nodeIndeterminate = isIndeterminate(node.id);

              return (
                <Table.Row
                  key={node.id}
                  role="row"
                  tabIndex={0}
                  aria-level={depth + 1}
                  aria-expanded={hasChildren ? nodeExpanded : undefined}
                  aria-selected={selectable ? selected === node.id : undefined}
                  className={cx({ [classes.selected]: selected === node.id })}
                  onClick={() => {
                    if (selectable) {
                      selectNode(node.id);
                    } else if (checkable) {
                      toggleChecked(node);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();

                      if (selectable) {
                        selectNode(node.id);
                      } else if (checkable) {
                        toggleChecked(node);
                      }
                    } else if (event.key === 'ArrowRight' && hasChildren && !nodeExpanded) {
                      event.preventDefault();
                      toggleExpanded(node.id);
                    } else if (event.key === 'ArrowLeft' && hasChildren && nodeExpanded) {
                      event.preventDefault();
                      toggleExpanded(node.id);
                    }
                  }}
                >
                  {checkable && (
                    <Table.Cell className={cx(classes.checkboxCell)}>
                      <input
                        type="checkbox"
                        className={cx(classes.checkbox)}
                        checked={nodeChecked}
                        ref={(element) => {
                          if (element) {
                            element.indeterminate = nodeIndeterminate;
                          }
                        }}
                        onChange={() => toggleChecked(node)}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={resolvedLabels.select(getNodeLabel(node))}
                      />
                    </Table.Cell>
                  )}
                  {columns.map((column, index) => renderCell(node, column, depth, index === 0))}
                </Table.Row>
              );
            })
          )}
        </Table.Body>
      </Table>
    </div>
  );
}

TreeTable.displayName = 'TreeTable';

export { TreeTable };
