import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  FILTER_BUILDER_OPERATORS,
  FilterBuilder,
  applyFilterBuilderRules,
  matchesFilterBuilderRule,
  type FilterBuilderField,
  type FilterBuilderRule
} from '@nebular-react/core';

const fields: FilterBuilderField[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'age', label: 'Age', type: 'number' },
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'Editor', value: 'editor' }
    ]
  },
  { key: 'active', label: 'Active', type: 'boolean' },
  { key: 'notes', label: 'Notes' }
];

const getSelect = (label: string) => screen.getByLabelText(label) as HTMLSelectElement;

const getLastRules = (mock: jest.Mock): FilterBuilderRule[] =>
  mock.mock.calls[mock.mock.calls.length - 1][0] as FilterBuilderRule[];

const rule = (data: Partial<FilterBuilderRule>): FilterBuilderRule => ({
  id: 'r1',
  field: 'name',
  operator: 'contains',
  value: '',
  ...data
});

describe('FilterBuilder', () => {
  it('renders the empty state inside an accessible group', () => {
    render(<FilterBuilder fields={fields} />);

    expect(screen.getByRole('group', { name: 'Filter builder' })).toBeInTheDocument();
    expect(screen.getByText('No rules')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add rule' })).toBeEnabled();
  });

  it('uses a custom aria label for the root group', () => {
    render(<FilterBuilder fields={fields} ariaLabel="Users filter" />);

    expect(screen.getByRole('group', { name: 'Users filter' })).toBeInTheDocument();
  });

  it('renders the rules provided through defaultValue', () => {
    render(
      <FilterBuilder
        fields={fields}
        defaultValue={[
          rule({ id: 'r1', field: 'age', operator: 'gte', value: '30' }),
          rule({ id: 'r2', field: 'role', operator: 'isEmpty' })
        ]}
      />
    );

    expect(screen.getByRole('group', { name: 'Rule 1' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Rule 2' })).toBeInTheDocument();
    expect(getSelect('Field for rule 1')).toHaveValue('age');
    expect(getSelect('Operator for rule 1')).toHaveValue('gte');
    expect(screen.getByLabelText('Value for rule 1')).toHaveValue(30);
    expect(screen.queryByLabelText('Value for rule 2')).not.toBeInTheDocument();
  });

  it('disables the add button when there are no fields', () => {
    render(<FilterBuilder fields={[]} />);

    expect(screen.getByRole('button', { name: 'Add rule' })).toBeDisabled();
    expect(screen.getByText('No rules')).toBeInTheDocument();
  });

  it('adds a rule with the first field and its default operator', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<FilterBuilder fields={fields} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Add rule' }));

    expect(screen.getByRole('group', { name: 'Rule 1' })).toBeInTheDocument();
    expect(getSelect('Field for rule 1')).toHaveValue('name');
    expect(getSelect('Operator for rule 1')).toHaveValue('contains');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(getLastRules(onChange)[0]).toMatchObject({
      field: 'name',
      operator: 'contains'
    });
  });

  it('removes a rule and renumbers the remaining ones', async () => {
    const user = userEvent.setup();

    render(<FilterBuilder fields={fields} />);

    await user.click(screen.getByRole('button', { name: 'Add rule' }));
    await user.click(screen.getByRole('button', { name: 'Add rule' }));

    expect(screen.getByRole('group', { name: 'Rule 2' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove rule 1' }));

    expect(screen.getByRole('group', { name: 'Rule 1' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Rule 2' })).not.toBeInTheDocument();
  });

  it('goes back to the empty state when the last rule is removed', async () => {
    const user = userEvent.setup();

    render(<FilterBuilder fields={fields} />);

    await user.click(screen.getByRole('button', { name: 'Add rule' }));
    await user.click(screen.getByRole('button', { name: 'Remove rule 1' }));

    expect(screen.getByText('No rules')).toBeInTheDocument();
  });

  it('respects maxRules by disabling the add button', async () => {
    const user = userEvent.setup();

    render(<FilterBuilder fields={fields} maxRules={2} />);

    const addButton = screen.getByRole('button', { name: 'Add rule' });

    await user.click(addButton);
    expect(addButton).toBeEnabled();

    await user.click(addButton);
    expect(addButton).toBeDisabled();
    expect(screen.getByRole('group', { name: 'Rule 2' })).toBeInTheDocument();
  });

  it('updates field, operator and value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<FilterBuilder fields={fields} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Add rule' }));
    await user.selectOptions(getSelect('Field for rule 1'), 'age');

    expect(getSelect('Operator for rule 1')).toHaveValue('equals');

    await user.selectOptions(getSelect('Operator for rule 1'), 'gte');
    await user.type(screen.getByLabelText('Value for rule 1'), '30');

    expect(screen.getByLabelText('Value for rule 1')).toHaveValue(30);
    expect(getLastRules(onChange)[0]).toMatchObject({
      field: 'age',
      operator: 'gte',
      value: '30'
    });
  });

  it('limits the operator options based on the field type', async () => {
    const user = userEvent.setup();

    render(<FilterBuilder fields={fields} />);

    await user.click(screen.getByRole('button', { name: 'Add rule' }));

    const optionValues = () =>
      within(getSelect('Operator for rule 1'))
        .getAllByRole('option')
        .map((option) => (option as HTMLOptionElement).value);

    expect(optionValues()).toEqual(FILTER_BUILDER_OPERATORS.text);

    await user.selectOptions(getSelect('Field for rule 1'), 'age');
    expect(optionValues()).toEqual(FILTER_BUILDER_OPERATORS.number);

    await user.selectOptions(getSelect('Field for rule 1'), 'active');
    expect(optionValues()).toEqual(FILTER_BUILDER_OPERATORS.boolean);
  });

  it('hides the value control for valueless operators', async () => {
    const user = userEvent.setup();

    render(<FilterBuilder fields={fields} />);

    await user.click(screen.getByRole('button', { name: 'Add rule' }));
    expect(screen.getByLabelText('Value for rule 1')).toBeInTheDocument();

    await user.selectOptions(getSelect('Operator for rule 1'), 'isEmpty');

    expect(screen.queryByLabelText('Value for rule 1')).not.toBeInTheDocument();

    await user.selectOptions(getSelect('Operator for rule 1'), 'contains');

    expect(screen.getByLabelText('Value for rule 1')).toBeInTheDocument();
  });

  it('renders the configured options for select fields', async () => {
    const user = userEvent.setup();

    render(<FilterBuilder fields={fields} />);

    await user.click(screen.getByRole('button', { name: 'Add rule' }));
    await user.selectOptions(getSelect('Field for rule 1'), 'role');

    const valueSelect = getSelect('Value for rule 1');
    const values = within(valueSelect)
      .getAllByRole('option')
      .map((option) => (option as HTMLOptionElement).value);

    expect(values).toEqual(['', 'admin', 'editor']);

    await user.selectOptions(valueSelect, 'editor');
    expect(valueSelect).toHaveValue('editor');
  });

  it('renders a boolean value control accepting true and false', async () => {
    const user = userEvent.setup();

    render(<FilterBuilder fields={fields} />);

    await user.click(screen.getByRole('button', { name: 'Add rule' }));
    await user.selectOptions(getSelect('Field for rule 1'), 'active');

    const valueSelect = getSelect('Value for rule 1');

    await user.selectOptions(valueSelect, 'false');
    expect(valueSelect).toHaveValue('false');

    await user.selectOptions(valueSelect, 'true');
    expect(valueSelect).toHaveValue('true');
  });

  it('falls back to text when the field type is not provided', async () => {
    const user = userEvent.setup();

    render(<FilterBuilder fields={fields} />);

    await user.click(screen.getByRole('button', { name: 'Add rule' }));
    await user.selectOptions(getSelect('Field for rule 1'), 'notes');

    expect(screen.getByLabelText('Value for rule 1')).toHaveAttribute('type', 'text');
  });

  it('reflects a controlled value and keeps it untouched on changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const value = [rule({ value: 'ali' })];

    render(<FilterBuilder fields={fields} value={value} onChange={onChange} />);

    expect(screen.getByLabelText('Value for rule 1')).toHaveValue('ali');

    await user.click(screen.getByRole('button', { name: 'Remove rule 1' }));

    expect(onChange).toHaveBeenCalledWith([]);
    expect(screen.getByRole('group', { name: 'Rule 1' })).toBeInTheDocument();
  });

  it('toggles the conjunction between AND and OR', async () => {
    const user = userEvent.setup();
    const onConjunctionChange = jest.fn();

    render(<FilterBuilder fields={fields} onConjunctionChange={onConjunctionChange} />);

    const and = screen.getByRole('radio', { name: 'AND' });
    const or = screen.getByRole('radio', { name: 'OR' });

    expect(and).toHaveAttribute('aria-checked', 'true');

    await user.click(or);

    expect(or).toHaveAttribute('aria-checked', 'true');
    expect(and).toHaveAttribute('aria-checked', 'false');
    expect(onConjunctionChange).toHaveBeenCalledWith('or');
  });

  it('supports a controlled conjunction', () => {
    render(<FilterBuilder fields={fields} conjunction="or" />);

    expect(screen.getByRole('radio', { name: 'OR' })).toHaveAttribute('aria-checked', 'true');
  });

  it('supports defaultConjunction', () => {
    render(<FilterBuilder fields={fields} defaultConjunction="or" />);

    expect(screen.getByRole('radio', { name: 'OR' })).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onApply with the current rules', async () => {
    const user = userEvent.setup();
    const onApply = jest.fn();

    render(<FilterBuilder fields={fields} onApply={onApply} />);

    await user.click(screen.getByRole('button', { name: 'Add rule' }));
    await user.type(screen.getByLabelText('Value for rule 1'), 'ali');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0]).toEqual([
      expect.objectContaining({ field: 'name', operator: 'contains', value: 'ali' })
    ]);
  });

  it('resets the rules and notifies the caller', async () => {
    const user = userEvent.setup();
    const onReset = jest.fn();

    render(<FilterBuilder fields={fields} onReset={onReset} />);

    await user.click(screen.getByRole('button', { name: 'Add rule' }));
    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByText('No rules')).toBeInTheDocument();
  });

  it('accepts custom button labels', async () => {
    const user = userEvent.setup();
    const onApply = jest.fn();
    const onReset = jest.fn();

    render(
      <FilterBuilder
        fields={fields}
        addLabel="Nova regra"
        applyLabel="Aplicar"
        resetLabel="Limpar"
        onApply={onApply}
        onReset={onReset}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Nova regra' }));

    expect(screen.getByRole('group', { name: 'Rule 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aplicar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeInTheDocument();
  });

  it('does not render the action footer without callbacks', () => {
    render(<FilterBuilder fields={fields} />);

    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FilterBuilder
        fields={fields}
        defaultValue={[
          rule({ id: 'r1', field: 'name', operator: 'contains', value: 'ali' }),
          rule({ id: 'r2', field: 'age', operator: 'isEmpty' })
        ]}
        onApply={jest.fn()}
        onReset={jest.fn()}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('matchesFilterBuilderRule', () => {
  it('matches text operators ignoring the case', () => {
    expect(matchesFilterBuilderRule('Alice', rule({ operator: 'contains', value: 'lic' }))).toBe(
      true
    );
    expect(matchesFilterBuilderRule('Alice', rule({ operator: 'notContains', value: 'bob' }))).toBe(
      true
    );
    expect(matchesFilterBuilderRule('Alice', rule({ operator: 'equals', value: 'alice' }))).toBe(
      true
    );
    expect(matchesFilterBuilderRule('Alice', rule({ operator: 'notEquals', value: 'bob' }))).toBe(
      true
    );
    expect(matchesFilterBuilderRule('Alice', rule({ operator: 'startsWith', value: 'AL' }))).toBe(
      true
    );
    expect(matchesFilterBuilderRule('Alice', rule({ operator: 'endsWith', value: 'ce' }))).toBe(
      true
    );
    expect(matchesFilterBuilderRule('Alice', rule({ operator: 'endsWith', value: 'al' }))).toBe(
      false
    );
  });

  it('compares numbers with parsing on numeric operators', () => {
    expect(matchesFilterBuilderRule('42', rule({ operator: 'gt', value: '40' }))).toBe(true);
    expect(matchesFilterBuilderRule(42, rule({ operator: 'gte', value: '42' }))).toBe(true);
    expect(matchesFilterBuilderRule('42', rule({ operator: 'lt', value: '40' }))).toBe(false);
    expect(matchesFilterBuilderRule(42, rule({ operator: 'lte', value: '41' }))).toBe(false);
    expect(matchesFilterBuilderRule('abc', rule({ operator: 'gt', value: '1' }))).toBe(false);
  });

  it('evaluates isEmpty and isNotEmpty without a rule value', () => {
    expect(matchesFilterBuilderRule('', rule({ operator: 'isEmpty' }))).toBe(true);
    expect(matchesFilterBuilderRule(undefined, rule({ operator: 'isEmpty' }))).toBe(true);
    expect(matchesFilterBuilderRule(null, rule({ operator: 'isEmpty' }))).toBe(true);
    expect(matchesFilterBuilderRule([], rule({ operator: 'isEmpty' }))).toBe(true);
    expect(matchesFilterBuilderRule(0, rule({ operator: 'isEmpty' }))).toBe(false);
    expect(matchesFilterBuilderRule('value', rule({ operator: 'isNotEmpty' }))).toBe(true);
    expect(matchesFilterBuilderRule('', rule({ operator: 'isNotEmpty' }))).toBe(false);
  });

  it('compares boolean values as strings', () => {
    expect(matchesFilterBuilderRule(true, rule({ operator: 'equals', value: 'true' }))).toBe(true);
    expect(matchesFilterBuilderRule(false, rule({ operator: 'equals', value: 'true' }))).toBe(
      false
    );
    expect(matchesFilterBuilderRule(false, rule({ operator: 'notEquals', value: 'true' }))).toBe(
      true
    );
  });

  it('ignores rules without a value for value based operators', () => {
    expect(
      matchesFilterBuilderRule('Alice', rule({ operator: 'contains', value: undefined }))
    ).toBe(true);
    expect(matchesFilterBuilderRule('Alice', rule({ operator: 'equals', value: '  ' }))).toBe(true);
  });
});

describe('applyFilterBuilderRules', () => {
  const rows = [
    { name: 'Alice', age: 30, role: 'admin' },
    { name: 'Bob', age: 20, role: 'editor' },
    { name: 'Carol', age: 40, role: 'admin' }
  ];

  it('returns every row when there are no rules', () => {
    expect(applyFilterBuilderRules(rows, [])).toEqual(rows);
  });

  it('applies every rule with the AND conjunction', () => {
    const result = applyFilterBuilderRules(
      rows,
      [
        rule({ field: 'role', operator: 'equals', value: 'admin' }),
        rule({ field: 'age', operator: 'gt', value: '35' })
      ],
      'and'
    );

    expect(result).toEqual([{ name: 'Carol', age: 40, role: 'admin' }]);
  });

  it('applies any rule with the OR conjunction', () => {
    const result = applyFilterBuilderRules(
      rows,
      [
        rule({ field: 'name', operator: 'equals', value: 'Bob' }),
        rule({ field: 'age', operator: 'gt', value: '35' })
      ],
      'or'
    );

    expect(result).toEqual([
      { name: 'Bob', age: 20, role: 'editor' },
      { name: 'Carol', age: 40, role: 'admin' }
    ]);
  });

  it('defaults to the AND conjunction', () => {
    const result = applyFilterBuilderRules(rows, [
      rule({ field: 'role', operator: 'equals', value: 'admin' }),
      rule({ field: 'age', operator: 'lt', value: '35' })
    ]);

    expect(result).toEqual([{ name: 'Alice', age: 30, role: 'admin' }]);
  });

  it('ignores incomplete rules in both conjunctions', () => {
    const rules = [
      rule({ field: 'name', operator: 'contains', value: '' }),
      rule({ field: 'role', operator: 'equals', value: 'editor' })
    ];

    expect(applyFilterBuilderRules(rows, rules, 'and')).toEqual([rows[1]]);
    expect(applyFilterBuilderRules(rows, rules, 'or')).toEqual([rows[1]]);
  });

  it('keeps rows matching an isEmpty rule', () => {
    const withOptional = [...rows, { name: 'Dave', age: 0, role: '' }];

    expect(
      applyFilterBuilderRules(withOptional, [rule({ field: 'role', operator: 'isEmpty' })])
    ).toEqual([{ name: 'Dave', age: 0, role: '' }]);
  });
});

describe('FILTER_BUILDER_OPERATORS', () => {
  it('exposes the operators supported by each field type', () => {
    expect(FILTER_BUILDER_OPERATORS.text).toEqual([
      'contains',
      'notContains',
      'equals',
      'notEquals',
      'startsWith',
      'endsWith',
      'isEmpty',
      'isNotEmpty'
    ]);
    expect(FILTER_BUILDER_OPERATORS.number).not.toContain('contains');
    expect(FILTER_BUILDER_OPERATORS.select).toEqual([
      'equals',
      'notEquals',
      'isEmpty',
      'isNotEmpty'
    ]);
    expect(FILTER_BUILDER_OPERATORS.boolean).toEqual([
      'equals',
      'notEquals',
      'isEmpty',
      'isNotEmpty'
    ]);
  });
});
