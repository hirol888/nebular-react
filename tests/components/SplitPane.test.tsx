import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SplitPane } from '@nebular-react/core';

function renderSplitPane(props: Record<string, unknown> = {}) {
  return render(
    <SplitPane {...props}>
      <div>First panel</div>
      <div>Second panel</div>
    </SplitPane>
  );
}

describe('SplitPane', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('SplitPane_Render_ShouldUseDefaultSizeAndExposeSeparator', () => {
    renderSplitPane();

    const separator = screen.getByRole('separator', { name: 'Resize panels' });
    const firstPanel = screen.getByText('First panel').parentElement as HTMLElement;

    expect(firstPanel).toHaveStyle({ flexBasis: '50%' });
    expect(separator).toHaveAttribute('aria-valuenow', '50');
    expect(separator).toHaveAttribute('aria-valuemin', '10');
    expect(separator).toHaveAttribute('aria-valuemax', '90');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveAttribute('tabindex', '0');
    expect(screen.getByText('Second panel')).toBeInTheDocument();
  });

  it('SplitPane_KeyboardHorizontal_ShouldMoveSizeByFivePercentSteps', async () => {
    const user = userEvent.setup();
    const onSizeChange = jest.fn();

    renderSplitPane({ onSizeChange });

    const separator = screen.getByRole('separator', { name: 'Resize panels' });
    separator.focus();

    await user.keyboard('{ArrowRight}');

    expect(separator).toHaveAttribute('aria-valuenow', '55');
    expect(onSizeChange).toHaveBeenLastCalledWith(55);

    await user.keyboard('{ArrowLeft}');

    expect(separator).toHaveAttribute('aria-valuenow', '50');
    expect(onSizeChange).toHaveBeenLastCalledWith(50);

    await user.keyboard('{Home}');

    expect(separator).toHaveAttribute('aria-valuenow', '10');

    await user.keyboard('{End}');

    expect(separator).toHaveAttribute('aria-valuenow', '90');
  });

  it('SplitPane_Limits_ShouldClampSizeAndSkipRedundantChanges', async () => {
    const user = userEvent.setup();
    const onSizeChange = jest.fn();

    renderSplitPane({ defaultSize: 95, onSizeChange });

    const separator = screen.getByRole('separator', { name: 'Resize panels' });

    expect(separator).toHaveAttribute('aria-valuenow', '90');

    separator.focus();
    await user.keyboard('{ArrowRight}');

    expect(separator).toHaveAttribute('aria-valuenow', '90');
    expect(onSizeChange).not.toHaveBeenCalled();
  });

  it('SplitPane_VerticalOrientation_ShouldUseArrowUpAndDown', async () => {
    const user = userEvent.setup();

    renderSplitPane({ orientation: 'vertical', defaultSize: 30 });

    const separator = screen.getByRole('separator', { name: 'Resize panels' });

    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    expect(separator).toHaveAttribute('aria-valuenow', '30');

    separator.focus();

    await user.keyboard('{ArrowDown}');
    expect(separator).toHaveAttribute('aria-valuenow', '35');

    await user.keyboard('{ArrowUp}');
    expect(separator).toHaveAttribute('aria-valuenow', '30');

    await user.keyboard('{ArrowRight}');
    expect(separator).toHaveAttribute('aria-valuenow', '30');
  });

  it('SplitPane_MouseDrag_ShouldResizePanels', () => {
    const onSizeChange = jest.fn();

    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 400,
      width: 1000,
      height: 400,
      toJSON: () => ({})
    } as DOMRect);

    renderSplitPane({ onSizeChange });

    const separator = screen.getByRole('separator', { name: 'Resize panels' });

    fireEvent.mouseDown(separator, { clientX: 500, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 700, clientY: 100 });
    fireEvent.mouseUp(document);

    expect(separator).toHaveAttribute('aria-valuenow', '70');
    expect(onSizeChange).toHaveBeenLastCalledWith(70);
  });

  it('SplitPane_ControlledSize_ShouldOnlyEmitChanges', async () => {
    const user = userEvent.setup();
    const onSizeChange = jest.fn();

    const { rerender } = render(
      <SplitPane size={30} onSizeChange={onSizeChange}>
        <div>First panel</div>
        <div>Second panel</div>
      </SplitPane>
    );

    const separator = screen.getByRole('separator', { name: 'Resize panels' });
    separator.focus();

    await user.keyboard('{ArrowRight}');

    expect(onSizeChange).toHaveBeenLastCalledWith(35);
    expect(separator).toHaveAttribute('aria-valuenow', '30');

    rerender(
      <SplitPane size={35} onSizeChange={onSizeChange}>
        <div>First panel</div>
        <div>Second panel</div>
      </SplitPane>
    );

    expect(screen.getByRole('separator', { name: 'Resize panels' })).toHaveAttribute(
      'aria-valuenow',
      '35'
    );
  });

  it('SplitPane_SingleChild_ShouldRenderWithoutSeparator', () => {
    render(
      <SplitPane>
        <div>Only child</div>
      </SplitPane>
    );

    expect(screen.getByText('Only child')).toBeInTheDocument();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('SplitPane_Disabled_ShouldDisableSeparatorInteraction', async () => {
    const user = userEvent.setup();
    const onSizeChange = jest.fn();

    renderSplitPane({ disabled: true, onSizeChange });

    const separator = screen.getByRole('separator', { name: 'Resize panels' });

    expect(separator).toHaveAttribute('aria-disabled', 'true');
    expect(separator).toHaveAttribute('tabindex', '-1');

    separator.focus();
    await user.keyboard('{ArrowRight}');

    expect(separator).toHaveAttribute('aria-valuenow', '50');
    expect(onSizeChange).not.toHaveBeenCalled();
  });

  it('SplitPane_AccessibleSeparator_ShouldHaveNoViolations', async () => {
    const { container } = renderSplitPane({ separatorLabel: 'Redimensionar painéis' });

    expect(await axe(container)).toHaveNoViolations();
  });
});
