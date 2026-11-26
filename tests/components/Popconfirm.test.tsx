import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Button, Popconfirm } from '@nebular-react/core';

describe('Popconfirm', () => {
  it('opens the confirmation panel when the trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Popconfirm message="This action cannot be undone." onConfirm={jest.fn()}>
        <Button>Remove item</Button>
      </Popconfirm>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove item' }));

    expect(screen.getByRole('dialog', { name: 'This action cannot be undone.' })).toHaveTextContent(
      'This action cannot be undone.'
    );
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onConfirm and closes after confirmation', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    const onOpenChange = jest.fn();

    render(
      <Popconfirm
        message="Delete this record?"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
        confirmLabel="Delete"
      >
        <Button>Remove record</Button>
      </Popconfirm>
    );

    await user.click(screen.getByRole('button', { name: 'Remove record' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onCancel and closes when cancelled', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(
      <Popconfirm message="Delete this record?" onConfirm={jest.fn()} onCancel={onCancel}>
        <Button>Remove record</Button>
      </Popconfirm>
    );

    await user.click(screen.getByRole('button', { name: 'Remove record' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports a controlled open state', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    render(
      <Popconfirm
        opened
        message="Delete this record?"
        onConfirm={jest.fn()}
        onOpenChange={onOpenChange}
      >
        <Button>Remove record</Button>
      </Popconfirm>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('starts opened when defaultOpened is set', () => {
    render(
      <Popconfirm defaultOpened message="Delete this record?" onConfirm={jest.fn()}>
        <Button>Remove record</Button>
      </Popconfirm>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();

    render(
      <Popconfirm disabled message="Delete this record?" onConfirm={jest.fn()}>
        <Button>Remove record</Button>
      </Popconfirm>
    );

    await user.click(screen.getByRole('button', { name: 'Remove record' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    render(
      <Popconfirm message="Delete this record?" onConfirm={jest.fn()} onOpenChange={onOpenChange}>
        <Button>Remove record</Button>
      </Popconfirm>
    );

    await user.click(screen.getByRole('button', { name: 'Remove record' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('has no accessibility violations', async () => {
    render(
      <Popconfirm
        defaultOpened
        title="Delete record"
        message="This action cannot be undone."
        onConfirm={jest.fn()}
      >
        <Button>Remove record</Button>
      </Popconfirm>
    );

    expect(await axe(screen.getByRole('dialog'))).toHaveNoViolations();
  });
});
