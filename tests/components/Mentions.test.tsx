import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Mentions } from '@nebular-react/core';

const people = [
  { id: 'ana', label: 'Ana Silva', avatar: <span>AS</span> },
  { id: 'bruno', label: 'Bruno Costa' },
  { id: 'carla', label: 'Carla Dias' }
];

const crowd = Array.from({ length: 8 }, (_, index) => ({
  id: `person-${index}`,
  label: `Person ${index}`
}));

describe('Mentions', () => {
  it('Mentions_Trigger_ShouldOpenSuggestionsWithEveryItem', async () => {
    const user = userEvent.setup();

    render(<Mentions data={people} ariaLabel="Comment" />);

    const textarea = screen.getByRole('combobox', { name: 'Comment' });
    await user.type(textarea, 'Hello @');

    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('option', { name: /Ana Silva/ })).toBeInTheDocument();
    expect(textarea).toHaveAttribute('aria-expanded', 'true');
  });

  it('Mentions_Query_ShouldFilterSuggestionsAndReportSearch', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();

    render(<Mentions data={people} onSearch={onSearch} ariaLabel="Comment" />);

    const textarea = screen.getByRole('combobox', { name: 'Comment' });
    await user.type(textarea, '@an');

    expect(screen.getByRole('option', { name: /Ana Silva/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Bruno Costa/ })).not.toBeInTheDocument();
    expect(onSearch).toHaveBeenLastCalledWith('an');
  });

  it('Mentions_MaxSuggestions_ShouldLimitRenderedOptions', async () => {
    const user = userEvent.setup();

    render(<Mentions data={crowd} maxSuggestions={2} ariaLabel="Comment" />);

    await user.type(screen.getByRole('combobox', { name: 'Comment' }), '@');

    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('Mentions_Keyboard_ShouldMoveActiveOptionAndInsertOnEnter', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Mentions data={people} onChange={onChange} ariaLabel="Comment" />);

    const textarea = screen.getByRole('combobox', { name: 'Comment' });
    await user.type(textarea, 'Hi @');

    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowUp}');
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenLastCalledWith('Hi @Bruno Costa ');
    expect(textarea).toHaveValue('Hi @Bruno Costa ');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Mentions_Escape_ShouldCloseSuggestionsWithoutChangingValue', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Mentions data={people} onChange={onChange} ariaLabel="Comment" />);

    const textarea = screen.getByRole('combobox', { name: 'Comment' });
    await user.type(textarea, '@an');

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(textarea).toHaveValue('@an');
    expect(textarea).toHaveAttribute('aria-expanded', 'false');
  });

  it('Mentions_OutsideClick_ShouldCloseSuggestions', async () => {
    const user = userEvent.setup();

    render(<Mentions data={people} ariaLabel="Comment" />);

    await user.type(screen.getByRole('combobox', { name: 'Comment' }), '@an');
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Mentions_OptionClick_ShouldInsertTriggerAndLabel', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Mentions data={people} onChange={onChange} ariaLabel="Comment" />);

    const textarea = screen.getByRole('combobox', { name: 'Comment' });
    await user.type(textarea, '@an');

    await user.click(screen.getByRole('option', { name: /Ana Silva/ }));

    expect(onChange).toHaveBeenLastCalledWith('@Ana Silva ');
    expect(textarea).toHaveValue('@Ana Silva ');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Mentions_Controlled_ShouldKeepValueAndEmitInsertedText', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Mentions value="Hello @an" data={people} onChange={onChange} ariaLabel="Comment" />);

    const textarea = screen.getByRole('combobox', { name: 'Comment' });

    expect(textarea).toHaveValue('Hello @an');
    expect(await screen.findByRole('option', { name: /Ana Silva/ })).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: /Ana Silva/ }));

    expect(onChange).toHaveBeenLastCalledWith('Hello @Ana Silva ');
    expect(textarea).toHaveValue('Hello @an');
  });

  it('Mentions_Disabled_ShouldNotOpenSuggestions', async () => {
    const user = userEvent.setup();

    render(<Mentions data={people} disabled defaultValue="Hi @an" ariaLabel="Comment" />);

    const textarea = screen.getByRole('combobox', { name: 'Comment' });

    expect(textarea).toBeDisabled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.type(textarea, 'a');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Mentions_LabelAndError_ShouldRenderAccessibleField', () => {
    render(<Mentions data={people} label="Comment" error="Comment is required" />);

    expect(screen.getByLabelText('Comment')).toBeInTheDocument();
    expect(screen.getByText('Comment is required')).toBeInTheDocument();
  });

  it('Mentions_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <Mentions data={people} defaultValue="Hi @an" ariaLabel="Comment" />
    );

    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
