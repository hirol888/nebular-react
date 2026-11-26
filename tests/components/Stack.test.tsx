import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Stack } from '@nebular-react/core';

describe('Stack', () => {
  it('Stack_Render_ShouldUseColumnDirectionAndDefaultGap', () => {
    render(
      <Stack data-testid="stack">
        <span>First</span>
        <span>Second</span>
      </Stack>
    );

    const stack = screen.getByTestId('stack');

    expect(stack.tagName).toBe('DIV');
    expect(stack).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    });
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('Stack_Gap_ShouldAcceptTokensNumbersAndCssValues', () => {
    const { rerender } = render(<Stack data-testid="stack" gap="lg" />);

    expect(screen.getByTestId('stack')).toHaveStyle({ gap: '1.5rem' });

    rerender(<Stack data-testid="stack" gap={8} />);

    expect(screen.getByTestId('stack')).toHaveStyle({ gap: '8px' });

    rerender(<Stack data-testid="stack" gap="2em" />);

    expect(screen.getByTestId('stack')).toHaveStyle({ gap: '2em' });
  });

  it('Stack_Options_ShouldApplyDirectionAlignmentJustificationAndWrap', () => {
    render(
      <Stack
        data-testid="stack"
        direction="row"
        align="center"
        justify="space-between"
        wrap="wrap"
      />
    );

    expect(screen.getByTestId('stack')).toHaveStyle({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap'
    });
  });

  it('Stack_ClassName_ShouldForwardClassNameAndStyle', () => {
    render(<Stack data-testid="stack" className="custom-stack" style={{ padding: 12 }} />);

    const stack = screen.getByTestId('stack');

    expect(stack).toHaveClass('custom-stack');
    expect(stack).toHaveClass('nebular-stack-root');
    expect(stack).toHaveStyle({ padding: '12px' });
  });

  it('Stack_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <Stack gap="sm">
        <span>Alpha</span>
        <span>Beta</span>
      </Stack>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
