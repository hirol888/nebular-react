import React, { forwardRef, useId } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Actions } from '../Actions';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { SegmentedControl } from '../SegmentedControl';

export type FilterBuilderOperator =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEquals'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'isEmpty'
  | 'isNotEmpty';

export type FilterBuilderFieldType = 'text' | 'number' | 'select' | 'boolean';

export type FilterBuilderConjunction = 'and' | 'or';

export interface FilterBuilderFieldOption {
  label: React.ReactNode;
  value: string;
}

export interface FilterBuilderField {
  key: string;
  label: string;
  type?: FilterBuilderFieldType;
  options?: FilterBuilderFieldOption[];
}

export interface FilterBuilderRule {
  id: string;
  field: string;
  operator: FilterBuilderOperator;
  value?: string;
}

export type FilterBuilderNode = FilterBuilderRule | FilterBuilderGroup;

export interface FilterBuilderGroup {
  type: 'group';
  id: string;
  conjunction: FilterBuilderConjunction;
  children: FilterBuilderNode[];
}

export interface FilterBuilderGroupLabels {
  add: string;
  group(path: readonly number[]): string;
  conjunction(path: readonly number[]): string;
  remove(path: readonly number[]): string;
}

export interface FilterBuilderProps extends DefaultProps<FilterBuilderStylesNames> {
  fields: FilterBuilderField[];
  value?: FilterBuilderRule[];
  defaultValue?: FilterBuilderRule[];
  onChange?(rules: FilterBuilderRule[]): void;
  conjunction?: FilterBuilderConjunction;
  defaultConjunction?: FilterBuilderConjunction;
  onConjunctionChange?(conjunction: FilterBuilderConjunction): void;
  /** Start an empty nested filter. Providing group or defaultGroup also enables this mode. */
  nested?: boolean;
  group?: FilterBuilderGroup;
  defaultGroup?: FilterBuilderGroup;
  onGroupChange?(group: FilterBuilderGroup): void;
  onGroupApply?(group: FilterBuilderGroup): void;
  /** Limit newly added groups. The root is depth zero. */
  maxGroupDepth?: number;
  groupLabels?: Partial<FilterBuilderGroupLabels>;
  maxRules?: number;
  onApply?(rules: FilterBuilderRule[]): void;
  onReset?(): void;
  addLabel?: string;
  applyLabel?: string;
  resetLabel?: string;
  ariaLabel?: string;
}

const useStyles = createStyles((_theme) => ({
  root: {
    '--button-outline-basic-text-color':
      'var(--filter-builder-action-color, var(--text-basic-color, #222b45))',
    '--button-outline-basic-focus-text-color': 'var(--button-outline-basic-text-color)',
    '--button-outline-basic-hover-text-color': 'var(--button-outline-basic-text-color)',
    '--button-outline-basic-active-text-color': 'var(--button-outline-basic-text-color)',
    '--button-filled-primary-background-color': 'var(--color-primary-600, #274bdb)',
    '--button-filled-primary-focus-background-color': 'var(--color-primary-700, #1a34b8)',
    '--button-filled-primary-hover-background-color': 'var(--color-primary-700, #1a34b8)',
    '--button-filled-primary-active-background-color': 'var(--color-primary-800, #102694)',
    '--segmented-control-active-text-color': 'var(--text-basic-color, #222b45)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
    fontFamily: 'inherit'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },

  headerActions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.5rem'
  },

  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minWidth: 0,
    padding: 'var(--filter-builder-group-padding, 0.75rem)',
    border:
      '1px solid var(--filter-builder-group-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--filter-builder-rule-border-radius, 0.375rem)'
  },

  groupHeading: {
    margin: 0,
    fontSize: 'var(--filter-builder-font-size, 0.875rem)',
    fontWeight: 600,
    color: 'var(--filter-builder-text-color, var(--text-basic-color, #222b45))'
  },

  rules: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },

  rule: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
    padding: '0.5rem',
    border:
      '1px solid var(--filter-builder-rule-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--filter-builder-rule-border-radius, 0.375rem)',
    backgroundColor:
      'var(--filter-builder-rule-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  select: {
    height: 'var(--filter-builder-control-height, 2.25rem)',
    padding: '0 0.75rem',
    boxSizing: 'border-box',
    border: '1px solid var(--filter-builder-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--filter-builder-border-radius, 0.25rem)',
    backgroundColor:
      'var(--filter-builder-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--filter-builder-text-color, var(--text-basic-color, #222b45))',
    fontFamily: 'inherit',
    fontSize: 'var(--filter-builder-font-size, 0.875rem)',

    '&:focus-visible': {
      outline: '2px solid var(--filter-builder-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    }
  },

  field: {
    flex: '1 1 9rem',
    minWidth: '9rem'
  },

  operator: {
    flex: '1 1 10rem',
    minWidth: '10rem'
  },

  value: {
    flex: '1 1 10rem',
    minWidth: '10rem'
  },

  remove: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '2rem',
    height: '2rem',
    border: 0,
    borderRadius: '50%',
    background: 'transparent',
    color: 'var(--filter-builder-remove-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--filter-builder-remove-hover-background-color, var(--background-basic-color-3, #edf1f7))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--filter-builder-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    }
  },

  empty: {
    margin: 0,
    fontSize: 'var(--filter-builder-empty-font-size, 0.875rem)',
    color: 'var(--filter-builder-empty-color, var(--text-basic-color, #222b45))'
  },

  actions: {
    justifyContent: 'flex-end',
    gap: '0.5rem'
  }
}));

