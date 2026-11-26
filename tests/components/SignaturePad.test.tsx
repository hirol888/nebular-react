import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SignaturePad } from '@nebular-react/core';

// jsdom does not implement PointerEvent, so fireEvent.pointerDown/Move/Up would
// dispatch plain Events without client coordinates. MouseEvent carries clientX/clientY.
class TestPointerEvent extends MouseEvent {
  pointerId: number;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
  }
}

beforeAll(() => {
  Object.defineProperty(window, 'PointerEvent', {
    configurable: true,
    writable: true,
    value: TestPointerEvent
  });
});

function getPad() {
  return screen.getByRole('img', { name: 'Signature' });
}

describe('SignaturePad', () => {
  it('SignaturePad_Draw_ShouldBuildPathAndReportChange', () => {
    const onChange = jest.fn();
    const { container } = render(<SignaturePad onChange={onChange} ariaLabel="Signature" />);

    const pad = getPad();

    fireEvent.pointerDown(pad, { clientX: 10, clientY: 12 });
    fireEvent.pointerMove(pad, { clientX: 20, clientY: 24 });
    fireEvent.pointerMove(pad, { clientX: 30, clientY: 36 });
    fireEvent.pointerUp(pad, { clientX: 30, clientY: 36 });

    expect(onChange).toHaveBeenLastCalledWith('M10 12 L20 24 L30 36');
    expect(container.querySelector('path')).toHaveAttribute('d', 'M10 12 L20 24 L30 36');
  });

  it('SignaturePad_MultipleStrokes_ShouldConcatenatePaths', () => {
    const onChange = jest.fn();
    const { container } = render(<SignaturePad onChange={onChange} ariaLabel="Signature" />);

    const pad = getPad();

    fireEvent.pointerDown(pad, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(pad, { clientX: 15, clientY: 15 });
    fireEvent.pointerUp(pad, { clientX: 15, clientY: 15 });

    fireEvent.pointerDown(pad, { clientX: 20, clientY: 20 });
    fireEvent.pointerMove(pad, { clientX: 25, clientY: 25 });
    fireEvent.pointerUp(pad, { clientX: 25, clientY: 25 });

    expect(onChange).toHaveBeenLastCalledWith('M10 10 L15 15 M20 20 L25 25');
    expect(container.querySelector('path')).toHaveAttribute('d', 'M10 10 L15 15 M20 20 L25 25');
  });

  it('SignaturePad_PointerMove_ShouldBeIgnoredWithoutPointerDown', () => {
    const onChange = jest.fn();
    const { container } = render(<SignaturePad onChange={onChange} ariaLabel="Signature" />);

    fireEvent.pointerMove(getPad(), { clientX: 10, clientY: 10 });

    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector('path')).not.toBeInTheDocument();
  });

  it('SignaturePad_Clear_ShouldResetPathAndReportEmptyValue', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <SignaturePad defaultValue="M1 1 L2 2" onChange={onChange} ariaLabel="Signature" />
    );

    expect(container.querySelector('path')).toHaveAttribute('d', 'M1 1 L2 2');

    await user.click(screen.getByRole('button', { name: /clear/i }));

    expect(onChange).toHaveBeenLastCalledWith('');
    expect(container.querySelector('path')).not.toBeInTheDocument();
  });

  it('SignaturePad_ClearableFalse_ShouldHideClearButton', () => {
    render(<SignaturePad clearable={false} ariaLabel="Signature" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('SignaturePad_Controlled_ShouldNotMutateValueButReportNewPath', () => {
    const onChange = jest.fn();
    const { container } = render(
      <SignaturePad value="M1 1 L2 2" onChange={onChange} ariaLabel="Signature" />
    );

    const pad = getPad();

    expect(container.querySelector('path')).toHaveAttribute('d', 'M1 1 L2 2');

    fireEvent.pointerDown(pad, { clientX: 5, clientY: 5 });
    fireEvent.pointerMove(pad, { clientX: 6, clientY: 6 });
    fireEvent.pointerUp(pad, { clientX: 6, clientY: 6 });

    expect(onChange).toHaveBeenLastCalledWith('M1 1 L2 2 M5 5 L6 6');
    expect(container.querySelector('path')).toHaveAttribute('d', 'M1 1 L2 2');
  });

  it('SignaturePad_Disabled_ShouldIgnorePointerAndHideClearButton', () => {
    const onChange = jest.fn();
    const { container } = render(
      <SignaturePad disabled onChange={onChange} ariaLabel="Signature" />
    );

    const pad = getPad();

    fireEvent.pointerDown(pad, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(pad, { clientX: 20, clientY: 20 });
    fireEvent.pointerUp(pad, { clientX: 20, clientY: 20 });

    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector('path')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('SignaturePad_Size_ShouldExposeConfiguredDimensions', () => {
    render(<SignaturePad width={400} height={200} ariaLabel="Signature" />);

    expect(getPad()).toHaveAttribute('width', '400');
    expect(getPad()).toHaveAttribute('height', '200');
  });

  it('SignaturePad_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(<SignaturePad defaultValue="M1 1 L2 2" ariaLabel="Signature" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
