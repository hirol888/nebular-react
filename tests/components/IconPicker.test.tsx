import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NebularProvider } from '@nebular-react/styles';
import { IconPicker } from '@nebular-react/core';

const packs = new Map([
  [
    'custom',
    new Map([
      ['add', '<svg />'],
      ['remove', '<svg />']
    ])
  ],
  [
    'secondary',
    new Map([
      ['add', '<svg />'],
      ['star', '<svg />']
    ])
  ]
]);

it('searches registered icons and selects the pack-qualified result by keyboard', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(
    <NebularProvider svgIconPacks={packs}>
      <IconPicker onChange={onChange} />
    </NebularProvider>
  );

  await user.selectOptions(screen.getByRole('combobox', { name: 'Icon pack' }), 'secondary');
  await user.type(screen.getByRole('searchbox', { name: 'Search icons' }), 'add');
  const option = screen.getByRole('option', { name: 'add (secondary)' });
  expect(screen.queryByRole('option', { name: 'add (custom)' })).not.toBeInTheDocument();
  expect(option.querySelector('svg')).toBeInTheDocument();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(onChange).toHaveBeenCalledWith({ pack: 'secondary', name: 'add' });
  expect(option).toHaveAttribute('aria-selected', 'true');
});

it('reads the essentials catalog from the theme and lets consumers control the choice', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(
    <IconPicker
      packs={['nebular-essentials']}
      value={{ name: 'checkmark-outline', pack: 'nebular-essentials' }}
      onChange={onChange}
    />
  );

  await user.click(screen.getByRole('option', { name: 'close-outline (nebular-essentials)' }));
  expect(onChange).toHaveBeenCalledWith({ name: 'close-outline', pack: 'nebular-essentials' });
  expect(
    screen.getByRole('option', { name: 'checkmark-outline (nebular-essentials)' })
  ).toHaveAttribute('aria-selected', 'true');
});
