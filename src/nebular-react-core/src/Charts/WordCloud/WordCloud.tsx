import React, { forwardRef, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useMergedRef } from '@nebular-react/hooks';
import { Button } from '../../Button';
import { CHART_COLORS } from '../LineChart';
import { ChartDataTable } from '../ChartDataTable';
import { usePrefersReducedMotion } from '../ChartContainer/chart-motion';
import {
  ChartExportFormat,
  exportChartPng,
  exportChartSvg,
  resolveChartFileName
} from '../chart-export';

export interface WordCloudWord {
  text: string;
  value: number;
  color?: string;
}

export interface WordCloudLayoutOptions {
  width: number;
  height: number;
  minFontSize: number;
  maxFontSize: number;
  colors?: string[];
}

export interface WordCloudLayoutItem {
  text: string;
  value: number;
  index: number;
  fontSize: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export type WordCloudDataTableMode = 'hidden' | 'visible' | false;

export interface WordCloudProps extends DefaultProps<WordCloudStylesNames> {
  words: WordCloudWord[];
  width?: number;
  height?: number;
  fontFamily?: string;
  minFontSize?: number;
  maxFontSize?: number;
  colors?: string[];
  ariaLabel?: string;
  onWordClick?(word: WordCloudWord, index: number): void;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: WordCloudDataTableMode;
  /** Accessible caption used by the generated data table. */
  dataTableCaption?: string;
  /** Renders the "Export SVG" and "Export PNG" controls. */
  exportable?: boolean;
  /** Base file name used by the export controls (without extension). */
  exportFileName?: string;
  /** Adds a light entry animation that respects `prefers-reduced-motion`. */
  animated?: boolean;
}

const CHAR_WIDTH_RATIO = 0.6;
const LINE_HEIGHT_RATIO = 1.2;
const BOX_GAP = 2;
const BOUNDS_MARGIN = 0.5;
const SPIRAL_STEP = 1.8;
const SPIRAL_ANGLE_STEP = 0.3;
const MAX_SPIRAL_STEPS = 6000;

const useStyles = createStyles((_theme) => {
  const enter = keyframes({
    from: { opacity: 0, transform: 'translateY(4px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  });

  return {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      width: '100%',
      fontFamily: 'var(--chart-text-font-family, inherit)'
    },

    animated: {
      animation: `${enter} 220ms ease-out both`,

      '@media (prefers-reduced-motion: reduce)': {
        animation: 'none'
      }
    },

    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      gap: '0.5rem',
      width: '100%'
    },

    status: {
      color: 'var(--chart-status-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.7rem'
    },

    svg: {
      display: 'block',
      width: '100%',
      height: 'auto',
      overflow: 'visible'
    },

    word: {
      cursor: 'pointer',
      outline: 'none',
      transition: 'opacity 120ms ease',

      '&:focus-visible': {
        outline: 'none',
        stroke: 'var(--color-primary-500, #3366ff)',
        strokeWidth: 1
      }
    },

    tooltipBox: {
      fill: 'var(--chart-tooltip-background-color, var(--background-basic-color-1, #ffffff))',
      stroke: 'var(--chart-tooltip-border-color, var(--border-basic-color-3, #e4e9f2))',
      strokeWidth: 1
    },

    tooltipText: {
      fill: 'var(--chart-tooltip-text-color, var(--text-basic-color, #222b45))',
      fontSize: '0.65rem'
    },

    empty: {
      padding: '1.5rem',
      textAlign: 'center',
      color: 'var(--chart-empty-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.8125rem'
    }
  };
});

export type WordCloudStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<WordCloudProps> = {
  width: 480,
  height: 280,
  fontFamily: 'inherit',
  minFontSize: 12,
  maxFontSize: 48,
  ariaLabel: 'Word cloud',
  showDataTable: false,
  exportable: false,
  exportFileName: 'word-cloud',
  animated: false
};

function resolveColor(word: WordCloudWord, index: number, palette: string[]) {
  return word.color ?? palette[index % palette.length];
}

function findPlacement(
  entry: WordCloudLayoutItem,
  placed: WordCloudLayoutItem[],
  width: number,
  height: number
): { x: number; y: number } | null {
  const centerX = width / 2;
  const centerY = height / 2;

  for (let step = 0; step <= MAX_SPIRAL_STEPS; step += 1) {
    const angle = step * SPIRAL_ANGLE_STEP;
    const radius = SPIRAL_STEP * angle;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const left = x - entry.width / 2;
    const top = y - entry.height / 2;
    const inside =
      left >= BOUNDS_MARGIN &&
      top >= BOUNDS_MARGIN &&
      left + entry.width <= width - BOUNDS_MARGIN &&
      top + entry.height <= height - BOUNDS_MARGIN;

    if (inside) {
      const overlaps = placed.some(
        (other) =>
          left < other.x + other.width / 2 + BOX_GAP &&
          left + entry.width > other.x - other.width / 2 - BOX_GAP &&
          top < other.y + other.height / 2 + BOX_GAP &&
          top + entry.height > other.y - other.height / 2 - BOX_GAP
      );

      if (!overlaps) {
        return { x, y };
      }
    }
  }

  return null;
}

/**
 * Deterministic greedy layout: words are placed from the largest to the smallest
 * along an Archimedean spiral and kept only when their bounding box stays inside
 * the canvas and does not overlap a previously placed box.
 */
export function layoutWordCloud(
  words: WordCloudWord[],
  options: WordCloudLayoutOptions
): WordCloudLayoutItem[] {
  const { width, height, minFontSize, maxFontSize } = options;
  const palette = options.colors && options.colors.length > 0 ? options.colors : CHART_COLORS;

  if (words.length === 0) {
    return [];
  }

  const values = words.map((word) => (Number.isFinite(word.value) ? word.value : 0));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueSpan = maxValue - minValue;
  const entries = words.map((word, index) => {
    const value = values[index];
    const rawFontSize =
      valueSpan === 0
        ? maxFontSize
        : minFontSize + ((value - minValue) / valueSpan) * (maxFontSize - minFontSize);
    const fontSize = Math.round(Math.min(Math.max(rawFontSize, minFontSize), maxFontSize));

    return {
      text: word.text,
      value: word.value,
      index,
      fontSize,
      x: 0,
      y: 0,
      width: Math.max(fontSize, word.text.length * fontSize) * CHAR_WIDTH_RATIO,
      height: fontSize * LINE_HEIGHT_RATIO,
      color: resolveColor(word, index, palette)
    };
  });
  const ordered = [...entries].sort(
    (first, second) => second.fontSize - first.fontSize || first.index - second.index
  );
  const placed: WordCloudLayoutItem[] = [];

  ordered.forEach((entry) => {
    if (entry.width > width || entry.height > height) {
      return;
    }

    const position = findPlacement(entry, placed, width, height);

    if (position) {
      placed.push({ ...entry, ...position });
    }
  });

  return placed.sort((first, second) => first.index - second.index);
}

const _WordCloud = forwardRef<HTMLDivElement, WordCloudProps>((props, ref) => {
  const {
    words,
    width,
    height,
    fontFamily,
    minFontSize,
    maxFontSize,
    colors,
    ariaLabel,
    onWordClick,
    showDataTable,
    dataTableCaption,
    exportable,
    exportFileName,
    animated,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'word-cloud',
    classNames,
    styles,
    unstyled
  });
  const [activeItem, setActiveItem] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;
  const layout = layoutWordCloud(words, { width, height, minFontSize, maxFontSize, colors });

  const handleExport = async (format: ChartExportFormat) => {
    const svg = rootRef.current?.querySelector('svg');

    if (!svg) {
      setExportStatus('No chart to export');
      return;
    }

    try {
      if (format === 'svg') {
        exportChartSvg(svg, exportFileName);
        setExportStatus(`Exported ${resolveChartFileName(exportFileName, 'svg')}`);
        return;
      }

      await exportChartPng(svg, exportFileName, { scale: 2 });
      setExportStatus(`Exported ${resolveChartFileName(exportFileName, 'png')}`);
    } catch {
      setExportStatus('Unable to export chart');
    }
  };

  if (layout.length === 0) {
    return (
      <div
        ref={mergedRef}
        className={cx(classes.root, isAnimated && classes.animated, className)}
        data-animated={isAnimated ? 'true' : undefined}
      >
        <div className={cx(classes.empty)}>No data</div>
      </div>
    );
  }

  return (
    <div
      ref={mergedRef}
      className={cx(classes.root, isAnimated && classes.animated, className)}
      data-animated={isAnimated ? 'true' : undefined}
    >
      {exportable && (
        <div className={cx(classes.toolbar)}>
          <Button
            size="tiny"
            appearance="outline"
            type="button"
            onClick={() => {
              handleExport('svg').catch(() => undefined);
            }}
          >
            Export SVG
          </Button>
          <Button
            size="tiny"
            appearance="outline"
            type="button"
            onClick={() => {
              handleExport('png').catch(() => undefined);
            }}
          >
            Export PNG
          </Button>
          {exportStatus && (
            <span role="status" aria-live="polite" className={cx(classes.status)}>
              {exportStatus}
            </span>
          )}
        </div>
      )}
      <svg
        className={cx(classes.svg)}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveItem(null)}
      >
        <title>{ariaLabel}</title>
        {layout.map((item) => {
          const text = `${item.text}: ${item.value}`;

          return (
            <text
              key={`${item.text}-${item.index}`}
              className={cx(classes.word)}
              x={item.x}
              y={item.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={item.fontSize}
              fontFamily={fontFamily}
              fill={item.color}
              data-word-text={item.text}
              data-word-x={item.x}
              data-word-y={item.y}
              data-word-size={item.fontSize}
              role={typeof onWordClick === 'function' ? 'button' : 'img'}
              tabIndex={0}
              aria-label={text}
              onMouseEnter={() =>
                setActiveItem({ x: item.x, y: item.y - item.fontSize / 2 - 8, text })
              }
              onFocus={() => setActiveItem({ x: item.x, y: item.y - item.fontSize / 2 - 8, text })}
              onBlur={() => setActiveItem(null)}
              onClick={() => onWordClick?.(words[item.index], item.index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onWordClick?.(words[item.index], item.index);
                }
              }}
            >
              {item.text}
            </text>
          );
        })}
        {activeItem && (
          <g transform={`translate(${activeItem.x}, ${activeItem.y})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeItem.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeItem.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeItem.text}
            </text>
          </g>
        )}
      </svg>
      {showDataTable && (
        <ChartDataTable
          caption={dataTableCaption}
          columns={['Word', 'Weight']}
          rows={words.map((word) => [word.text, String(word.value)])}
          visuallyHidden={showDataTable === 'hidden'}
        />
      )}
    </div>
  );
});

_WordCloud.displayName = 'WordCloud';

export { _WordCloud as WordCloud };
