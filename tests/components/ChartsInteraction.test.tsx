import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { BarChart, LineChart } from '@nebular-react/core';

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const series = [
  { name: 'Revenue', data: [12, 19, 14, 25, 22, 30] },
  { name: 'Costs', data: [8, 11, 9, 14, 13, 16] }
];

describe('chart legend interaction', () => {
  it('toggles line series and keeps at least one visible', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <LineChart labels={labels} series={series} interactiveLegend ariaLabel="Revenue chart" />
    );

    expect(container.querySelectorAll('svg circle')).toHaveLength(12);

    const revenue = screen.getByRole('button', { name: 'Revenue' });
    const costs = screen.getByRole('button', { name: 'Costs' });
    expect(revenue).toHaveAttribute('aria-pressed', 'true');

    await user.click(revenue);

    expect(revenue).toHaveAttribute('aria-pressed', 'false');
    expect(container.querySelectorAll('svg circle')).toHaveLength(6);

    await user.click(costs);

    expect(costs).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelectorAll('svg circle')).toHaveLength(6);

    await user.click(revenue);

    expect(revenue).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelectorAll('svg circle')).toHaveLength(12);
  });

  it('toggles bar series', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <BarChart
        labels={['Q1', 'Q2', 'Q3', 'Q4']}
        series={[
          { name: 'Revenue', data: [32, 48, 41, 58] },
          { name: 'Costs', data: [18, 26, 24, 31] }
        ]}
        interactiveLegend
        ariaLabel="Quarterly chart"
      />
    );

    expect(container.querySelectorAll('svg rect')).toHaveLength(8);

    await user.click(screen.getByRole('button', { name: 'Revenue' }));

    expect(container.querySelectorAll('svg rect')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Revenue' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('does not render toggles when interactiveLegend is off', () => {
    render(<LineChart labels={labels} series={series} ariaLabel="Static chart" />);

    expect(screen.queryByRole('button', { name: 'Revenue' })).not.toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });
});

describe('LineChart zoom', () => {
  it('zooms into a dragged range and resets', async () => {
    const user = userEvent.setup();
    const onZoomChange = jest.fn();
    const { container } = render(
      <LineChart
        labels={labels}
        series={series}
        zoomable
        onZoomChange={onZoomChange}
        ariaLabel="Zoomable chart"
      />
    );

    const svg = container.querySelector('svg') as SVGSVGElement;
    Object.defineProperty(svg, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        width: 480,
        height: 240,
        right: 480,
        bottom: 240,
        toJSON: () => ({})
      })
    });

    const overlay = container.querySelector('[class*="zoomOverlay"]') as SVGRectElement;
    const pointerEvent = (type: string, clientX: number) =>
      new MouseEvent(type, { bubbles: true, cancelable: true, clientX });

    fireEvent(overlay, pointerEvent('pointerdown', 128));
    fireEvent(overlay, pointerEvent('pointermove', 296));
    fireEvent(overlay, pointerEvent('pointerup', 296));

    expect(onZoomChange).toHaveBeenLastCalledWith({ startIndex: 1, endIndex: 3 });
    expect(screen.queryByText('Jan')).not.toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
    expect(screen.getByText('Apr')).toBeInTheDocument();
    expect(screen.queryByText('May')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset zoom' }));

    expect(onZoomChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset zoom' })).not.toBeInTheDocument();
  });

  it('has no accessibility violations with interactive legend and zoom', async () => {
    const { container } = render(
      <LineChart
        labels={labels}
        series={series}
        interactiveLegend
        zoomable
        ariaLabel="Accessible chart"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
