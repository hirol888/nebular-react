import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AvailabilityEditor, validateAvailability } from '@nebular-react/core';

it('validates overlap, order, dates and time zone without rejecting adjacent times', () => {
  expect(
    validateAvailability({
      timeZone: 'Invalid/Zone',
      week: {
        monday: [
          { start: '09:00', end: '10:30' },
          { start: '10:00', end: '12:00' },
          { start: '12:00', end: '13:00' },
          { start: '16:00', end: '15:00' }
        ],
        sunday: [{ start: '00:00', end: '00:00' }]
      },
      overrides: [
        { date: '2026-02-29', intervals: [] },
        { date: '2026-12-25', intervals: [] },
        { date: '2026-12-25', intervals: [] }
      ]
    }).map((issue) => issue.code)
  ).toEqual(['timeZone', 'order', 'overlap', 'date', 'duplicateDate']);
});

it('edits weekly times, adds date overrides and preserves its original value', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  const initial = { timeZone: 'UTC', week: {}, overrides: [] };
  render(<AvailabilityEditor defaultValue={initial} onChange={onChange} />);

  const monday = screen.getByRole('group', { name: 'Monday' });
  await user.click(within(monday).getByRole('button', { name: 'Add time interval' }));
  await user.click(within(monday).getByRole('button', { name: 'Add time interval' }));
  fireEvent.change(within(monday).getByLabelText('Start 2'), { target: { value: '09:30' } });
  expect(within(monday).getByRole('alert')).toHaveTextContent('Time intervals overlap');
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      week: {
        monday: [
          { start: '09:00', end: '10:00' },
          { start: '09:30', end: '11:00' }
        ]
      }
    }),
    [expect.objectContaining({ code: 'overlap', day: 'monday' })]
  );

  fireEvent.change(screen.getByLabelText('Override date'), { target: { value: '2026-12-25' } });
  await user.click(screen.getByRole('button', { name: 'Add date override' }));
  expect(screen.getByRole('group', { name: /2026/ })).toHaveTextContent('Unavailable');
  expect(onChange.mock.lastCall?.[0].overrides).toEqual([{ date: '2026-12-25', intervals: [] }]);
  expect(initial).toEqual({ timeZone: 'UTC', week: {}, overrides: [] });
});
