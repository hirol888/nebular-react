import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { InlineEdit } from '@nebular-react/core';

describe('InlineEdit', () => {
  it('commits with Enter and cancels with Escape, returning focus to the preview', async () => {
    const user = userEvent.setup();
    const onCommit = jest.fn();
    const onChange = jest.fn();
    const { container } = render(
      <InlineEdit
        label="Project name"
        defaultValue="Original"
        onChange={onChange}
        onCommit={onCommit}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Edit Project name' }));
    const input = screen.getByRole('textbox', { name: 'Project name' });
    expect(input).toHaveFocus();
    await user.clear(input);
    await user.type(input, 'Updated{Enter}');
    expect(onCommit).toHaveBeenCalledWith('Updated');
    expect(onChange).toHaveBeenCalledWith('Updated');
    const preview = screen.getByRole('button', { name: 'Edit Project name' });
    expect(preview).toHaveTextContent('Updated');
    expect(preview).toHaveFocus();

    await user.keyboard('{Enter}');
    await user.type(screen.getByRole('textbox'), ' draft{Escape}');
    expect(preview).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Project name' })).toHaveTextContent('Updated');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('keeps a failing asynchronous edit available for retry and defers changes until success', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onCommit = jest
      .fn()
      .mockRejectedValueOnce(new Error('Rejected'))
      .mockResolvedValueOnce(undefined);
    render(
      <InlineEdit
        label="Description"
        defaultValue="Before"
        multiline
        onChange={onChange}
        onCommit={onCommit}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Edit Description' }));
    const input = screen.getByRole('textbox', { name: 'Description' });
    await user.clear(input);
    await user.type(input, 'First{Enter}Second');
    expect(onCommit).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save');
    expect(input).toHaveValue('First\nSecond');
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('button', { name: 'Edit Description' })).toHaveTextContent(
      'First Second'
    );
    expect(onChange).toHaveBeenCalledWith('First\nSecond');
  });
});
