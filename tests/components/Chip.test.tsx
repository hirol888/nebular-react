import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Chip, ChipGroup } from '@nebular-react/core';

describe('Chip', () => {
  it('Chip_Uncontrolled_ShouldToggleCheckedState', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Chip defaultChecked onChange={onChange}>
        React
      </Chip>
    );

    const chip = screen.getByRole('checkbox', { name: 'React' });
    expect(chip).toHaveAttribute('aria-checked', 'true');

    await user.click(chip);

    expect(chip).toHaveAttribute('aria-checked', 'false');
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('Chip_Controlled_ShouldNotMutateInternalState', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Chip checked={false} onChange={onChange}>
        React
      </Chip>
    );

    const chip = screen.getByRole('checkbox', { name: 'React' });
    await user.click(chip);

    expect(chip).toHaveAttribute('aria-checked', 'false');
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it('Chip_Disabled_ShouldIgnoreClicks', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Chip disabled onChange={onChange}>
        React
      </Chip>
    );

    await user.click(screen.getByRole('checkbox', { name: 'React' }));

    expect(screen.getByRole('checkbox', { name: 'React' })).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Chip_Icon_ShouldRenderDecorativeContent', () => {
    render(
      <Chip icon={<span data-testid="chip-icon">*</span>} defaultChecked>
        React
      </Chip>
    );

    expect(screen.getByTestId('chip-icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('ChipGroup', () => {
  it('ChipGroup_Data_ShouldRenderStringsAndObjectOptions', () => {
    render(
      <ChipGroup
        label="Technologies"
        data={['React', { value: 'vue', label: 'Vue' }]}
      />
    );

    expect(screen.getByRole('group', { name: 'Technologies' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'React' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Vue' })).toBeInTheDocument();
  });

  it('ChipGroup_Single_ShouldReplaceSelection', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<ChipGroup label="Plan" data={['small', 'medium']} onChange={onChange} />);

    await user.click(screen.getByRole('checkbox', { name: 'medium' }));
    expect(onChange).toHaveBeenLastCalledWith('medium');

    await user.click(screen.getByRole('checkbox', { name: 'small' }));
    expect(onChange).toHaveBeenLastCalledWith('small');
  });

  it('ChipGroup_Multiple_ShouldAddAndRemoveValues', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <ChipGroup
        label="Technologies"
        data={['React', 'Vue']}
        multiple
        defaultValue={['React']}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: 'Vue' }));
    expect(onChange).toHaveBeenLastCalledWith(['React', 'Vue']);

    await user.click(screen.getByRole('checkbox', { name: 'React' }));
    expect(onChange).toHaveBeenLastCalledWith(['Vue']);
  });

  it('ChipGroup_Disabled_ShouldDisableEveryChip', () => {
    render(
      <ChipGroup
        label="Technologies"
        data={['React', { value: 'vue', label: 'Vue', disabled: true }]}
        disabled
      />
    );

    expect(screen.getByRole('checkbox', { name: 'React' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Vue' })).toBeDisabled();
  });

  it('ChipGroup_LabelDescriptionAndError_ShouldDescribeTheGroup', () => {
    render(
      <ChipGroup
        label="Technologies"
        data={['React']}
        description="Pick one or more"
        error="Selection is required"
        required
        orientation="vertical"
      />
    );

    const group = screen.getByRole('group', { name: 'Technologies' });
    expect(group).toHaveAttribute('data-invalid', 'true');
    expect(group).toHaveAttribute('data-required', 'true');
    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(screen.getByText('Pick one or more')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Selection is required');
  });

  it('ChipGroup_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <ChipGroup
        label="Technologies"
        description="Pick every technology you use"
        data={['React', { value: 'vue', label: 'Vue', disabled: true }]}
        multiple
        required
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
