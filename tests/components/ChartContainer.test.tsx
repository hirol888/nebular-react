import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ChartContainer } from '@nebular-react/core';

const originalImage = window.Image;
const originalGetContext = Object.getOwnPropertyDescriptor(
  HTMLCanvasElement.prototype,
  'getContext'
);
const originalToBlob = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'toBlob');

class FakeImage {
  onload: (() => void) | null = null;

  onerror: ((error?: unknown) => void) | null = null;

  width = 200;

  height = 100;

  private currentSrc = '';

  get src() {
    return this.currentSrc;
  }

  set src(value: string) {
    this.currentSrc = value;
    this.onload?.();
  }
}

const innerChart = (
  <svg width={200} height={100} viewBox="0 0 200 100">
    <rect width={200} height={100} />
  </svg>
);

const dataTable = {
  caption: 'Revenue data',
  columns: ['Month', 'Revenue'],
  rows: [
    ['Jan', 12],
    ['Feb', 19]
  ]
};

describe('ChartContainer', () => {
  const downloads: string[] = [];

  beforeEach(() => {
    downloads.length = 0;
    URL.createObjectURL = jest.fn(() => 'blob:mock');
    URL.revokeObjectURL = jest.fn();
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function capture(
      this: HTMLAnchorElement
    ) {
      downloads.push(this.download);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(window, 'Image', {
      configurable: true,
      writable: true,
      value: originalImage
    });
    if (originalGetContext) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', originalGetContext);
    }
    if (originalToBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', originalToBlob);
    }
  });

  it('renders header content and the chart area', () => {
    render(
      <ChartContainer
        title="Revenue"
        description="Monthly overview"
        actions={<button type="button">Refresh</button>}
        ariaLabel="Revenue chart"
      >
        {innerChart}
      </ChartContainer>
    );

    expect(screen.getByRole('group', { name: 'Revenue chart' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Revenue' })).toBeInTheDocument();
    expect(screen.getByText('Monthly overview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('passes the resolved size to a render prop child', () => {
    render(
      <ChartContainer width={320} height={200}>
        {({ width, height }) => <span>{`${width}x${height}`}</span>}
      </ChartContainer>
    );

    expect(screen.getByText('320x200')).toBeInTheDocument();
  });

  it('updates the size reported by the resize observer', () => {
    let trigger: ResizeObserverCallback | null = null;
    const observer = class {
      constructor(callback: ResizeObserverCallback) {
        trigger = callback;
      }

      observe() {}

      unobserve() {}

      disconnect() {}
    };
    const original = window.ResizeObserver;

    window.ResizeObserver = observer as unknown as typeof ResizeObserver;

    render(
      <ChartContainer height={200}>
        {({ width, height }) => <span>{`${width}x${height}`}</span>}
      </ChartContainer>
    );

    expect(trigger).not.toBeNull();

    act(() => {
      trigger?.([{ contentRect: { width: 512 } } as ResizeObserverEntry], {} as ResizeObserver);
    });

    expect(screen.getByText('512x200')).toBeInTheDocument();

    window.ResizeObserver = original;
  });

  it('shows a polite loading status while loading', () => {
    render(
      <ChartContainer loading height={200} ariaLabel="Loading chart">
        {innerChart}
      </ChartContainer>
    );

    const status = screen.getByRole('status');

    expect(status).toHaveTextContent('Loading');
    expect(screen.getByRole('group', { name: 'Loading chart' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
  });

  it('renders the empty state when there is no data', () => {
    render(
      <ChartContainer empty emptyMessage="Nothing to plot">
        {innerChart}
      </ChartContainer>
    );

    expect(screen.getByText('Nothing to plot')).toBeInTheDocument();
  });

  it('renders the default empty message', () => {
    render(<ChartContainer empty>{null}</ChartContainer>);

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('exports the inner svg as a file', async () => {
    const user = userEvent.setup();
    const onExport = jest.fn();

    render(
      <ChartContainer exportable exportFileName="revenue" onExport={onExport}>
        {innerChart}
      </ChartContainer>
    );

    expect(screen.queryByRole('button', { name: 'Export PNG' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(onExport).toHaveBeenCalledWith('svg', expect.any(Blob));
    expect(downloads).toContain('revenue.svg');
  });

  it('exports the inner svg as png when a canvas is available', async () => {
    const user = userEvent.setup();
    const onExport = jest.fn();
    const context = { drawImage: jest.fn() } as unknown as CanvasRenderingContext2D;

    Object.defineProperty(window, 'Image', {
      configurable: true,
      writable: true,
      value: FakeImage
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      writable: true,
      value: () => context
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
      configurable: true,
      writable: true,
      value: (callback: BlobCallback) => callback(new Blob(['png'], { type: 'image/png' }))
    });

    render(
      <ChartContainer exportable onExport={onExport} height={200}>
        {innerChart}
      </ChartContainer>
    );

    await user.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() => expect(onExport).toHaveBeenCalledWith('png', expect.any(Blob)));
    expect(context.drawImage).toHaveBeenCalled();
    expect(downloads).toContain('chart.png');
  });

  it('does not render export controls when exportable is false', () => {
    render(<ChartContainer>{innerChart}</ChartContainer>);

    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('announces export results through a status region', async () => {
    const user = userEvent.setup();

    render(
      <ChartContainer exportable exportFileName="revenue">
        {innerChart}
      </ChartContainer>
    );

    await user.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(screen.getByRole('status')).toHaveTextContent('Exported revenue.svg');
  });

  it('toggles the data table when showDataTable is visible', async () => {
    const user = userEvent.setup();

    render(
      <ChartContainer showDataTable="visible" dataTable={dataTable} ariaLabel="Revenue chart">
        {innerChart}
      </ChartContainer>
    );

    const toggle = screen.getByRole('button', { name: 'Mostrar tabela' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const controls = toggle.getAttribute('aria-controls');

    expect(controls).toBeTruthy();

    const region = document.getElementById(controls as string);

    expect(region).not.toBeNull();
    expect(region).toHaveAttribute('hidden');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await user.click(toggle);

    expect(screen.getByRole('button', { name: 'Ocultar tabela' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(region).not.toHaveAttribute('hidden');
    expect(screen.getByRole('table', { name: 'Revenue data' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ocultar tabela' }));

    expect(screen.getByRole('button', { name: 'Mostrar tabela' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders a visually hidden data table when showDataTable is hidden', () => {
    const { container } = render(
      <ChartContainer showDataTable="hidden" dataTable={dataTable} ariaLabel="Revenue chart">
        {innerChart}
      </ChartContainer>
    );

    expect(screen.queryByRole('button', { name: 'Mostrar tabela' })).not.toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Revenue data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('does not render a data table when showDataTable is false', () => {
    render(
      <ChartContainer dataTable={dataTable} ariaLabel="Revenue chart">
        {innerChart}
      </ChartContainer>
    );

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('marks the chart as animated when animated is enabled', () => {
    const { container } = render(<ChartContainer animated>{innerChart}</ChartContainer>);

    expect(container.firstChild).toHaveAttribute('data-animated', 'true');
  });

  it('disables the entry animation when reduced motion is requested', () => {
    jest.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn()
        }) as unknown as MediaQueryList
    );

    const { container } = render(<ChartContainer animated>{innerChart}</ChartContainer>);

    expect(container.firstChild).not.toHaveAttribute('data-animated');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ChartContainer
        title="Revenue"
        description="Monthly overview"
        actions={<button type="button">Refresh</button>}
        ariaLabel="Revenue chart"
        exportable
      >
        {innerChart}
      </ChartContainer>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
