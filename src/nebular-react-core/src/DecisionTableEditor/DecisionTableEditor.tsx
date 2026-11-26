import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useUncontrolled } from '@nebular-react/hooks';
import { createStyles, DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { FILTER_BUILDER_OPERATORS, FILTER_BUILDER_OPERATOR_LABELS } from '../FilterBuilder';
import type { FilterBuilderOperator } from '../FilterBuilder';
import { Input } from '../Input';
import { NativeSelect } from '../NativeSelect';
import { Table } from '../Table';
import {
  evaluateDecisionTable,
  formatDecisionTableValue,
  isDecisionTableRuleComplete,
  ownValue,
  requiresValue
} from './decision-table';
import type {
  DecisionTableCondition,
  DecisionTableContext,
  DecisionTableEvaluation,
  DecisionTableField,
  DecisionTableHitPolicy,
  DecisionTableInput,
  DecisionTableRule
} from './decision-table';

export interface DecisionTableLabels {
  table: string;
  actions: string;
  add: string;
  empty: string;
  any: string;
  incomplete: string;
  operator: string;
  testInputs: string;
  test: string;
  running: string;
  testError: string;
  noMatch: string;
  multipleMatches: string;
  results: string;
  hitPolicy: string;
  first: string;
  unique: string;
  collect: string;
  true: string;
  false: string;
  emptyValue: string;
  rule(index: number): string;
  ruleField(index: number, field: string): string;
  moveUp(index: number): string;
  moveDown(index: number): string;
  remove(index: number): string;
  example(field: string): string;
}

const defaultLabels: DecisionTableLabels = {
  table: 'Decision table',
  actions: 'Rules',
  add: 'Add rule',
  empty: 'No rules configured.',
  any: 'Any value',
  incomplete: 'Complete the rule before testing.',
  operator: 'operator',
  testInputs: 'Example inputs',
  test: 'Test rules',
  running: 'Testing rules…',
  testError: 'The rules could not be tested.',
  noMatch: 'No matching rules.',
  multipleMatches: 'More than one rule matched. The unique policy requires at most one.',
  results: 'Test results',
  hitPolicy: 'Match policy',
  first: 'First match',
  unique: 'Unique match',
  collect: 'All matches',
  true: 'Yes',
  false: 'No',
  emptyValue: 'Select a value',
  rule: (index) => `Rule ${index}`,
  ruleField: (index, field) => `Rule ${index}: ${field}`,
  moveUp: (index) => `Move rule ${index} up`,
  moveDown: (index) => `Move rule ${index} down`,
  remove: (index) => `Remove rule ${index}`,
  example: (field) => `Example: ${field}`
};

const useStyles = createStyles(() => ({
  root: { display: 'grid', gap: '1rem', minWidth: 0 },
  toolbar: { display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: '0.5rem' },
  table: { overflowX: 'auto' },
  cell: { minWidth: '9rem' },
  condition: { display: 'grid', gap: '0.375rem' },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '0.25rem' },
  message: { margin: 0 },
  test: {
    display: 'grid',
    gap: '0.75rem',
    minWidth: 0,
    margin: 0,
    padding: '0.75rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--border-radius, 0.25rem)'
  },
  parameters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 10rem), 1fr))',
    gap: '0.75rem'
  },
  parameter: { display: 'grid', gap: '0.375rem' },
  result: { margin: 0 },
  error: { color: 'var(--text-danger-color, #b81d51)' }
}));

export type DecisionTableStylesNames = Selectors<typeof useStyles>;

export interface DecisionTableEditorProps extends DefaultProps<DecisionTableStylesNames> {
  fields: readonly DecisionTableField[];
  outcomes: readonly DecisionTableField[];
  value?: readonly DecisionTableRule[];
  defaultValue?: readonly DecisionTableRule[];
  onChange?(rules: readonly DecisionTableRule[]): void;
  hitPolicy?: DecisionTableHitPolicy;
  defaultHitPolicy?: DecisionTableHitPolicy;
  onHitPolicyChange?(policy: DecisionTableHitPolicy): void;
  /** Optionally evaluate with the consumer's rule engine. The draft rules are passed unchanged. */
  evaluate?(
    input: DecisionTableInput,
    context: DecisionTableContext & { signal: AbortSignal }
  ): DecisionTableEvaluation | Promise<DecisionTableEvaluation>;
  disabled?: boolean;
  labels?: Partial<DecisionTableLabels>;
  operatorLabels?: Partial<Record<FilterBuilderOperator, string>>;
}

interface ValueInputProps {
  field: DecisionTableField;
  value: string;
  label: string;
  text: DecisionTableLabels;
  disabled: boolean;
  onChange(value: string): void;
}

