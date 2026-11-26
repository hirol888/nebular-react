import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Cascader } from '@nebular-react/core';
import type { CascaderOption } from '@nebular-react/core';

const options: CascaderOption[] = [
  {
    value: 'fruits',
    label: 'Fruits',
    children: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' }
    ]
  },
  {
    value: 'vegetables',
    label: 'Vegetables',
    children: [
      {
        value: 'carrot',
        label: 'Carrot',
        children: [{ value: 'orange-carrot', label: 'Orange Carrot' }]
      },
      { value: 'potato', label: 'Potato', disabled: true }
    ]
  },
  {
    value: 'grains',
    label: 'Grains',
    children: [
      { value: 'rice', label: 'Rice' },
      { value: 'wheat', label: 'Wheat' }
    ]
  },
  { value: 'other', label: 'Other' }
];

async function openCascader(user: ReturnType<typeof userEvent.setup>) {
  const trigger = screen.getByRole('combobox', { name: 'Choose' });

  await user.click(trigger);
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

  return trigger;
}

describe('Cascader searchable', () => {
  it('Cascader_Searchable_ShouldFocusSearchInputOnOpen', async () => {
    const user = userEvent.setup();

    render(<Cascader options={options} ariaLabel="Choose" searchable />);

    const trigger = await openCascader(user);
    const search = screen.getByRole('combobox', { name: 'Search options' });

    expect(search).toBeVisible();
    expect(search).toHaveFocus();
    expect(search).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', { name: 'Level 1' })).toBeInTheDocument();
  });

  it('Cascader_Searchable_ShouldShowFlatResultsWithFullPath', async () => {
    const user = userEvent.setup();

    render(<Cascader options={options} ariaLabel="Choose" searchable />);
    await openCascader(user);

    const search = screen.getByRole('combobox', { name: 'Search options' });
    await user.type(search, 'CARROT');

    const listbox = screen.getByRole('listbox', { name: 'Search results' });
    const results = within(listbox).getAllByRole('option');

    expect(results).toHaveLength(2);
    expect(
      within(listbox).getByRole('option', { name: 'Vegetables / Carrot' })
    ).toBeInTheDocument();
    expect(
      within(listbox).getByRole('option', { name: 'Vegetables / Carrot / Orange Carrot' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('listbox', { name: 'Level 1' })).not.toBeInTheDocument();
    expect(search).toHaveAttribute('aria-expanded', 'true');
  });

  it('Cascader_Searchable_ShouldRespectCustomSeparatorInPath', async () => {
    const user = userEvent.setup();

    render(<Cascader options={options} ariaLabel="Choose" searchable separator=" > " />);
    await openCascader(user);

    await user.type(screen.getByRole('combobox', { name: 'Search options' }), 'apple');

    expect(screen.getByRole('option', { name: 'Fruits > Apple' })).toBeInTheDocument();
  });

  it('Cascader_Searchable_ShouldNavigateWithKeyboardAndSelectLeaf', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Cascader options={options} ariaLabel="Choose" searchable onChange={onChange} />);
    const trigger = await openCascader(user);
    const search = screen.getByRole('combobox', { name: 'Search options' });

    await user.type(search, 'carrot');

    const parent = screen.getByRole('option', { name: 'Vegetables / Carrot' });
    const leaf = screen.getByRole('option', { name: 'Vegetables / Carrot / Orange Carrot' });

    expect(parent).toHaveAttribute('aria-disabled', 'true');

    await user.keyboard('{ArrowDown}');

    expect(leaf).toHaveAttribute('data-active', 'true');
    expect(search).toHaveAttribute('aria-activedescendant', leaf.id);

    await user.keyboard('{Home}');
    expect(leaf).toHaveAttribute('data-active', 'true');

    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(['vegetables', 'carrot', 'orange-carrot']);
    expect(trigger).toHaveValue('Vegetables / Carrot / Orange Carrot');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  });

  it('Cascader_Searchable_ShouldSupportHomeAndEndNavigation', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Cascader options={options} ariaLabel="Choose" searchable onChange={onChange} />);
    await openCascader(user);

    const search = screen.getByRole('combobox', { name: 'Search options' });
    await user.type(search, 'a');

    const apple = screen.getByRole('option', { name: 'Fruits / Apple' });
    const wheat = screen.getByRole('option', { name: 'Grains / Wheat' });

    await user.keyboard('{End}');
    expect(wheat).toHaveAttribute('data-active', 'true');

    await user.keyboard('{Home}');
    expect(apple).toHaveAttribute('data-active', 'true');

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(['fruits', 'apple']);
  });

  it('Cascader_Searchable_ShouldSelectResultByClickAndClearQuery', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Cascader options={options} ariaLabel="Choose" searchable onChange={onChange} />);
    const trigger = await openCascader(user);
    const search = screen.getByRole('combobox', { name: 'Search options' });

    await user.type(search, 'orange');
    await user.click(screen.getByRole('option', { name: 'Vegetables / Carrot / Orange Carrot' }));

    expect(onChange).toHaveBeenCalledWith(['vegetables', 'carrot', 'orange-carrot']);
    expect(trigger).toHaveValue('Vegetables / Carrot / Orange Carrot');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));

    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    expect(screen.getByRole('combobox', { name: 'Search options' })).toHaveValue('');
    expect(screen.getByRole('listbox', { name: 'Level 1' })).toBeInTheDocument();
  });

  it('Cascader_Searchable_ShouldRespectChangeOnSelect', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Cascader
        options={options}
        ariaLabel="Choose"
        searchable
        changeOnSelect
        onChange={onChange}
      />
    );

    const trigger = await openCascader(user);
    const search = screen.getByRole('combobox', { name: 'Search options' });

    await user.type(search, 'fruits');

    const parent = screen.getByRole('option', { name: 'Fruits' });
    expect(parent).not.toHaveAttribute('aria-disabled');

    await user.click(parent);

    expect(onChange).toHaveBeenCalledWith(['fruits']);
    expect(trigger).toHaveValue('Fruits');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  });

  it('Cascader_Searchable_ShouldShowEmptyStateAndRestoreColumnsWhenQueryCleared', async () => {
    const user = userEvent.setup();

    render(<Cascader options={options} ariaLabel="Choose" searchable />);
    await openCascader(user);

    const search = screen.getByRole('combobox', { name: 'Search options' });
    await user.type(search, 'zzzz');

    expect(screen.getByRole('status')).toHaveTextContent('No results');
    expect(screen.queryByRole('listbox', { name: 'Search results' })).not.toBeInTheDocument();

    await user.clear(search);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Level 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Fruits' })).toBeInTheDocument();
  });

  it('Cascader_Searchable_ShouldHaveNoA11yViolations', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Cascader
        options={options}
        label="Location"
        description="Pick a location"
        searchable
        required
      />
    );

    expect(await axe(container)).toHaveNoViolations();

    const trigger = screen.getByRole('combobox', { name: 'Location' });
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    const pane = document.querySelector('.overlay-pane') as HTMLElement;
    expect(await axe(pane)).toHaveNoViolations();

    const search = screen.getByRole('combobox', { name: 'Search options' });
    await user.type(search, 'carrot');
    await user.keyboard('{ArrowDown}');

    expect(await axe(pane)).toHaveNoViolations();
  });
});

