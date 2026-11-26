import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { EmojiPicker } from '@nebular-react/core';

describe('EmojiPicker', () => {
  it('EmojiPicker_Render_ShouldDisplayLabelDescriptionAndValue', () => {
    render(<EmojiPicker label="Emoji" description="Pick an emoji" defaultValue="😀" />);

    expect(screen.getByLabelText('Emoji')).toHaveValue('😀 Grinning face');
    expect(screen.getByText('Pick an emoji')).toBeInTheDocument();
  });

  it('EmojiPicker_Open_ShouldShowTheListboxAndCloseOnEscape', async () => {
    const user = userEvent.setup();

    render(<EmojiPicker ariaLabel="Emoji" />);

    const trigger = screen.getByLabelText('Emoji');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Emoji picker' });

    expect(within(dialog).getByRole('listbox')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('EmojiPicker_Search_ShouldFilterByNameAndKeyword', async () => {
    const user = userEvent.setup();

    render(<EmojiPicker ariaLabel="Emoji" nothingFoundMessage="No emoji here" />);

    await user.click(screen.getByLabelText('Emoji'));
    await screen.findByRole('dialog');

    const search = screen.getByLabelText('Search emojis');

    await user.type(search, 'pizza');

    expect(screen.getByRole('option', { name: 'Pizza' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Grinning face' })).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'happy');

    expect(screen.getByRole('option', { name: 'Grinning face' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Pizza' })).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'zzzzz');

    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('No emoji here')).toBeInTheDocument();
  });

  it('EmojiPicker_Category_ShouldShowOnlyTheSelectedCategory', async () => {
    const user = userEvent.setup();

    render(<EmojiPicker ariaLabel="Emoji" />);

    await user.click(screen.getByLabelText('Emoji'));
    await screen.findByRole('dialog');

    expect(screen.getByRole('option', { name: 'Grinning face' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Nature' }));

    expect(screen.getByRole('button', { name: 'Nature' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('option', { name: 'Panda' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Pizza' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Food' }));

    expect(screen.getByRole('option', { name: 'Pizza' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Panda' })).not.toBeInTheDocument();
  });

  it('EmojiPicker_Select_ShouldEmitTheEmojiAndCloseThePanel', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<EmojiPicker ariaLabel="Emoji" onChange={onChange} />);

    await user.click(screen.getByLabelText('Emoji'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('option', { name: 'Grinning face' }));

    expect(onChange).toHaveBeenCalledWith('😀');
    expect(screen.getByLabelText('Emoji')).toHaveValue('😀 Grinning face');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Grinning face selected');
  });

  it('EmojiPicker_Clear_ShouldEmitNullAndResetTheTrigger', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<EmojiPicker ariaLabel="Emoji" defaultValue="😀" clearable onChange={onChange} />);

    expect(screen.getByLabelText('Emoji')).toHaveValue('😀 Grinning face');

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByLabelText('Emoji')).toHaveValue('');
  });

  it('EmojiPicker_Keyboard_ShouldNavigateWithArrowsHomeEndAndSelect', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<EmojiPicker ariaLabel="Emoji" onChange={onChange} />);

    const trigger = screen.getByLabelText('Emoji');
    act(() => trigger.focus());
    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');

    expect(screen.getByLabelText('Search emojis')).toHaveFocus();

    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Grinning face' })).toHaveAttribute(
      'data-active',
      'true'
    );

    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('😀');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');
    await user.keyboard('{End}');

    const options = screen.getAllByRole('option');
    const lastOption = options[options.length - 1];

    expect(lastOption).toHaveAttribute('data-active', 'true');

    await user.keyboard('{Home}');

    expect(options[0]).toHaveAttribute('data-active', 'true');
  });

  it('EmojiPicker_KeyboardWithoutSearch_ShouldUseRovingFocus', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<EmojiPicker ariaLabel="Emoji" searchable={false} onChange={onChange} />);

    await user.click(screen.getByLabelText('Emoji'));
    await screen.findByRole('dialog');

    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveFocus();

    await user.keyboard('{ArrowDown}');

    const firstOption = screen.getByRole('option', { name: 'Grinning face' });
    expect(firstOption).toHaveFocus();
    expect(firstOption).toHaveAttribute('tabindex', '0');

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('😃');
  });

  it('EmojiPicker_Controlled_ShouldKeepTheValueUntilTheParentUpdatesIt', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<EmojiPicker ariaLabel="Emoji" value="😀" onChange={onChange} />);

    await user.click(screen.getByLabelText('Emoji'));
    await screen.findByRole('dialog');
    await user.type(screen.getByLabelText('Search emojis'), 'pizza');
    await user.click(screen.getByRole('option', { name: 'Pizza' }));

    expect(onChange).toHaveBeenCalledWith('🍕');
    expect(screen.getByLabelText('Emoji')).toHaveValue('😀 Grinning face');
  });

  it('EmojiPicker_Uncontrolled_ShouldUpdateTheInternalValue', async () => {
    const user = userEvent.setup();

    render(<EmojiPicker ariaLabel="Emoji" defaultValue="😀" />);

    await user.click(screen.getByLabelText('Emoji'));
    await screen.findByRole('dialog');
    await user.type(screen.getByLabelText('Search emojis'), 'pizza');
    await user.click(screen.getByRole('option', { name: 'Pizza' }));

    expect(screen.getByLabelText('Emoji')).toHaveValue('🍕 Pizza');
  });

  it('EmojiPicker_CustomCategories_ShouldRenderTheProvidedEmojis', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <EmojiPicker
        ariaLabel="Emoji"
        onChange={onChange}
        categories={[
          {
            id: 'space',
            label: 'Space',
            emojis: [
              { emoji: '🚀', name: 'Rocket', keywords: ['ship'], category: 'space' },
              { emoji: '🛰️', name: 'Satellite', keywords: ['orbit'], category: 'space' }
            ]
          }
        ]}
      />
    );

    await user.click(screen.getByLabelText('Emoji'));
    await screen.findByRole('dialog');

    expect(screen.getByRole('button', { name: 'Space' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('option', { name: 'Rocket' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Search emojis'), 'orbit');
    await user.click(screen.getByRole('option', { name: 'Satellite' }));

    expect(onChange).toHaveBeenCalledWith('🛰️');
  });

  it('EmojiPicker_RecentLimit_ShouldListRecentlyUsedEmojis', async () => {
    const user = userEvent.setup();

    render(<EmojiPicker ariaLabel="Emoji" recentLimit={2} />);

    await user.click(screen.getByLabelText('Emoji'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('option', { name: 'Grinning face' }));

    await user.click(screen.getByLabelText('Emoji'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Recent' }));

    expect(screen.getByRole('button', { name: 'Recent' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('option', { name: 'Grinning face' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Pizza' })).not.toBeInTheDocument();
  });

  it('EmojiPicker_Disabled_ShouldNotOpenThePanel', async () => {
    const user = userEvent.setup();

    render(<EmojiPicker ariaLabel="Emoji" disabled />);

    const trigger = screen.getByLabelText('Emoji');

    expect(trigger).toBeDisabled();

    await user.click(trigger);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('EmojiPicker_Accessibility_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <EmojiPicker
        label="Emoji"
        description="Pick an emoji"
        defaultValue="😀"
        clearable
        searchable
      />
    );

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByLabelText('Emoji'));
    await screen.findByRole('dialog');

    const pane = document.querySelector('.overlay-pane') as HTMLElement;
    expect(await axe(pane)).toHaveNoViolations();
  });
});