export type FilterBuilderStylesNames = Selectors<typeof useStyles>;

export const FILTER_BUILDER_OPERATORS: Record<FilterBuilderFieldType, FilterBuilderOperator[]> = {
  text: [
    'contains',
    'notContains',
    'equals',
    'notEquals',
    'startsWith',
    'endsWith',
    'isEmpty',
    'isNotEmpty'
  ],
  number: ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'isEmpty', 'isNotEmpty'],
  select: ['equals', 'notEquals', 'isEmpty', 'isNotEmpty'],
  boolean: ['equals', 'notEquals', 'isEmpty', 'isNotEmpty']
};

export const FILTER_BUILDER_OPERATOR_LABELS: Record<FilterBuilderOperator, string> = {
  contains: 'Contains',
  notContains: 'Does not contain',
  equals: 'Equals',
  notEquals: 'Does not equal',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  gt: 'Greater than',
  gte: 'Greater than or equal',
  lt: 'Less than',
  lte: 'Less than or equal',
  isEmpty: 'Is empty',
  isNotEmpty: 'Is not empty'
};

const VALUELESS_OPERATORS: FilterBuilderOperator[] = ['isEmpty', 'isNotEmpty'];

const CONJUNCTION_DATA = [
  { label: 'AND', value: 'and' },
  { label: 'OR', value: 'or' }
];

const defaultGroupLabels: FilterBuilderGroupLabels = {
  add: 'Add group',
  group: (path) => `Group ${path.join('.')}`,
  conjunction: (path) => `Conjunction for group ${path.join('.')}`,
  remove: (path) => `Remove group ${path.join('.')}`
};

const defaultProps: Partial<FilterBuilderProps> = {
  defaultConjunction: 'and',
  addLabel: 'Add rule',
  applyLabel: 'Apply',
  resetLabel: 'Reset',
  ariaLabel: 'Filter builder'
};

const isValuelessOperator = (operator: FilterBuilderOperator): boolean =>
  VALUELESS_OPERATORS.includes(operator);

const hasRuleValue = (value: string | undefined): value is string =>
  value !== undefined && value !== null && value.trim() !== '';

const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
};

const toComparableText = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value).toLowerCase();

const toComparableNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (trimmed === '') {
      return null;
    }

    const parsed = Number(trimmed);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const valuesAreEqual = (rawValue: unknown, expected: string): boolean => {
  const rawNumber = toComparableNumber(rawValue);
  const expectedNumber = toComparableNumber(expected);

  if (rawNumber !== null && expectedNumber !== null) {
    return rawNumber === expectedNumber;
  }

  return toComparableText(rawValue) === toComparableText(expected).trim();
};

/**
 * Evaluates a single filter rule against a raw value.
 * Rules without a value are ignored (they match every value); emptiness operators never need one.
 */
