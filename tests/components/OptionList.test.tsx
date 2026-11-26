import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { OptionList } from '@nebular-react/core';

const groupedData = Array.from({ length: 50 }, (_group, groupIndex) => ({
  type: 'group' as const,
  label: `Group ${groupIndex}`,
  options: Array.from({ length: 10 }, (_option, optionIndex) => ({
    type: 'option' as const,
    label: `Option ${groupIndex * 10 + optionIndex}`,
    value: String(groupIndex * 10 + optionIndex)
  }))
}));

describe('OptionList grouped virtualization', () => {
  it('virtualizes groups while preserving group roles', async () => {
    render(
      <OptionList
        data={groupedData}
        virtualized
        virtualizedMaxHeight={300}
        virtualizedItemHeight={36}
      />
    );

    expect(screen.getAllByRole('option').length).toBeLessThan(50);
    expect(screen.getAllByRole('group').length).toBeGreaterThan(0);
    expect(screen.getByRole('group', { name: 'Group 0' })).toBeInTheDocument();
  });

  it('scrolls to later groups and options', async () => {
    render(
      <OptionList
        data={groupedData}
        virtualized
        virtualizedMaxHeight={300}
        virtualizedItemHeight={36}
      />
    );

    fireEvent.scroll(screen.getByRole('listbox'), { target: { scrollTop: 9936 } });

    expect(await screen.findByRole('option', { name: 'Option 250' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Group 25' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <OptionList data={groupedData} virtualized virtualizedMaxHeight={300} />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
