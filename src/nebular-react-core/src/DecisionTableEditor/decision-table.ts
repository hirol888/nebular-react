import { FILTER_BUILDER_OPERATORS, matchesFilterBuilderRule } from '../FilterBuilder';
import type { FilterBuilderFieldType, FilterBuilderOperator } from '../FilterBuilder';

export type DecisionTableHitPolicy = 'first' | 'unique' | 'collect';
export type DecisionTableFieldType = FilterBuilderFieldType;

export interface DecisionTableField {
  key: string;
  label: string;
  type?: DecisionTableFieldType;
  options?: readonly { value: string; label: string }[];
}

export interface DecisionTableCondition {
  operator: FilterBuilderOperator;
  value?: string;
}

export interface DecisionTableRule {
  id: string;
  /** Missing conditions match any value for their respective fields. */
  conditions: Readonly<Partial<Record<string, DecisionTableCondition>>>;
  outcomes: Readonly<Partial<Record<string, string>>>;
}

export type DecisionTableInput = Readonly<Record<string, unknown>>;

export interface DecisionTableContext {
  fields: readonly DecisionTableField[];
  outcomes: readonly DecisionTableField[];
  rules: readonly DecisionTableRule[];
  hitPolicy: DecisionTableHitPolicy;
}

export interface DecisionTableEvaluation {
  status: 'matched' | 'no-match' | 'multiple-matches';
  matches: readonly DecisionTableRule[];
}

export function requiresValue(operator: FilterBuilderOperator): boolean {
  return operator !== 'isEmpty' && operator !== 'isNotEmpty';
}

export function ownValue<T>(values: Readonly<Partial<Record<string, T>>>, key: string) {
  return Object.hasOwn(values, key) ? values[key] : undefined;
}

function isTypedValue(field: DecisionTableField, value: string | undefined) {
  if (!value?.trim()) return false;
  switch (field.type) {
    case 'number':
      return Number.isFinite(Number(value));
    case 'boolean':
      return value === 'true' || value === 'false';
    case 'select':
      return Boolean(field.options?.some((option) => option.value === value));
    default:
      return true;
  }
}

export function isDecisionTableRuleComplete(
  rule: DecisionTableRule,
  context: DecisionTableContext
) {
  const { fields, outcomes } = context;

  return (
    outcomes.length > 0 &&
    outcomes.every((field) => isTypedValue(field, ownValue(rule.outcomes, field.key))) &&
    Object.entries(rule.conditions).every(([key, condition]) => {
      if (!condition) return true;
      const field = fields.find((candidate) => candidate.key === key);
      return Boolean(
        field &&
        FILTER_BUILDER_OPERATORS[field.type ?? 'text'].includes(condition.operator) &&
        (!requiresValue(condition.operator) || isTypedValue(field, condition.value))
      );
    })
  );
}

/** Evaluate completed rules in display order. Unique mode reports ambiguity explicitly. */
export function evaluateDecisionTable(
  input: DecisionTableInput,
  context: DecisionTableContext
): DecisionTableEvaluation {
  const matches: DecisionTableRule[] = [];
  const fieldTypes = new Map(context.fields.map((field) => [field.key, field.type]));

  for (const rule of context.rules) {
    const matching =
      isDecisionTableRuleComplete(rule, context) &&
      Object.entries(rule.conditions).every(([field, condition]) => {
        if (!condition) return true;

        const value = ownValue(input, field);
        const { operator } = condition;
        // Select values are identities, including case and leading zeroes.
        if (
          fieldTypes.get(field) === 'select' &&
          (operator === 'equals' || operator === 'notEquals')
        ) {
          const equal = value === condition.value;
          return operator === 'equals' ? equal : !equal;
        }

        return matchesFilterBuilderRule(value, { id: rule.id, field, ...condition });
      });

    if (matching) {
      matches.push(rule);
      if (context.hitPolicy === 'first') break;
    }
  }

  if (matches.length === 0) return { status: 'no-match', matches };
  if (context.hitPolicy === 'unique' && matches.length > 1) {
    return { status: 'multiple-matches', matches };
  }
  return { status: 'matched', matches };
}

export function formatDecisionTableValue(field: DecisionTableField, value: string | undefined) {
  if (field.type === 'select') {
    return field.options?.find((option) => option.value === value)?.label ?? value;
  }
  return value;
}