export function matchesFilterBuilderRule(rawValue: unknown, rule: FilterBuilderRule): boolean {
  const { operator } = rule;

  if (operator === 'isEmpty') {
    return isEmptyValue(rawValue);
  }

  if (operator === 'isNotEmpty') {
    return !isEmptyValue(rawValue);
  }

  if (!hasRuleValue(rule.value)) {
    return true;
  }

  const expectedText = toComparableText(rule.value).trim();

  switch (operator) {
    case 'contains':
      return toComparableText(rawValue).includes(expectedText);

    case 'notContains':
      return !toComparableText(rawValue).includes(expectedText);

    case 'equals':
      return valuesAreEqual(rawValue, rule.value);

    case 'notEquals':
      return !valuesAreEqual(rawValue, rule.value);

    case 'startsWith':
      return toComparableText(rawValue).startsWith(expectedText);

    case 'endsWith':
      return toComparableText(rawValue).endsWith(expectedText);

    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte': {
      const rawNumber = toComparableNumber(rawValue);
      const expectedNumber = toComparableNumber(rule.value);

      if (rawNumber === null || expectedNumber === null) {
        return false;
      }

      if (operator === 'gt') {
        return rawNumber > expectedNumber;
      }

      if (operator === 'gte') {
        return rawNumber >= expectedNumber;
      }

      if (operator === 'lt') {
        return rawNumber < expectedNumber;
      }

      return rawNumber <= expectedNumber;
    }

    default:
      return false;
  }
}

const isApplicableRule = (rule: FilterBuilderRule): boolean =>
  !!rule.field && (isValuelessOperator(rule.operator) || hasRuleValue(rule.value));

const isFilterBuilderGroup = (node: FilterBuilderNode): node is FilterBuilderGroup =>
  'type' in node && node.type === 'group';

type RowFilter = (row: Record<string, unknown>) => boolean;

function compileGroup(group: FilterBuilderGroup): RowFilter | undefined {
  const predicates = group.children.flatMap<RowFilter>((node) => {
    if (isFilterBuilderGroup(node)) {
      const predicate = compileGroup(node);
      return predicate ? [predicate] : [];
    }

    return isApplicableRule(node) ? [(row) => matchesFilterBuilderRule(row[node.field], node)] : [];
  });

  if (!predicates.length) return undefined;

  return group.conjunction === 'or'
    ? (row) => predicates.some((predicate) => predicate(row))
    : (row) => predicates.every((predicate) => predicate(row));
}

/** Filters rows using a nested tree. Empty groups and incomplete rules are ignored. */
export function applyFilterBuilderGroup<T extends Record<string, unknown>>(
  rows: T[],
  group: FilterBuilderGroup
): T[] {
  const predicate = compileGroup(group);
  return predicate ? rows.filter(predicate) : rows;
}

/**
 * Filters rows with the given rules. Rules without a value are skipped; `isEmpty`/`isNotEmpty`
 * rules are always considered because they do not need a value.
 */
export function applyFilterBuilderRules<T extends Record<string, unknown>>(
  rows: T[],
  rules: FilterBuilderRule[],
  conjunction: FilterBuilderConjunction = 'and'
): T[] {
  return applyFilterBuilderGroup(rows, { type: 'group', id: '', conjunction, children: rules });
}

let nodeIdCounter = 0;

const createNodeId = (type: 'rule' | 'group', siblings: FilterBuilderNode[]): string => {
  const siblingIds = new Set(siblings.map((sibling) => sibling.id));
  let id: string;
  do {
    nodeIdCounter += 1;
    id = `filter-builder-${type}-${nodeIdCounter}`;
  } while (siblingIds.has(id));

  return id;
};

const countRules = (group: FilterBuilderGroup): number =>
  group.children.reduce(
    (total, child) => total + (isFilterBuilderGroup(child) ? countRules(child) : 1),
    0
  );

const getFieldType = (fields: FilterBuilderField[], fieldKey: string): FilterBuilderFieldType =>
  fields.find((field) => field.key === fieldKey)?.type ?? 'text';

const getOptionText = (label: React.ReactNode, fallback: string): string =>
  typeof label === 'string' || typeof label === 'number' ? String(label) : fallback;

const createEmptyRule = (
  fields: FilterBuilderField[],
  siblings: FilterBuilderNode[]
): FilterBuilderRule => {
  const firstField = fields[0];
  const fieldType = firstField?.type ?? 'text';

  return {
    id: createNodeId('rule', siblings),
    field: firstField?.key ?? '',
    operator: FILTER_BUILDER_OPERATORS[fieldType][0],
    value: ''
  };
};

const createEmptyGroup = (
  id: string,
  conjunction: FilterBuilderConjunction = 'and'
): FilterBuilderGroup => ({
  type: 'group',
  id,
  conjunction,
  children: []
});