describe('Cascader async loading', () => {
  it('Cascader_LoadData_ShouldLoadChildrenOnceAndCacheThem', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    let resolveChildren: (children: CascaderOption[]) => void = () => undefined;
    const loadData = jest.fn(
      () =>
        new Promise<CascaderOption[]>((resolve) => {
          resolveChildren = resolve;
        })
    );

    render(
      <Cascader
        options={[{ value: 'remote', label: 'Remote', hasChildren: true }]}
        ariaLabel="Choose"
        loadData={loadData}
        loadingLabel="Fetching children of"
        onChange={onChange}
      />
    );

    const trigger = await openCascader(user);

    await user.click(screen.getByRole('option', { name: 'Remote' }));

    expect(loadData).toHaveBeenCalledWith(expect.objectContaining({ value: 'remote' }));

    const loadingOption = screen.getByRole('option', {
      name: 'Fetching children of Remote'
    });
    expect(loadingOption).toHaveAttribute('aria-busy', 'true');
    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();

    fireEvent.click(loadingOption);
    expect(loadData).toHaveBeenCalledTimes(1);

    resolveChildren([
      { value: 'child-a', label: 'Child A' },
      { value: 'child-b', label: 'Child B' }
    ]);

    expect(await screen.findByRole('option', { name: 'Child A' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'Child B' })).toBeVisible();

    await user.click(screen.getByRole('option', { name: 'Remote' }));
    expect(loadData).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('option', { name: 'Child A' }));

    expect(onChange).toHaveBeenCalledWith(['remote', 'child-a']);
    expect(trigger).toHaveValue('Remote / Child A');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  });

  it('Cascader_LoadData_ShouldReportErrorsAndAllowRetry', async () => {
    const user = userEvent.setup();
    const onLoadError = jest.fn();
    const loadData = jest
      .fn<Promise<CascaderOption[]>, [CascaderOption]>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([{ value: 'recovered', label: 'Recovered child' }]);

    render(
      <Cascader
        options={[{ value: 'remote', label: 'Remote', hasChildren: true }]}
        ariaLabel="Choose"
        loadData={loadData}
        onLoadError={onLoadError}
      />
    );

    await openCascader(user);

    await user.click(screen.getByRole('option', { name: 'Remote' }));

    await waitFor(() => expect(onLoadError).toHaveBeenCalledTimes(1));
    expect(onLoadError.mock.calls[0][0]).toEqual(expect.objectContaining({ value: 'remote' }));
    expect(onLoadError.mock.calls[0][1]).toEqual(new Error('offline'));

    const retryOption = screen.getByRole('option', { name: 'Remote' });
    expect(retryOption).not.toHaveAttribute('aria-busy');

    await user.click(retryOption);

    expect(await screen.findByRole('option', { name: 'Recovered child' })).toBeVisible();
    expect(loadData).toHaveBeenCalledTimes(2);
  });

  it('Cascader_LoadData_ShouldNotCacheFailedLoads', async () => {
    const user = userEvent.setup();
    const loadData = jest
      .fn<Promise<CascaderOption[]>, [CascaderOption]>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([{ value: 'finally', label: 'Finally loaded' }]);

    render(
      <Cascader
        options={[{ value: 'remote', label: 'Remote', hasChildren: true }]}
        ariaLabel="Choose"
        loadData={loadData}
      />
    );

    await openCascader(user);
    await user.click(screen.getByRole('option', { name: 'Remote' }));
    await waitFor(() => expect(loadData).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('option', { name: 'Remote' }));
    await waitFor(() => expect(loadData).toHaveBeenCalledTimes(2));

    await user.click(screen.getByRole('option', { name: 'Remote' }));

    expect(await screen.findByRole('option', { name: 'Finally loaded' })).toBeVisible();
    expect(loadData).toHaveBeenCalledTimes(3);
  });
});
