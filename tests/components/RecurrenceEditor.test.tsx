import React, { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { RecurrenceEditor } from '@nebular-react/core';
import type { SchedulerRecurrence } from '@nebular-react/core';

describe('RecurrenceEditor', () => {
  it('emits mutually exclusive endings and can clear the recurrence', async () => {
    const user = userEvent.setup();
    const change = jest.fn();

    function Example() {
      const [value, setValue] = useState<SchedulerRecurrence | null>({
        frequency: 'weekly',
        count: 3
      });
      return (
        <RecurrenceEditor
          value={value}
          start={new Date('2025-03-08T15:00:00Z')}
          timeZone="UTC"
          onChange={(next) => {
            change(next);
            setValue(next);
          }}
        />
      );
    }

    render(<Example />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Ends' }), 'until');
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2025-03-24' } });
    expect(change).toHaveBeenLastCalledWith({ frequency: 'weekly', until: '2025-03-24' });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Frequency' }), 'none');
    expect(change).toHaveBeenLastCalledWith(null);
    expect(screen.queryByLabelText('End date')).not.toBeInTheDocument();
  });

  it('previews recurring wall-clock times across a daylight saving change', async () => {
    const { container } = render(
      <RecurrenceEditor
        value={{ frequency: 'daily', count: 2 }}
        start={new Date('2025-03-08T15:00:00Z')}
        timeZone="America/New_York"
        locale="en-GB"
        previewCount={3}
      />
    );
    const times = within(screen.getByRole('list', { name: 'Next occurrences' })).getAllByRole(
      'listitem'
    );
    expect(times).toHaveLength(2);
    expect(times[0].querySelector('time')).toHaveAttribute('datetime', '2025-03-08T15:00:00.000Z');
    expect(times[1].querySelector('time')).toHaveAttribute('datetime', '2025-03-09T14:00:00.000Z');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('preserves the exact series start when two instants share the same local time', () => {
    render(
      <RecurrenceEditor
        value={{ frequency: 'daily', count: 2 }}
        start={new Date('2025-11-02T06:30:00Z')}
        timeZone="America/New_York"
      />
    );
    const [first] = within(screen.getByRole('list', { name: 'Next occurrences' })).getAllByRole(
      'listitem'
    );
    expect(first.querySelector('time')).toHaveAttribute('datetime', '2025-11-02T06:30:00.000Z');
  });
});
