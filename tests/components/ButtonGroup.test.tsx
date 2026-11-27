import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Button, ButtonGroup, ButtonGroupProps, ButtonToggle } from '@nebular-react/core';

function renderSingleGroup(props: Partial<ButtonGroupProps> = {}) {
  return render(
    <ButtonGroup aria-label="Text formatting" {...props}>
      <ButtonGroup.Toogle value="bold">Bold</ButtonGroup.Toogle>
      <ButtonGroup.Toogle value="italic">Italic</ButtonGroup.Toogle>
      <ButtonGroup.Toogle value="underline">Underline</ButtonGroup.Toogle>
    </ButtonGroup>
  );
}

function renderMultipleGroup(props: Partial<ButtonGroupProps<true>> = {}) {
  return render(
    <ButtonGroup<true> multiple aria-label="Text formatting" {...props}>
      <ButtonGroup.Toogle value="bold">Bold</ButtonGroup.Toogle>
      <ButtonGroup.Toogle value="italic">Italic</ButtonGroup.Toogle>
      <ButtonGroup.Toogle value="underline">Underline</ButtonGroup.Toogle>
    </ButtonGroup>
  );
}

function ControlledGroup() {
  const [pressed, setPressed] = React.useState<string | null>('italic');

  return (
    <ButtonGroup aria-label="Text formatting" pressed={pressed} onChange={setPressed}>
      <ButtonGroup.Toogle value="bold">Bold</ButtonGroup.Toogle>
      <ButtonGroup.Toogle value="italic">Italic</ButtonGroup.Toogle>
      <ButtonGroup.Toogle value="underline">Underline</ButtonGroup.Toogle>
    </ButtonGroup>
  );
}

describe('ButtonGroup', () => {
  it('renders a labelled group with arbitrary children', () => {
    render(
      <ButtonGroup aria-label="Toolbar" className="custom-group" data-testid="group">
        <Button>A</Button>
        <span>Separator</span>
        <Button>B</Button>
      </ButtonGroup>
    );

    const group = screen.getByRole('group', { name: 'Toolbar' });

    expect(group).toBe(screen.getByTestId('group'));
    expect(group).toHaveClass('custom-group');
    expect(screen.getByText('Separator')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('toggles a single selection on click and reports the pressed value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderSingleGroup({ onChange });

    const bold = screen.getByRole('button', { name: 'Bold' });
    expect(bold).toHaveAttribute('aria-pressed', 'false');

    await user.click(bold);

    expect(bold).toHaveAttribute('aria-pressed', 'true');
    expect(bold).toHaveClass('pressed');
    expect(onChange).toHaveBeenLastCalledWith('bold');

    await user.click(bold);

    expect(bold).toHaveAttribute('aria-pressed', 'false');
    expect(bold).not.toHaveClass('pressed');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('keeps only one item pressed when multiple is false', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderSingleGroup({ onChange });

    const bold = screen.getByRole('button', { name: 'Bold' });
    const italic = screen.getByRole('button', { name: 'Italic' });

    await user.click(bold);
    await user.click(italic);

    expect(bold).toHaveAttribute('aria-pressed', 'false');
    expect(italic).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).toHaveBeenLastCalledWith('italic');
  });

  it('supports multiple pressed values', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderMultipleGroup({ onChange });

    const bold = screen.getByRole('button', { name: 'Bold' });
    const italic = screen.getByRole('button', { name: 'Italic' });

    await user.click(bold);
    expect(onChange).toHaveBeenLastCalledWith(['bold']);

    await user.click(italic);
    expect(onChange).toHaveBeenLastCalledWith(['bold', 'italic']);
    expect(bold).toHaveAttribute('aria-pressed', 'true');
    expect(italic).toHaveAttribute('aria-pressed', 'true');

    await user.click(bold);
    expect(onChange).toHaveBeenLastCalledWith(['italic']);
    expect(bold).toHaveAttribute('aria-pressed', 'false');
    expect(italic).toHaveAttribute('aria-pressed', 'true');
  });

  it('supports a controlled pressed value', async () => {
    const user = userEvent.setup();
    render(<ControlledGroup />);

    const bold = screen.getByRole('button', { name: 'Bold' });
    const italic = screen.getByRole('button', { name: 'Italic' });

    expect(italic).toHaveAttribute('aria-pressed', 'true');

    await user.click(bold);

    expect(bold).toHaveAttribute('aria-pressed', 'true');
    expect(italic).toHaveAttribute('aria-pressed', 'false');
  });

  it('applies size, shape, appearance and status props to every toggle', () => {
    render(
      <ButtonGroup
        aria-label="Formatting"
        size="small"
        shape="semiround"
        appearance="outline"
        pressedStatus="success"
        notPressedStatus="danger"
      >
        <ButtonGroup.Toogle value="bold" pressed>
          Bold
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="italic">Italic</ButtonGroup.Toogle>
      </ButtonGroup>
    );

    const bold = screen.getByRole('button', { name: 'Bold' });
    const italic = screen.getByRole('button', { name: 'Italic' });

    expect(bold).toHaveClass('small', 'semiround', 'outline', 'success', 'pressed');
    expect(italic).toHaveClass('small', 'semiround', 'outline', 'danger');
    expect(italic).not.toHaveClass('pressed');
  });

  it('disables every toggle when the group is disabled', () => {
    const onChange = jest.fn();
    renderSingleGroup({ disabled: true, onChange });

    const bold = screen.getByRole('button', { name: 'Bold' });

    expect(bold).toBeDisabled();
    fireEvent.click(bold);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports disabling a single toggle', () => {
    render(
      <ButtonGroup aria-label="Formatting">
        <ButtonGroup.Toogle value="bold" disabled>
          Bold
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="italic">Italic</ButtonGroup.Toogle>
      </ButtonGroup>
    );

    expect(screen.getByRole('button', { name: 'Bold' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Italic' })).not.toBeDisabled();
  });

  it('renders a standalone toggle outside a group', async () => {
    const user = userEvent.setup();
    render(<ButtonToggle value="bold">Bold</ButtonToggle>);

    const button = screen.getByRole('button', { name: 'Bold' });

    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('supports the ghost appearance', () => {
    render(
      <ButtonGroup aria-label="Formatting" appearance="ghost">
        <ButtonGroup.Toggle value="bold">Bold</ButtonGroup.Toggle>
      </ButtonGroup>
    );

    expect(screen.getByRole('button', { name: 'Bold' })).toHaveClass('ghost');
  });

  it('forwards the ref of a toggle to the underlying button', () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <ButtonGroup aria-label="Formatting">
        <ButtonGroup.Toogle ref={ref} value="bold">
          Bold
        </ButtonGroup.Toogle>
      </ButtonGroup>
    );

    expect(ref.current).toBe(screen.getByRole('button', { name: 'Bold' }));
  });

  it('exposes the toggle component through Toggle and the legacy Toogle alias', () => {
    expect(ButtonGroup.Toggle).toBe(ButtonToggle);
    expect(ButtonGroup.Toogle).toBe(ButtonToggle);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderSingleGroup();

    expect(await axe(container)).toHaveNoViolations();
  });
});