function ValueInput({ field, value, label, text, disabled, onChange }: ValueInputProps) {
  if (field.type === 'select' || field.type === 'boolean') {
    const data =
      field.type === 'boolean'
        ? [
            { value: 'true', label: text.true },
            { value: 'false', label: text.false }
          ]
        : [...(field.options ?? [])];

    return (
      <NativeSelect
        ariaLabel={label}
        value={value}
        data={[{ value: '', label: text.emptyValue }, ...data]}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }
  return (
    <Input
      type={field.type === 'number' ? 'number' : 'text'}
      step={field.type === 'number' ? 'any' : undefined}
      aria-label={label}
      value={value}
      disabled={disabled}
      fullWidth
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
}

interface SimulationTarget {
  context: DecisionTableContext;
  input: Record<string, string>;
  evaluate: DecisionTableEditorProps['evaluate'];
  disabled: boolean;
}

interface SimulationState {
  target: SimulationTarget;
  status: 'running' | 'error' | 'ready';
  result?: DecisionTableEvaluation;
}

export function DecisionTableEditor({
  fields,
  outcomes,
  value: controlledRules,
  defaultValue,
  onChange,
  hitPolicy,
  defaultHitPolicy,
  onHitPolicyChange,
  evaluate,
  disabled = false,
  labels,
  operatorLabels,
  className,
  classNames,
  style,
  styles,
  unstyled
}: DecisionTableEditorProps) {
  const text = { ...defaultLabels, ...labels };
  const { classes, cx } = useStyles(null, {
    name: 'decision-table-editor',
    classNames,
    styles,
    unstyled
  });
  const operators = { ...FILTER_BUILDER_OPERATOR_LABELS, ...operatorLabels };
  const [rules, setRules] = useUncontrolled<readonly DecisionTableRule[]>({
    value: controlledRules,
    defaultValue,
    onChange,
    finalValue: []
  });
  const [policy, setPolicy] = useUncontrolled<DecisionTableHitPolicy>({
    value: hitPolicy,
    defaultValue: defaultHitPolicy,
    onChange: onHitPolicyChange,
    finalValue: 'first'
  });
  const editorId = useId();
  const nextId = useRef(0);
  const request = useRef<AbortController>(null);
  const [example, setExample] = useState<Record<string, string>>({});
  const [simulation, setSimulation] = useState<SimulationState>();
  const context = useMemo(
    () => ({ fields, outcomes, rules, hitPolicy: policy }),
    [fields, outcomes, rules, policy]
  );
  const target = useMemo(
    () => ({ context, input: example, evaluate, disabled }),
    [context, example, evaluate, disabled]
  );
  const current = simulation?.target === target ? simulation : undefined;

  useEffect(() => () => request.current?.abort(), [target]);

  const editRule = (id: string, changes: Partial<DecisionTableRule>) => {
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, ...changes } : rule)));
  };

  const add = () => {
    const existingIds = new Set(rules.map((rule) => rule.id));
    let key: string;
    do {
      nextId.current += 1;
      key = `${editorId}-rule-${nextId.current}`;
    } while (existingIds.has(key));
    setRules([...rules, { id: key, conditions: {}, outcomes: {} }]);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rules.length) return;
    const next = [...rules];
    const [rule] = next.splice(from, 1);
    next.splice(to, 0, rule);
    setRules(next);
  };

  const setCondition = (
    rule: DecisionTableRule,
    key: string,
    condition?: DecisionTableCondition
  ) => {
    const conditions = { ...rule.conditions, [key]: condition };
    if (!condition) delete conditions[key];
    editRule(rule.id, { conditions });
  };

  const run = async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const input = Object.fromEntries(
      fields.map((field) => {
        const value = ownValue(example, field.key);
        if (!value) return [field.key, undefined];
        if (field.type === 'number') return [field.key, Number(value)];
        if (field.type === 'boolean') return [field.key, value === 'true'];
        return [field.key, value];
      })
    );
    setSimulation({ target, status: 'running' });
    try {
      const result = evaluate
        ? await evaluate(input, { ...context, signal: controller.signal })
        : evaluateDecisionTable(input, context);
      if (!controller.signal.aborted) setSimulation({ target, status: 'ready', result });
    } catch {
      if (!controller.signal.aborted) setSimulation({ target, status: 'error' });
    }
  };

  const renderCondition = (rule: DecisionTableRule, field: DecisionTableField, index: number) => {
    const condition = ownValue(rule.conditions, field.key);
    const available = FILTER_BUILDER_OPERATORS[field.type ?? 'text'];
    const label = text.ruleField(index, field.label);
    return (
      <div className={classes.condition}>
        <NativeSelect
          ariaLabel={`${label} ${text.operator}`}
          value={condition?.operator ?? ''}
          data={[
            { value: '', label: text.any },
            ...available.map((operator) => ({ value: operator, label: operators[operator] }))
          ]}
          disabled={disabled}
          onChange={(operator) => {
            const chosen = available.find((candidate) => candidate === operator);
            setCondition(
              rule,
              field.key,
              chosen
                ? { operator: chosen, value: requiresValue(chosen) ? condition?.value : undefined }
                : undefined
            );
          }}
        />
        {condition && requiresValue(condition.operator) && (
          <ValueInput
            field={field}
            label={label}
            value={condition.value ?? ''}
            text={text}
            disabled={disabled}
            onChange={(value) => setCondition(rule, field.key, { ...condition, value })}
          />
        )}
      </div>
    );
  };

  return (
    <section aria-label={text.table} className={cx(classes.root, className)} style={style}>
      <div className={classes.toolbar}>
        <NativeSelect
          label={text.hitPolicy}
          value={policy}
          disabled={disabled}
          data={[
            { value: 'first', label: text.first },
            { value: 'unique', label: text.unique },
            { value: 'collect', label: text.collect }
          ]}
          onChange={(next) => {
            if (next === 'first' || next === 'unique' || next === 'collect') setPolicy(next);
          }}
        />
        <Button type="button" disabled={disabled} onClick={add}>
          {text.add}
        </Button>
      </div>
      <div className={classes.table}>
        <Table aria-label={text.table} withBorder withColumnBorders>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>{text.actions}</Table.HeaderCell>
              {fields.map((field) => (
                <Table.HeaderCell key={`input-${field.key}`}>{field.label}</Table.HeaderCell>
              ))}
              {outcomes.map((field) => (
                <Table.HeaderCell key={`outcome-${field.key}`}>{field.label}</Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {!rules.length && (
              <Table.Row>
                <Table.Cell colSpan={fields.length + outcomes.length + 1}>{text.empty}</Table.Cell>
              </Table.Row>
            )}
            {rules.map((rule, index) => (
              <Table.Row key={rule.id}>
                <th scope="row">
                  <p className={classes.message}>{text.rule(index + 1)}</p>
                  {!isDecisionTableRuleComplete(rule, context) && (
                    <p className={classes.error}>{text.incomplete}</p>
                  )}
                  <div className={classes.actions}>
                    <Button
                      type="button"
                      size="tiny"
                      appearance="outline"
                      aria-label={text.moveUp(index + 1)}
                      disabled={disabled || index === 0}
                      onClick={() => move(index, index - 1)}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="tiny"
                      appearance="outline"
                      aria-label={text.moveDown(index + 1)}
                      disabled={disabled || index === rules.length - 1}
                      onClick={() => move(index, index + 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      size="tiny"
                      appearance="outline"
                      aria-label={text.remove(index + 1)}
                      disabled={disabled}
                      onClick={() => setRules(rules.filter((item) => item.id !== rule.id))}
                    >
                      ×
                    </Button>
                  </div>
                </th>
                {fields.map((field) => (
                  <Table.Cell key={`input-${field.key}`} className={classes.cell}>
                    {renderCondition(rule, field, index + 1)}
                  </Table.Cell>
                ))}
                {outcomes.map((field) => (
                  <Table.Cell key={`outcome-${field.key}`} className={classes.cell}>
                    <ValueInput
                      field={field}
                      value={ownValue(rule.outcomes, field.key) ?? ''}
                      label={text.ruleField(index + 1, field.label)}
                      text={text}
                      disabled={disabled}
                      onChange={(value) =>
                        editRule(rule.id, { outcomes: { ...rule.outcomes, [field.key]: value } })
                      }
                    />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <fieldset className={classes.test}>
        <legend>{text.testInputs}</legend>
        <div className={classes.parameters}>
          {fields.map((field) => (
            <div key={field.key} className={classes.parameter}>
              <span>{field.label}</span>
              <ValueInput
                field={field}
                label={text.example(field.label)}
                text={text}
                value={ownValue(example, field.key) ?? ''}
                disabled={disabled}
                onChange={(value) =>
                  setExample((previous) => ({ ...previous, [field.key]: value }))
                }
              />
            </div>
          ))}
        </div>
        <div>
          <Button
            type="button"
            status="primary"
            disabled={disabled || current?.status === 'running'}
            onClick={run}
          >
            {text.test}
          </Button>
        </div>
        <div
          aria-label={text.results}
          role="status"
          aria-busy={current?.status === 'running' || undefined}
        >
          {current?.status === 'running' && <p className={classes.message}>{text.running}</p>}
          {current?.status === 'error' && <p className={classes.error}>{text.testError}</p>}
          {current?.result?.status === 'no-match' && (
            <p className={classes.message}>{text.noMatch}</p>
          )}
          {current?.result?.status === 'multiple-matches' && (
            <p className={classes.error}>{text.multipleMatches}</p>
          )}
          {current?.result?.status === 'matched' &&
            current.result.matches.map((rule) => (
              <dl key={rule.id} className={classes.result}>
                {outcomes.map((field) => (
                  <React.Fragment key={field.key}>
                    <dt>{field.label}</dt>
                    <dd>{formatDecisionTableValue(field, ownValue(rule.outcomes, field.key))}</dd>
                  </React.Fragment>
                ))}
              </dl>
            ))}
        </div>
      </fieldset>
    </section>
  );
}
