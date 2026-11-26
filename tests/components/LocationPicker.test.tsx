import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { LocationPicker } from '@nebular-react/core';
import type { LocationPickerResult } from '@nebular-react/core';

describe('LocationPicker', () => {
  it('edits coordinates with validation and emits only a complete point', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(<LocationPicker onChange={onChange} />);
    const latitude = screen.getByRole('textbox', { name: 'Latitude' });
    const longitude = screen.getByRole('textbox', { name: 'Longitude' });

    await user.type(latitude, '91');
    await user.type(longitude, '-46,6333');
    await user.click(screen.getByRole('button', { name: 'Apply coordinates' }));
    expect(latitude).toHaveAttribute('aria-invalid', 'true');
    expect(latitude).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();

    await user.clear(latitude);
    await user.type(latitude, '-23.5505{Enter}');
    expect(onChange).toHaveBeenLastCalledWith({ latitude: -23.5505, longitude: -46.6333 });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('supports controlled selection and a keyboard-operable map adapter', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const next = { latitude: 47.61, longitude: -122.33 };
    const { rerender } = render(
      <LocationPicker
        value={null}
        onChange={onChange}
        renderMap={({ onSelect }) => (
          <button type="button" onClick={() => onSelect(next)}>
            Pick marker
          </button>
        )}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Pick marker' }));
    expect(onChange).toHaveBeenCalledWith(next);
    expect(screen.getByRole('textbox', { name: 'Latitude' })).toHaveValue('');
    rerender(<LocationPicker value={next} onChange={onChange} clearable />);
    expect(screen.getByRole('textbox', { name: 'Latitude' })).toHaveValue('47.61');
    await user.click(screen.getByRole('button', { name: 'Clear location' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('cancels superseded address searches and returns focus after a result is picked', async () => {
    const user = userEvent.setup();
    const requests = new Map<
      string,
      {
        signal: AbortSignal;
        resolve(results: readonly LocationPickerResult[]): void;
      }
    >();
    const onChange = jest.fn();
    render(
      <LocationPicker
        onChange={onChange}
        searchLocations={(query, { signal }) =>
          new Promise((resolve) => {
            requests.set(query, { signal, resolve });
          })
        }
      />
    );
    const search = screen.getByRole('searchbox', { name: 'Address or place' });
    await user.type(search, 'Old{Enter}');
    await user.clear(search);
    await user.type(search, 'New{Enter}');
    expect(requests.get('Old')?.signal.aborted).toBe(true);

    const newest = { id: 'sea', label: 'Seattle', latitude: 47.61, longitude: -122.33 };
    await act(async () => {
      requests.get('New')?.resolve([newest]);
      requests.get('Old')?.resolve([{ ...newest, label: 'Stale' }]);
    });
    expect(screen.queryByText('Stale')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Seattle' }));
    expect(onChange).toHaveBeenCalledWith({ latitude: 47.61, longitude: -122.33 });
    expect(search).toHaveFocus();
  });
});
