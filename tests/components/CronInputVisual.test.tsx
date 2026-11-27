import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CronInput } from '@nebular-react/core';

describe('CronInput visual editor', () => {
  it('keeps custom expressions when opening visual controls and permits an explicit switch', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <CronInput
        label="Schedule"
        locale="en-US"
        defaultValue="0 9 * * MON-FRI"
        withVisualEditor
        presets={false}
        validate={(expression) => expression === '0 9 * * MON-FRI' || expression.endsWith('1,3')}
        renderPreview={(expression) => <p>Preview {expression}</p>}
        onChange={onChange}
      />
    );

    const frequency = screen.getByRole('combobox', { name: 'Frequency' });
    expect(frequency).toHaveValue('custom');
    expect(screen.getByRole('textbox', { name: 'Schedule' })).toHaveValue('0 9 * * MON-FRI');
    expect(screen.getByText('Preview 0 9 * * MON-FRI')).toBeVisible();
    expect(onChange).not.toHaveBeenCalled();
    await user.selectOptions(frequency, 'weekly');
    await user.click(screen.getByRole('checkbox', { name: 'Wednesday' }));
    expect(onChange).toHaveBeenLastCalledWith('0 9 * * 1,3');
    expect(screen.getByText('Preview 0 9 * * 1,3')).toBeVisible();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('shows the consumer validation message and skips the preview for invalid expressions', () => {
    const preview = jest.fn();
    render(
      <CronInput
        label="Agendamento"
        defaultValue="@hourly"
        validate={() => 'Atalhos indisponíveis'}
        renderPreview={preview}
      />
    );

    expect(screen.getByRole('textbox', { name: 'Agendamento' })).toHaveAccessibleDescription(
      'Atalhos indisponíveis'
    );
    expect(preview).not.toHaveBeenCalled();
  });
});
