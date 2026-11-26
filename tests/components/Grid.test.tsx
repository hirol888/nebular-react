import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Grid } from '@nebular-react/core';

const collectEmittedCss = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => {
      const sheetRules = style.sheet
        ? Array.from(style.sheet.cssRules).map((rule) => rule.cssText)
        : [];

      return [style.textContent || '', ...sheetRules].join('\n');
    })
    .join('\n');

describe('Grid', () => {
  it('Grid_Render_ShouldUseTwelveColumnsAndDefaultGap', () => {
    render(
      <Grid data-testid="grid">
        <span>Cell</span>
      </Grid>
    );

    expect(screen.getByTestId('grid')).toHaveStyle({
      display: 'grid',
      gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
      gap: '1rem'
    });
  });

  it('Grid_ColumnsAndGap_ShouldApplyCustomValues', () => {
    render(<Grid data-testid="grid" columns={6} gap={24} />);

    expect(screen.getByTestId('grid')).toHaveStyle({
      gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
      gap: '24px'
    });
  });

  it('Grid_Col_ShouldSpanColumnsAndClampToGridSize', () => {
    render(
      <Grid columns={6}>
        <Grid.Col data-testid="span-four" span={4}>
          Four
        </Grid.Col>
        <Grid.Col data-testid="span-overflow" span={9}>
          Overflow
        </Grid.Col>
        <Grid.Col data-testid="span-auto" span="auto">
          Auto
        </Grid.Col>
        <Grid.Col data-testid="span-default">Default</Grid.Col>
      </Grid>
    );

    expect(screen.getByTestId('span-four')).toHaveStyle({ gridColumn: 'span 4' });
    expect(screen.getByTestId('span-overflow')).toHaveStyle({ gridColumn: 'span 6' });
    expect(screen.getByTestId('span-auto')).toHaveStyle({ gridColumn: 'auto' });
    expect(screen.getByTestId('span-default')).toHaveStyle({ gridColumn: 'span 6' });
  });

  it('Grid_Col_ShouldSupportOffsetAndOrder', () => {
    render(
      <Grid>
        <Grid.Col data-testid="offset" span={4} offset={2} order={3}>
          Offset
        </Grid.Col>
      </Grid>
    );

    const col = screen.getByTestId('offset');

    expect(col).toHaveStyle({ gridColumnStart: '3', gridColumnEnd: 'span 4' });
    expect(col).toHaveStyle({ order: 3 });
  });

  it('Grid_Responsive_ShouldCollapseToSingleColumnOnSmallScreens', () => {
    render(
      <Grid>
        <Grid.Col span={6}>Half</Grid.Col>
      </Grid>
    );

    const css = collectEmittedCss();

    expect(css).toMatch(/@media \(max-width: 768px\)/);
    expect(css).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)/);
    expect(css).toMatch(/grid-column:\s*span 1/);
  });

  it('Grid_ClassName_ShouldForwardClassNameAndStyle', () => {
    render(<Grid data-testid="grid" className="custom-grid" style={{ padding: 8 }} />);

    const grid = screen.getByTestId('grid');

    expect(grid).toHaveClass('custom-grid');
    expect(grid).toHaveClass('nebular-grid-root');
    expect(grid).toHaveStyle({ padding: '8px' });
  });

  it('Grid_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <Grid gap="sm">
        <Grid.Col span={6}>
          <p>Left</p>
        </Grid.Col>
        <Grid.Col span={6}>
          <p>Right</p>
        </Grid.Col>
      </Grid>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
