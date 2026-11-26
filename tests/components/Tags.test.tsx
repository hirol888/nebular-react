import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Tags } from '@nebular-react/core';
import type { TagType } from '@nebular-react/core';

function getRemoveIcons(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('.nebular-tag-tagRemove'));
}

function getInput(container: HTMLElement) {
  return container.querySelector('input') as HTMLInputElement;
}

describe('Tags', () => {
  it('renders tags as options inside a labelled listbox', () => {
    render(<Tags aria-label="Technologies" tags={['React', 'Vue']} />);

    const listbox = screen.getByRole('listbox', { name: 'Technologies' });

    expect(within(listbox).getAllByRole('option')).toHaveLength(2);
    expect(screen.getByRole('option', { name: 'React' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('option', { name: 'Vue' })).toHaveAttribute('aria-selected', 'false');
  });

  it('selects and deselects a tag when it is clicked', async () => {
    const user = userEvent.setup();
    render(<Tags aria-label="Technologies" tags={['React', 'Vue']} />);

    const react = screen.getByRole('option', { name: 'React' });

    await user.click(react);
    expect(react).toHaveAttribute('aria-selected', 'true');
    expect(react).toHaveClass('nebular-tag-selected');

    await user.click(react);
    expect(react).toHaveAttribute('aria-selected', 'false');
    expect(react).not.toHaveClass('nebular-tag-selected');
  });

  it('removes a tag through its remove icon without selecting it', async () => {
    const user = userEvent.setup();
    const onTagRemove = jest.fn();
    const { container } = render(
      <Tags aria-label="Technologies" tags={['React', 'Vue']} onTagRemove={onTagRemove} />
    );

    const removeIcons = getRemoveIcons(container);

    expect(removeIcons).toHaveLength(2);

    await user.click(removeIcons[1]);

    expect(onTagRemove).toHaveBeenCalledTimes(1);
    expect(onTagRemove).toHaveBeenCalledWith('Vue');
    expect(screen.getByRole('option', { name: 'Vue' })).toHaveAttribute('aria-selected', 'false');
  });

  it('does not remove tags that are not removable', async () => {
    const user = userEvent.setup();
    const tags: TagType[] = [{ tag: 'Fixed', removable: false }];
    const { container } = render(
      <Tags aria-label="Technologies" tags={tags} onTagRemove={jest.fn()} />
    );

    expect(getRemoveIcons(container)).toHaveLength(0);

    await user.click(screen.getByRole('option', { name: 'Fixed' }));

    expect(screen.getByRole('option', { name: 'Fixed' })).toHaveAttribute('aria-selected', 'true');
  });

  it('activates the last tag with Backspace and removes it on the next press', async () => {
    const user = userEvent.setup();
    const onTagRemove = jest.fn();
    render(<Tags aria-label="Technologies" tags={['React', 'Vue']} onTagRemove={onTagRemove} />);

    const listbox = screen.getByRole('listbox', { name: 'Technologies' });
    const vue = screen.getByRole('option', { name: 'Vue' });

    await user.click(listbox);
    await user.keyboard('{Backspace}');

    expect(vue).toHaveClass('nebular-tag-active');
    expect(onTagRemove).not.toHaveBeenCalled();

    await user.keyboard('{Backspace}');

    expect(onTagRemove).toHaveBeenCalledTimes(1);
    expect(onTagRemove).toHaveBeenCalledWith('Vue');
  });

  it('removes the active tag with Delete', async () => {
    const user = userEvent.setup();
    const onTagRemove = jest.fn();
    render(<Tags aria-label="Technologies" tags={['React', 'Vue']} onTagRemove={onTagRemove} />);

    const react = screen.getByRole('option', { name: 'React' });

    await user.click(react);
    await user.keyboard('{Delete}');

    expect(onTagRemove).toHaveBeenCalledWith('React');
  });

  it('toggles the active tag selection with the space key', async () => {
    const user = userEvent.setup();
    render(<Tags aria-label="Technologies" tags={['React', 'Vue']} />);

    const react = screen.getByRole('option', { name: 'React' });

    await user.click(react);
    expect(react).toHaveAttribute('aria-selected', 'true');

    await user.keyboard(' ');
    expect(react).toHaveAttribute('aria-selected', 'false');

    await user.keyboard(' ');
    expect(react).toHaveAttribute('aria-selected', 'true');
  });

  it('adds a tag on Enter and clears the input', async () => {
    const user = userEvent.setup();
    const onTagAdd = jest.fn();
    const onInputChange = jest.fn();
    const { container } = render(
      <Tags
        aria-label="Technologies"
        tags={['React']}
        withInput
        onTagAdd={onTagAdd}
        onInputChange={onInputChange}
      />
    );

    const input = getInput(container);

    await user.type(input, 'Angular');

    expect(input).toHaveValue('Angular');
    expect(onInputChange).toHaveBeenLastCalledWith('Angular');
    expect(onTagAdd).not.toHaveBeenCalled();

    await user.keyboard('{Enter}');

    expect(onTagAdd).toHaveBeenCalledTimes(1);
    expect(onTagAdd).toHaveBeenCalledWith('Angular');
    expect(input).toHaveValue('');
  });

  it('does not add an empty tag on Enter', async () => {
    const user = userEvent.setup();
    const onTagAdd = jest.fn();
    const { container } = render(
      <Tags aria-label="Technologies" tags={[]} withInput onTagAdd={onTagAdd} />
    );

    await user.click(getInput(container));
    await user.keyboard('{Enter}');

    expect(onTagAdd).not.toHaveBeenCalled();
  });

  it('supports custom separator keys', async () => {
    const user = userEvent.setup();
    const onTagAdd = jest.fn();
    const { container } = render(
      <Tags
        aria-label="Technologies"
        tags={[]}
        withInput
        separatorKeys={[',']}
        onTagAdd={onTagAdd}
      />
    );

    await user.type(getInput(container), 'React,');

    expect(onTagAdd).toHaveBeenCalledWith('React');
  });

  it('does not treat keystrokes inside the input as tag interactions', async () => {
    const user = userEvent.setup();
    const onTagRemove = jest.fn();
    const { container } = render(
      <Tags aria-label="Technologies" tags={['React', 'Vue']} withInput onTagRemove={onTagRemove} />
    );

    const input = getInput(container);

    await user.type(input, 'New tag');
    expect(input).toHaveValue('New tag');

    await user.keyboard('{Backspace}{Backspace}{Backspace}');

    expect(input).toHaveValue('New ');
    expect(onTagRemove).not.toHaveBeenCalled();
    expect(screen.getByRole('option', { name: 'Vue' })).not.toHaveClass('nebular-tag-active');
  });

  it('delegates duplicate handling to the consumer', async () => {
    const user = userEvent.setup();
    const onTagAdd = jest.fn();
    const { container } = render(
      <Tags aria-label="Technologies" tags={['React', 'React']} withInput onTagAdd={onTagAdd} />
    );

    expect(screen.getAllByRole('option')).toHaveLength(2);

    await user.type(getInput(container), 'React{Enter}');

    expect(onTagAdd).toHaveBeenCalledWith('React');
  });

  it('renders the tags provided by the consumer on every render', () => {
    const { rerender } = render(<Tags aria-label="Technologies" tags={['React']} />);

    expect(screen.getAllByRole('option')).toHaveLength(1);

    rerender(<Tags aria-label="Technologies" tags={['React', 'Vue', 'Angular']} />);
    expect(screen.getAllByRole('option')).toHaveLength(3);

    rerender(<Tags aria-label="Technologies" tags={[]} />);
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('disables the input and tag removal when disabled', async () => {
    const user = userEvent.setup();
    const onTagRemove = jest.fn();
    const { container } = render(
      <Tags
        aria-label="Technologies"
        tags={['React']}
        withInput
        disabled
        onTagRemove={onTagRemove}
      />
    );

    const listbox = screen.getByRole('listbox', { name: 'Technologies' });
    const input = getInput(container);

    expect(listbox).toHaveAttribute('aria-disabled', 'true');
    expect(input).toBeDisabled();

    await user.click(getRemoveIcons(container)[0]);
    expect(onTagRemove).not.toHaveBeenCalled();

    await user.click(listbox);
    await user.keyboard('{Backspace}');
    expect(onTagRemove).not.toHaveBeenCalled();
  });

  it('applies size, appearance and status classes to each tag', () => {
    const tags: TagType[] = [
      { tag: 'Outline', appearance: 'outline', status: 'success', removable: true }
    ];
    render(<Tags aria-label="Technologies" size="large" tags={tags} />);

    const option = screen.getByRole('option', { name: 'Outline' });

    expect(option).toHaveClass('size-large', 'appearance-outline', 'status-success');
  });

  it('applies the fullWidth and input classes to the root element', () => {
    const { container } = render(
      <Tags aria-label="Technologies" tags={['React']} withInput fullWidth />
    );
    const root = container.querySelector('.nebular-tags-root') as HTMLElement;

    expect(root).toHaveClass('nebular-tags-fullWidth', 'nebular-tags-tagsWithInput');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Tags aria-label="Technologies" tags={['React', 'Vue']} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Tags with autocomplete', () => {
  const autocompleteData = [
    { label: 'React', value: 'React' },
    { label: 'Vue', value: 'Vue' },
    { label: 'Angular', value: 'Angular' }
  ];

  it('shows suggestions when the input is focused', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Tags
        aria-label="Technologies"
        tags={[]}
        withInput
        withAutocomplete
        autocompleteData={autocompleteData}
      />
    );

    await user.click(getInput(container));

    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Vue' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Angular' })).toBeInTheDocument();
  });

  it('adds the selected suggestion and clears the input', async () => {
    const user = userEvent.setup();
    const onTagAdd = jest.fn();
    const onInputChange = jest.fn();
    const { container } = render(
      <Tags
        aria-label="Technologies"
        tags={[]}
        withInput
        withAutocomplete
        autocompleteData={autocompleteData}
        onTagAdd={onTagAdd}
        onInputChange={onInputChange}
      />
    );

    const input = getInput(container);

    await user.type(input, 'Vue');
    await user.click(screen.getByRole('option', { name: 'Vue' }));

    expect(onTagAdd).toHaveBeenCalledTimes(1);
    expect(onTagAdd).toHaveBeenCalledWith('Vue');
    expect(input).toHaveValue('');
    expect(onInputChange).toHaveBeenLastCalledWith('');
  });

  it('filters suggestions by the current input value', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Tags
        aria-label="Technologies"
        tags={[]}
        withInput
        withAutocomplete
        autocompleteData={autocompleteData}
      />
    );

    await user.type(getInput(container), 're');

    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Vue' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Angular' })).not.toBeInTheDocument();
  });

  it('hides suggestions for tags that were already added', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Tags
        aria-label="Technologies"
        tags={['React']}
        withInput
        withAutocomplete
        autocompleteData={autocompleteData}
      />
    );

    await user.click(getInput(container));

    expect(screen.getAllByRole('option', { name: 'React' })).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Vue' })).toBeInTheDocument();
  });

  it('renders an input and adds suggestions without withInput', async () => {
    const user = userEvent.setup();
    const onTagAdd = jest.fn();
    const { container } = render(
      <Tags
        aria-label="Technologies"
        tags={[]}
        withAutocomplete
        autocompleteData={autocompleteData}
        onTagAdd={onTagAdd}
      />
    );

    const input = getInput(container);

    expect(input).not.toBeNull();

    await user.click(input);
    await user.click(screen.getByRole('option', { name: 'React' }));

    expect(onTagAdd).toHaveBeenCalledWith('React');
  });

  it('keeps adding raw values on Enter', async () => {
    const user = userEvent.setup();
    const onTagAdd = jest.fn();
    const { container } = render(
      <Tags
        aria-label="Technologies"
        tags={[]}
        withInput
        withAutocomplete
        autocompleteData={autocompleteData}
        onTagAdd={onTagAdd}
      />
    );

    const input = getInput(container);

    await user.type(input, 'Custom{Enter}');

    expect(onTagAdd).toHaveBeenCalledTimes(1);
    expect(onTagAdd).toHaveBeenCalledWith('Custom');
    expect(input).toHaveValue('');
  });

  it('does not show or add suggestions when disabled', async () => {
    const user = userEvent.setup();
    const onTagAdd = jest.fn();
    const { container } = render(
      <Tags
        aria-label="Technologies"
        tags={[]}
        withInput
        withAutocomplete
        disabled
        autocompleteData={autocompleteData}
        onTagAdd={onTagAdd}
      />
    );

    const input = getInput(container);

    expect(input).toBeDisabled();

    await user.click(input);

    expect(screen.queryByRole('option', { name: 'Vue' })).not.toBeInTheDocument();
    expect(onTagAdd).not.toHaveBeenCalled();
  });

  it('has no accessibility violations with autocomplete suggestions open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Tags
        aria-label="Technologies"
        tags={[]}
        withInput
        withAutocomplete
        autocompleteData={[
          { label: 'React', value: 'React' },
          { label: 'Vue', value: 'Vue' }
        ]}
      />
    );

    await user.type(getInput(container), 'Re');

    expect(screen.getByRole('listbox', { name: 'Suggestions' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
