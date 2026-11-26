import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Flex } from '@nebular-react/core';

describe('Flex', () => {
  it('Flex_Render_ShouldUseRowDirectionAndDefaultGap', () => {
    render(
      <Flex data-testid="flex">
        <span>First</span>
        <span>Second</span>
      </Flex>
    );

    const flex = screen.getByTestId('flex');

    expect(flex.tagName).toBe('DIV');
    expect(flex).toHaveStyle({
      display: 'flex',
      flexDirection: 'row',
      gap: '1rem'
    });
    expect(screen.getByText('First')).toBeInTheDocument();
  });

  it('Flex_Inline_ShouldRenderInlineFlex', () => {
    render(<Flex data-testid="flex" inline />);

    expect(screen.getByTestId('flex')).toHaveStyle({ display: 'inline-flex' });
  });

  it('Flex_Gap_ShouldAcceptTokensNumbersAndCssValues', () => {
    const { rerender } = render(<Flex data-testid="flex" gap="sm" />);

    expect(screen.getByTestId('flex')).toHaveStyle({ gap: '0.5rem' });

    rerender(<Flex data-testid="flex" gap={4} />);

    expect(screen.getByTestId('flex')).toHaveStyle({ gap: '4px' });

    rerender(<Flex data-testid="flex" gap="10%" />);

    expect(screen.getByTestId('flex')).toHaveStyle({ gap: '10%' });
  });

  it('Flex_Options_ShouldApplyDirectionAlignmentJustificationAndWrap', () => {
    render(
      <Flex
        data-testid="flex"
        direction="column"
        align="flex-start"
        justify="center"
        wrap="wrap-reverse"
      />
    );

    expect(screen.getByTestId('flex')).toHaveStyle({
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      flexWrap: 'wrap-reverse'
    });
  });

  it('Flex_ClassName_ShouldForwardClassNameAndStyle', () => {
    render(<Flex data-testid="flex" className="custom-flex" style={{ margin: 8 }} />);

    const flex = screen.getByTestId('flex');

    expect(flex).toHaveClass('custom-flex');
    expect(flex).toHaveClass('nebular-flex-root');
    expect(flex).toHaveStyle({ margin: '8px' });
  });

  it('Flex_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <Flex gap="xs">
        <span>Alpha</span>
        <span>Beta</span>
      </Flex>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
