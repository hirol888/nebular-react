import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  FilterBuilder,
  applyFilterBuilderGroup,
  type FilterBuilderField,
  type FilterBuilderGroup
} from '@nebular-react/core';

const fields: FilterBuilderField[] = [
  { key: 'region', label: 'Region', type: 'text' },
  { key: 'active', label: 'Active', type: 'boolean' }
];

const rows = [
  { region: 'Brazil', active: true },
  { region: 'Portugal', active: true },
  { region: 'Brazil', active: false },
  { region: 'Canada', active: true }
];

const group: FilterBuilderGroup = {
  type: 'group',
  id: 'root',
  conjunction: 'and',
  children: [
    { id: 'active', field: 'active', operator: 'equals', value: 'true' },
    {
      type: 'group',
      id: 'country',
      conjunction: 'or',
      children: [
        { id: 'brazil', field: 'region', operator: 'equals', value: 'Brazil' },
        { id: 'portugal', field: 'region', operator: 'equals', value: 'Portugal' },
        { id: 'blank', field: 'region', operator: 'contains', value: '' }
      ]
    }
  ]
};

describe('FilterBuilder groups', () => {
  it('evaluates independent conjunctions and skips inactive rules and empty groups', () => {
    expect(applyFilterBuilderGroup(rows, group)).toEqual(rows.slice(0, 2));
    expect(
      applyFilterBuilderGroup(rows, {
        ...group,
        conjunction: 'or',
        children: [
          group.children[0],
          { type: 'group', id: 'empty', conjunction: 'and', children: [] }
        ]
      })
    ).toEqual(rows.filter((row) => row.active));
    expect(applyFilterBuilderGroup(rows, { ...group, children: [] })).toBe(rows);
  });

  it('edits groups with their own conjunction and emits the complete query', async () => {
    const user = userEvent.setup();
    const onGroupApply = jest.fn();
    const { container } = render(
      <FilterBuilder fields={fields} nested onGroupApply={onGroupApply} maxGroupDepth={1} />
    );

    await user.click(screen.getByRole('button', { name: 'Add group' }));
    const block = within(screen.getByRole('group', { name: 'Group 1' }));
    const rootConjunction = within(screen.getByRole('radiogroup', { name: 'Conjunction' }));
    await user.click(block.getByRole('radio', { name: 'OR' }));
    expect(rootConjunction.getByRole('radio', { name: 'AND' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(block.getByRole('button', { name: 'Add group' })).toBeDisabled();
    await user.click(block.getByRole('button', { name: 'Add rule' }));
    await user.type(block.getByRole('textbox', { name: 'Value for rule 1' }), 'Brazil');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onGroupApply).toHaveBeenCalledWith(
      expect.objectContaining({
        conjunction: 'and',
        children: [
          expect.objectContaining({
            conjunction: 'or',
            children: [expect.objectContaining({ field: 'region', value: 'Brazil' })]
          })
        ]
      })
    );
    expect(await axe(container)).toHaveNoViolations();

    await user.click(block.getByRole('button', { name: 'Remove group 1' }));
    expect(screen.queryByRole('group', { name: 'Group 1' })).not.toBeInTheDocument();
  });

  it('counts rules across groups and leaves the controlled tree untouched after reset', async () => {
    const user = userEvent.setup();
    const onGroupChange = jest.fn();
    const onReset = jest.fn();
    render(
      <FilterBuilder
        fields={fields}
        group={group}
        onGroupChange={onGroupChange}
        onReset={onReset}
        maxRules={4}
      />
    );

    screen.getAllByRole('button', { name: 'Add rule' }).forEach((button) => {
      expect(button).toBeDisabled();
    });
    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(onGroupChange).toHaveBeenCalledWith({ ...group, children: [] });
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('group', { name: 'Group 1' })).toBeInTheDocument();
    expect(group.children).toHaveLength(2);
  });
});