const _FilterBuilder = forwardRef<HTMLDivElement, FilterBuilderProps>((props, ref) => {
  const {
    fields,
    value,
    defaultValue,
    onChange,
    conjunction,
    defaultConjunction,
    onConjunctionChange,
    nested,
    group,
    defaultGroup,
    onGroupChange,
    onGroupApply,
    maxGroupDepth = Infinity,
    groupLabels,
    maxRules,
    onApply,
    onReset,
    addLabel,
    applyLabel,
    resetLabel,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);

  const { classes, cx } = useStyles(null, {
    name: 'filter-builder',
    classNames,
    styles,
    unstyled
  });

  const [rules, setRules] = useUncontrolled<FilterBuilderRule[]>({
    value,
    defaultValue,
    finalValue: [],
    onChange
  });

  const [activeConjunction, setConjunction] = useUncontrolled<FilterBuilderConjunction>({
    value: conjunction,
    defaultValue: defaultConjunction,
    finalValue: 'and',
    onChange: onConjunctionChange
  });

  const rootId = useId();
  const [activeGroup, setActiveGroup] = useUncontrolled<FilterBuilderGroup>({
    value: group,
    defaultValue: defaultGroup,
    finalValue: createEmptyGroup(rootId, defaultConjunction),
    onChange: onGroupChange
  });
  const grouped = nested || group !== undefined || defaultGroup !== undefined;
  const root = grouped
    ? activeGroup
    : { type: 'group' as const, id: rootId, conjunction: activeConjunction, children: rules };
  const ruleCount = grouped ? countRules(activeGroup) : rules.length;
  const canAddRule = fields.length > 0 && (typeof maxRules !== 'number' || ruleCount < maxRules);
  const text = { ...defaultGroupLabels, ...groupLabels };

  const updateRoot = (next: FilterBuilderGroup) => {
    if (grouped) {
      setActiveGroup(next);
      return;
    }
    if (next.children !== rules) {
      setRules(
        next.children.filter((child): child is FilterBuilderRule => !isFilterBuilderGroup(child))
      );
    }
    if (next.conjunction !== activeConjunction) setConjunction(next.conjunction);
  };

  const handleReset = () => {
    updateRoot({ ...root, children: [] });

    if (typeof onReset === 'function') {
      onReset();
    }
  };

  const handleApply = () => {
    if (grouped) {
      onGroupApply?.(activeGroup);
    } else if (typeof onApply === 'function') {
      onApply(rules);
    }
  };

  const renderValueControl = (
    currentRule: FilterBuilderRule,
    position: number,
    updateValue: (value: string) => void
  ) => {
    const field = fields.find((item) => item.key === currentRule.field);
    const fieldType = field?.type ?? 'text';
    const ruleValue = currentRule.value ?? '';
    const valueLabel = `Value for rule ${position}`;

    if (fieldType === 'select' || fieldType === 'boolean') {
      const options =
        fieldType === 'boolean'
          ? [
              { label: 'True', value: 'true' },
              { label: 'False', value: 'false' }
            ]
          : (field?.options ?? []).map((option) => ({
              label: getOptionText(option.label, option.value),
              value: option.value
            }));

      return (
        <select
          className={cx(classes.select, classes.value)}
          aria-label={valueLabel}
          value={ruleValue}
          onChange={(event) => updateValue(event.target.value)}
        >
          <option value="">Select value</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <div className={classes.value}>
        <Input
          type={fieldType === 'number' ? 'number' : 'text'}
          aria-label={valueLabel}
          placeholder="Value"
          value={ruleValue}
          fullWidth
          onChange={(event) => updateValue(event.target.value)}
        />
      </div>
    );
  };

  const renderRule = (
    currentRule: FilterBuilderRule,
    position: number,
    updateRule: (update: Partial<FilterBuilderRule>) => void,
    removeRule: () => void
  ) => {
    const fieldType = getFieldType(fields, currentRule.field);
    const operators = FILTER_BUILDER_OPERATORS[fieldType];
    const operatorValue = operators.includes(currentRule.operator)
      ? currentRule.operator
      : operators[0];

    return (
      <div
        key={currentRule.id}
        role="group"
        aria-label={`Rule ${position}`}
        className={classes.rule}
      >
        <select
          className={cx(classes.select, classes.field)}
          aria-label={`Field for rule ${position}`}
          value={currentRule.field}
          onChange={(event) => {
            const field = event.target.value;
            const availableOperators = FILTER_BUILDER_OPERATORS[getFieldType(fields, field)];
            const operator = availableOperators.includes(currentRule.operator)
              ? currentRule.operator
              : availableOperators[0];

            updateRule({ field, operator, value: '' });
          }}
        >
          {fields.map((field) => (
            <option key={field.key} value={field.key}>
              {field.label}
            </option>
          ))}
        </select>

        <select
          className={cx(classes.select, classes.operator)}
          aria-label={`Operator for rule ${position}`}
          value={operatorValue}
          onChange={(event) => {
            const operator = event.target.value as FilterBuilderOperator;
            updateRule({
              operator,
              value: isValuelessOperator(operator) ? '' : (currentRule.value ?? '')
            });
          }}
        >
          {operators.map((operator) => (
            <option key={operator} value={operator}>
              {FILTER_BUILDER_OPERATOR_LABELS[operator]}
            </option>
          ))}
        </select>

        {!isValuelessOperator(currentRule.operator) &&
          renderValueControl(currentRule, position, (nextValue) =>
            updateRule({ value: nextValue })
          )}
        <button
          type="button"
          className={classes.remove}
          aria-label={`Remove rule ${position}`}
          onClick={removeRule}
        >
          <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
        </button>
      </div>
    );
  };

  const renderGroup = (
    currentGroup: FilterBuilderGroup,
    path: number[],
    updateGroup: (next: FilterBuilderGroup) => void,
    removeGroup?: () => void
  ): React.ReactNode => {
    const { children, conjunction: groupConjunction } = currentGroup;
    const updateChildren = (next: FilterBuilderNode[]) =>
      updateGroup({ ...currentGroup, children: next });
    const replace = (index: number, child: FilterBuilderNode) =>
      updateChildren(children.map((node, childIndex) => (childIndex === index ? child : node)));
    const remove = (index: number) =>
      updateChildren(children.filter((_, childIndex) => childIndex !== index));
    const groupHeading = path.length > 0 ? text.group(path) : undefined;
    let rulePosition = 0;
    let groupPosition = 0;
    const addRule = (
      <Button
        type="button"
        size="small"
        appearance="outline"
        disabled={!canAddRule}
        onClick={() => updateChildren([...children, createEmptyRule(fields, children)])}
      >
        {addLabel}
      </Button>
    );
    const content = (
      <>
        {groupHeading && <p className={classes.groupHeading}>{groupHeading}</p>}
        <div className={classes.header}>
          <SegmentedControl
            size="small"
            ariaLabel={path.length > 0 ? text.conjunction(path) : 'Conjunction'}
            data={CONJUNCTION_DATA}
            value={groupConjunction}
            onChange={(next) =>
              updateGroup({
                ...currentGroup,
                conjunction: next as FilterBuilderConjunction
              })
            }
          />
          {grouped ? (
            <div className={classes.headerActions}>
              {addRule}
              <Button
                type="button"
                size="small"
                appearance="outline"
                disabled={path.length >= maxGroupDepth}
                onClick={() =>
                  updateChildren([...children, createEmptyGroup(createNodeId('group', children))])
                }
              >
                {text.add}
              </Button>
              {removeGroup && (
                <Button type="button" size="small" appearance="ghost" onClick={removeGroup}>
                  {text.remove(path)}
                </Button>
              )}
            </div>
          ) : (
            addRule
          )}
        </div>
        {children.length === 0 ? (
          <p className={classes.empty}>No rules</p>
        ) : (
          <div className={classes.rules}>
            {children.map((child, index) => {
              if (isFilterBuilderGroup(child)) {
                groupPosition += 1;
                return renderGroup(
                  child,
                  [...path, groupPosition],
                  (next) => replace(index, next),
                  () => remove(index)
                );
              }
              rulePosition += 1;
              return renderRule(
                child,
                rulePosition,
                (update) => replace(index, { ...child, ...update }),
                () => remove(index)
              );
            })}
          </div>
        )}
      </>
    );

    return path.length === 0 ? (
      content
    ) : (
      <div key={currentGroup.id} role="group" aria-label={groupHeading} className={classes.group}>
        {content}
      </div>
    );
  };

  const hasApply = typeof (grouped ? onGroupApply : onApply) === 'function';
  const hasActions = hasApply || typeof onReset === 'function';

  return (
    <div ref={ref} role="group" aria-label={ariaLabel} className={cx(classes.root, className)}>
      {renderGroup(root, [], updateRoot)}

      {hasActions && (
        <Actions className={classes.actions}>
          {typeof onReset === 'function' && (
            <Button type="button" size="small" appearance="outline" onClick={handleReset}>
              {resetLabel}
            </Button>
          )}

          {hasApply && (
            <Button type="button" size="small" status="primary" onClick={handleApply}>
              {applyLabel}
            </Button>
          )}
        </Actions>
      )}
    </div>
  );
});

_FilterBuilder.displayName = 'FilterBuilder';

export const FilterBuilder = _FilterBuilder;
