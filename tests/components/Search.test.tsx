import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Search } from '@nebular-react/core';

function getSearchField() {
  return document.querySelector('.nebular-search-searchField') as HTMLElement | null;
}

describe('Search', () => {
  it('does not render the search field until it is opened', () => {
    render(<Search />);

    expect(screen.getByRole('button', { name: 'Open search' })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    expect(getSearchField()).toBeNull();
  });

  it('opens the search field, shows the hint and focuses the input', async () => {
    const user = userEvent.setup();
    const onSearchOpen = jest.fn();

    render(<Search onSearchOpen={onSearchOpen} />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    const input = await screen.findByPlaceholderText('Search...');

    expect(input).toHaveFocus();
    expect(screen.getByText('Hit enter to search')).toBeInTheDocument();
    expect(getSearchField()).toHaveClass('show');
    expect(onSearchOpen).toHaveBeenCalledTimes(1);
  });

  it('reports input changes and submits the term on Enter', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    const onInputChange = jest.fn();

    render(<Search onSearch={onSearch} onInputChange={onInputChange} />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    const input = await screen.findByPlaceholderText('Search...');

    await user.type(input, 'nebula');

    expect(input).toHaveValue('nebula');
    expect(onInputChange).toHaveBeenLastCalledWith('nebula');

    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('nebula');

    await waitFor(() => expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument());
  });

  it('supports custom placeholder and hint text', async () => {
    const user = userEvent.setup();

    render(<Search placeholder="Find a nebula" hint="Press enter" />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    expect(await screen.findByPlaceholderText('Find a nebula')).toBeInTheDocument();
    expect(screen.getByText('Press enter')).toBeInTheDocument();
  });

  it('clears the input value', async () => {
    const user = userEvent.setup();
    const onInputChange = jest.fn();

    render(<Search onInputChange={onInputChange} />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    const input = await screen.findByPlaceholderText('Search...');

    await user.type(input, 'nebula');
    await user.clear(input);

    expect(input).toHaveValue('');
    expect(onInputChange).toHaveBeenLastCalledWith('');
  });

  it('closes through the close button', async () => {
    const user = userEvent.setup();
    const onSearchClose = jest.fn();

    render(<Search onSearchClose={onSearchClose} />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));
    await screen.findByPlaceholderText('Search...');

    await user.click(screen.getByRole('button', { name: 'Close search' }));

    expect(onSearchClose).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument());
  });

  it('closes on Escape and reports the close event', async () => {
    const user = userEvent.setup();
    const onSearchClose = jest.fn();

    render(<Search onSearchClose={onSearchClose} />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));
    await screen.findByPlaceholderText('Search...');

    await user.keyboard('{Escape}');

    expect(onSearchClose).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument());
  });

  it('starts with an empty field every time it is opened', async () => {
    const user = userEvent.setup();

    render(<Search />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    let input = await screen.findByPlaceholderText('Search...');

    await user.type(input, 'nebula');
    expect(input).toHaveValue('nebula');

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    input = await screen.findByPlaceholderText('Search...');
    expect(input).toHaveValue('');
  });

  it('toggles the layout classes for the configured type', async () => {
    const user = userEvent.setup();

    render(
      <div className="nebular-layout-root" data-testid="layout">
        <Search type="rotate-layout" />
      </div>
    );

    const layout = screen.getByTestId('layout');

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    expect(layout).toHaveClass('rotate-layout');

    await waitFor(() => expect(layout).toHaveClass('with-search'));

    await user.keyboard('{Escape}');

    await waitFor(() => expect(layout).not.toHaveClass('with-search'));
    await waitFor(() => expect(layout).not.toHaveClass('rotate-layout'));
  });

  it('does not add an undefined class to the layout when no type is set', async () => {
    const user = userEvent.setup();

    render(
      <div className="nebular-layout-root" data-testid="layout">
        <Search />
      </div>
    );

    const layout = screen.getByTestId('layout');

    await user.click(screen.getByRole('button', { name: 'Open search' }));
    await screen.findByPlaceholderText('Search...');

    expect(layout.className).not.toContain('undefined');

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument());
    expect(layout.className).not.toContain('undefined');
  });

  it('applies the configured search type class to the field', async () => {
    const user = userEvent.setup();

    render(<Search type="modal-zoomin" />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    expect(getSearchField()).toHaveClass('modal-zoomin', 'show');
  });

  it('has no accessibility violations when open', async () => {
    const user = userEvent.setup();

    render(<Search />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));
    await screen.findByPlaceholderText('Search...');

    expect(await axe(getSearchField() as HTMLElement)).toHaveNoViolations();
  });
});

describe('Search controlled value', () => {
  it('renders the provided value when it is controlled', async () => {
    const user = userEvent.setup();

    render(<Search value="nebula" onChange={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    expect(await screen.findByPlaceholderText('Search...')).toHaveValue('nebula');
  });

  it('reports typed changes without mutating the controlled value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Search value="nebula" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    const input = await screen.findByPlaceholderText('Search...');

    await user.type(input, 'x');

    expect(onChange).toHaveBeenLastCalledWith('nebulax');
    expect(input).toHaveValue('nebula');
  });

  it('follows value updates from the consumer', async () => {
    const user = userEvent.setup();

    function ControlledSearch() {
      const [value, setValue] = useState('neb');

      return <Search value={value} onChange={setValue} />;
    }

    render(<ControlledSearch />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    const input = await screen.findByPlaceholderText('Search...');

    expect(input).toHaveValue('neb');

    await user.type(input, 'ula');

    expect(input).toHaveValue('nebula');
  });

  it('clears the field when the consumer resets the value', async () => {
    const user = userEvent.setup();

    const { rerender } = render(<Search value="nebula" onChange={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    const input = await screen.findByPlaceholderText('Search...');

    expect(input).toHaveValue('nebula');

    rerender(<Search value="" onChange={jest.fn()} />);

    expect(input).toHaveValue('');
  });

  it('submits the controlled value on Enter', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();

    render(<Search value="nebula" onChange={jest.fn()} onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));
    await screen.findByPlaceholderText('Search...');

    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('nebula');
  });

  it('reports input changes in uncontrolled mode through onChange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onInputChange = jest.fn();

    render(<Search onChange={onChange} onInputChange={onInputChange} />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    const input = await screen.findByPlaceholderText('Search...');

    await user.type(input, 'neb');

    expect(onChange).toHaveBeenLastCalledWith('neb');
    expect(onInputChange).toHaveBeenLastCalledWith('neb');
    expect(input).toHaveValue('neb');
  });

  it('reports clearing the field through onChange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Search onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    const input = await screen.findByPlaceholderText('Search...');

    await user.type(input, 'neb');
    onChange.mockClear();

    await user.clear(input);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('');
    expect(input).toHaveValue('');
  });

  it('starts over with an empty uncontrolled field after reopening', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Search onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    let input = await screen.findByPlaceholderText('Search...');

    await user.type(input, 'nebula');
    expect(input).toHaveValue('nebula');

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    input = await screen.findByPlaceholderText('Search...');
    expect(input).toHaveValue('');
  });
});
