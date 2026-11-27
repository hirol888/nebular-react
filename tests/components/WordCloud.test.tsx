import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { WordCloud, exportChartPng, exportChartSvg, layoutWordCloud } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const words = [
  { text: 'React', value: 100 },
  { text: 'TypeScript', value: 80 },
  { text: 'Emotion', value: 60 },
  { text: 'Nebular', value: 40 },
  { text: 'Charts', value: 20 },
  { text: 'Testing', value: 10 }
];

const layoutOptions = { width: 480, height: 280, minFontSize: 12, maxFontSize: 48 };

function boxes(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-word-text]')).map((element) => ({
    text: element.getAttribute('data-word-text'),
    x: Number(element.getAttribute('data-word-x')),
    y: Number(element.getAttribute('data-word-y')),
    fontSize: Number(element.getAttribute('data-word-size'))
  }));
}

describe('WordCloud', () => {
  it('should render a focusable word per entry with its value', () => {
    render(<WordCloud words={words} ariaLabel="Tech stack" />);

    expect(screen.getByRole('group', { name: 'Tech stack' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(words.length);
    expect(screen.getByRole('img', { name: 'React: 100' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'Testing: 10' })).toBeInTheDocument();
  });

  it('should scale the font size between minFontSize and maxFontSize', () => {
    const { container } = render(<WordCloud words={words} ariaLabel="Tech stack" />);
    const rendered = boxes(container);

    expect(rendered.find((item) => item.text === 'React')?.fontSize).toBe(48);
    expect(rendered.find((item) => item.text === 'TypeScript')?.fontSize).toBe(40);
    expect(rendered.find((item) => item.text === 'Emotion')?.fontSize).toBe(32);
    expect(rendered.find((item) => item.text === 'Nebular')?.fontSize).toBe(24);
    expect(rendered.find((item) => item.text === 'Charts')?.fontSize).toBe(16);
    expect(rendered.find((item) => item.text === 'Testing')?.fontSize).toBe(12);
  });

  it('should respect custom minFontSize and maxFontSize', () => {
    const { container } = render(
      <WordCloud words={words} minFontSize={10} maxFontSize={30} ariaLabel="Tech stack" />
    );
    const rendered = boxes(container);

    expect(rendered.find((item) => item.text === 'React')?.fontSize).toBe(30);
    expect(rendered.find((item) => item.text === 'TypeScript')?.fontSize).toBe(26);
    expect(rendered.find((item) => item.text === 'Testing')?.fontSize).toBe(10);
  });

  it('should lay every word inside the canvas without overlaps', () => {
    const layout = layoutWordCloud(words, layoutOptions);

    expect(layout).toHaveLength(words.length);

    layout.forEach((item) => {
      expect(item.x - item.width / 2).toBeGreaterThanOrEqual(0);
      expect(item.y - item.height / 2).toBeGreaterThanOrEqual(0);
      expect(item.x + item.width / 2).toBeLessThanOrEqual(layoutOptions.width);
      expect(item.y + item.height / 2).toBeLessThanOrEqual(layoutOptions.height);
    });

    for (let first = 0; first < layout.length; first += 1) {
      for (let second = first + 1; second < layout.length; second += 1) {
        const a = layout[first];
        const b = layout[second];
        const overlaps =
          a.x - a.width / 2 < b.x + b.width / 2 &&
          a.x + a.width / 2 > b.x - b.width / 2 &&
          a.y - a.height / 2 < b.y + b.height / 2 &&
          a.y + a.height / 2 > b.y - b.height / 2;

        expect(overlaps).toBe(false);
      }
    }
  });

  it('should produce a deterministic layout', () => {
    const first = layoutWordCloud(words, layoutOptions);
    const second = layoutWordCloud(words, layoutOptions);

    expect(second).toEqual(first);

    const { container, unmount } = render(<WordCloud words={words} ariaLabel="Tech stack" />);
    const firstRender = boxes(container);

    unmount();

    const { container: secondContainer } = render(
      <WordCloud words={words} ariaLabel="Tech stack" />
    );

    expect(boxes(secondContainer)).toEqual(firstRender);
  });

  it('should show a tooltip on hover and focus of a word', () => {
    render(<WordCloud words={words} ariaLabel="Tech stack" />);

    const word = screen.getByRole('img', { name: 'React: 100' });

    expect(screen.queryByText('React: 100')).not.toBeInTheDocument();

    fireEvent.mouseEnter(word);
    expect(screen.getByText('React: 100')).toBeInTheDocument();

    fireEvent.blur(word);
    expect(screen.queryByText('React: 100')).not.toBeInTheDocument();

    fireEvent.focus(word);
    expect(screen.getByText('React: 100')).toBeInTheDocument();
  });

  it('should call onWordClick with the word and its index on click and keyboard', () => {
    const onWordClick = jest.fn();

    render(<WordCloud words={words} ariaLabel="Clickable cloud" onWordClick={onWordClick} />);

    const word = screen.getByRole('button', { name: 'Emotion: 60' });

    fireEvent.click(word);
    expect(onWordClick).toHaveBeenLastCalledWith(words[2], 2);

    fireEvent.keyDown(word, { key: 'Enter' });
    expect(onWordClick).toHaveBeenLastCalledWith(words[2], 2);

    fireEvent.keyDown(word, { key: ' ' });
    expect(onWordClick).toHaveBeenLastCalledWith(words[2], 2);
    expect(onWordClick).toHaveBeenCalledTimes(3);
  });

  it('should use the provided palette and let each word override its color', () => {
    render(
      <WordCloud
        words={[
          { text: 'Alpha', value: 2, color: '#abcdef' },
          { text: 'Beta', value: 1 }
        ]}
        colors={['#111111']}
        ariaLabel="Palette"
      />
    );

    expect(screen.getByText('Alpha')).toHaveAttribute('fill', '#abcdef');
    expect(screen.getByText('Beta')).toHaveAttribute('fill', '#111111');
  });

  it('should accept custom dimensions and font family', () => {
    const { container } = render(
      <WordCloud
        words={words}
        width={600}
        height={300}
        fontFamily="Georgia, serif"
        ariaLabel="Wide cloud"
      />
    );

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 600 300');
    expect(screen.getByText('React')).toHaveAttribute('font-family', 'Georgia, serif');
  });

  it('should render an empty state when there are no words', () => {
    const { container } = render(<WordCloud words={[]} ariaLabel="Empty cloud" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <WordCloud words={words} ariaLabel="Tech stack" />
        <WordCloud words={words} ariaLabel="Clickable tech stack" onWordClick={() => undefined} />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('WordCloud data table, export and motion', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <WordCloud
        words={words}
        ariaLabel="Tech stack"
        showDataTable="visible"
        dataTableCaption="Tech stack data"
      />
    );

    const table = screen.getByRole('table', { name: 'Tech stack data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Word', 'Weight']);
    expect(within(table).getByRole('cell', { name: 'React' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '100' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(words.length + 1);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <WordCloud words={words} ariaLabel="Tech stack" showDataTable="hidden" />
    );

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('should not render a data table or export controls by default', () => {
    render(<WordCloud words={words} ariaLabel="Tech stack" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and png', async () => {
    render(<WordCloud words={words} ariaLabel="Tech stack" exportable exportFileName="words" />);

    fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'words');
    expect(screen.getByRole('status')).toHaveTextContent('Exported words.svg');

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Exported words.png'));
    expect(exportChartPng).toHaveBeenCalledWith(
      expect.any(SVGElement),
      'words',
      expect.objectContaining({ scale: 2 })
    );
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <WordCloud words={words} ariaLabel="Tech stack" animated />
    );

    expect(container.firstChild).toHaveAttribute('data-animated', 'true');

    unmount();

    const originalMatchMedia = window.matchMedia;

    window.matchMedia = jest.fn().mockImplementation(
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

    const reduced = render(<WordCloud words={words} ariaLabel="Tech stack" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with the data table and export controls', async () => {
    const { container } = render(
      <WordCloud
        words={words}
        ariaLabel="Tech stack"
        showDataTable="visible"
        dataTableCaption="Tech stack data"
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
