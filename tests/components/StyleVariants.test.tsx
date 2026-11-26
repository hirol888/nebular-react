import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SelectAppearance } from '@nebular-react/styles';
import { Badge, Button, Select, type BadgePosition } from '@nebular-react/core';

const POSITIONS: BadgePosition[] = [
  'top left',
  'top right',
  'bottom left',
  'bottom right',
  'center right',
  'center left',
  'top start',
  'top end',
  'bottom start',
  'bottom end',
  'center start',
  'center end'
];

describe('Badge style variants', () => {
  it.each(POSITIONS)('renders the %s position', (position) => {
    render(<Badge text="9" position={position} />);

    expect(screen.getByText('9')).toHaveClass(`position-${position.split(' ')[0]}`);
  });

  it('renders dot mode without text', () => {
    render(<Badge text="9" dotMode status="danger" />);

    expect(screen.queryByText('9')).not.toBeInTheDocument();
  });
});

describe('Button style variants', () => {
  it.each(['filled', 'ghost', 'hero', 'outline'] as const)(
    'renders the %s appearance',
    (appearance) => {
      render(
        <Button appearance={appearance} status="primary" size="small" shape="round">
          Action
        </Button>
      );

      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    }
  );

  it('falls back to no appearance styles for an unknown appearance', () => {
    render(<Button appearance={'default' as never}>Action</Button>);

    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('handles prefix, suffix and icon-only layouts', () => {
    const { rerender } = render(<Button prefixIcon={<span>+</span>}>Add</Button>);
    expect(screen.getByRole('button', { name: /Add/ })).toBeInTheDocument();

    rerender(<Button suffixIcon={<span>+</span>}>Add</Button>);
    expect(screen.getByRole('button', { name: /Add/ })).toBeInTheDocument();

    rerender(
      <Button prefixIcon={<span>+</span>} suffixIcon={<span>+</span>}>
        Add
      </Button>
    );
    expect(screen.getByRole('button', { name: /Add/ })).toBeInTheDocument();

    rerender(<Button prefixIcon={<span>+</span>} aria-label="Add" />);
    expect(screen.getByRole('button', { name: /Add/ })).toBeInTheDocument();
  });

  it('renders full width and disabled states', () => {
    render(
      <Button fullWidth disabled>
        Disabled
      </Button>
    );

    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });
});

describe('Select style variants', () => {
  const options = [
    { type: 'option' as const, label: 'One', value: 'one' },
    { type: 'option' as const, label: 'Two', value: 'two' }
  ];

  it.each(['outline', 'filled', 'hero'] as const)('renders the %s appearance', (appearance) => {
    render(
      <Select
        options={options}
        appearance={appearance}
        placeholder="Pick one"
        icon={<span>@</span>}
        size="small"
        shape="round"
        status="primary"
      />
    );

    expect(screen.getByRole('button', { name: 'Pick one' })).toBeInTheDocument();
  });

  it('falls back to no appearance styles for an unknown appearance', () => {
    render(
      <Select options={options} appearance={'default' as SelectAppearance} placeholder="Pick one" />
    );

    expect(screen.getByRole('button', { name: 'Pick one' })).toBeInTheDocument();
  });

  it('renders an empty value without a placeholder and the opened state', async () => {
    const user = userEvent.setup();

    render(<Select options={options} />);

    const trigger = screen.getAllByRole('button')[0];
    await user.click(trigger);

    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });
});
