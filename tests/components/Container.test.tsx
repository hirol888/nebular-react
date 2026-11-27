import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Container } from '@nebular-react/core';

const collectEmittedCss = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => {
      const sheetRules = style.sheet
        ? Array.from(style.sheet.cssRules).map((rule) => rule.cssText)
        : [];

      return [style.textContent || '', ...sheetRules].join('\n');
    })
    .join('\n');

describe('Container', () => {
  it('Container_Render_ShouldUseLargeSizeAndCenterContent', () => {
    render(
      <Container data-testid="container">
        <p>Content</p>
      </Container>
    );

    const container = screen.getByTestId('container');

    expect(container.tagName).toBe('DIV');
    expect(container).toHaveClass('nebular-container-root');
    expect(container).toHaveStyle({
      width: '100%',
      padding: '1rem',
      marginLeft: 'auto',
      marginRight: 'auto'
    });
    expect(collectEmittedCss()).toMatch(/--container-lg-max-width,\s*60rem/);
  });

  it('Container_Size_ShouldApplyMaxWidthVariables', () => {
    const { rerender } = render(<Container data-testid="container" size="sm" />);

    expect(collectEmittedCss()).toMatch(/--container-sm-max-width,\s*40rem/);

    rerender(<Container data-testid="container" size="full" />);

    expect(collectEmittedCss()).toMatch(/--container-full-max-width,\s*100%/);
  });

  it('Container_CenteredFalse_ShouldNotCenterContent', () => {
    render(<Container data-testid="container" centered={false} />);

    expect(screen.getByTestId('container')).not.toHaveStyle({ marginLeft: 'auto' });
    expect(screen.getByTestId('container')).not.toHaveStyle({ marginRight: 'auto' });
  });

  it('Container_Padding_ShouldAcceptTokensAndNumbers', () => {
    const { rerender } = render(<Container data-testid="container" padding="sm" />);

    expect(screen.getByTestId('container')).toHaveStyle({ padding: '0.5rem' });

    rerender(<Container data-testid="container" padding={24} />);

    expect(screen.getByTestId('container')).toHaveStyle({ padding: '24px' });
  });

  it('Container_ClassName_ShouldForwardClassNameAndStyle', () => {
    render(
      <Container data-testid="container" className="custom-container" style={{ color: 'red' }} />
    );

    const container = screen.getByTestId('container');

    expect(container).toHaveClass('custom-container');
    expect(container).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('Container_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <Container>
        <h1>Page title</h1>
        <p>Page content</p>
      </Container>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
