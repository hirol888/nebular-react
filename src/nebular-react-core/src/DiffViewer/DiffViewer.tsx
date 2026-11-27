import React, { forwardRef, useMemo } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { EmptyState } from '../EmptyState';

export type DiffLineType = 'context' | 'added' | 'removed';

export interface DiffLine {
  type: DiffLineType;
  value: string;
  oldLine?: number;
  newLine?: number;
}

export interface DiffLinesOptions {
  ignoreWhitespace?: boolean;
}

function splitSource(source: string): string[] {
  const normalized = source.replace(/\r\n?/g, '\n');

  if (normalized === '') {
    return [];
  }

  const lines = normalized.split('\n');

  // A trailing newline terminates the last line instead of starting a new empty one.
  if (lines.length > 1 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines;
}

/**
 * Computes a line based diff between `before` and `after` using a longest common
 * subsequence walk. The result is deterministic: removals are reported before
 * the additions that replace them and unchanged lines are reported as context.
 */
export function diffLines(
  before: string,
  after: string,
  options: DiffLinesOptions = {}
): DiffLine[] {
  const beforeLines = splitSource(before);
  const afterLines = splitSource(after);
  const ignoreWhitespace = Boolean(options.ignoreWhitespace);
  const normalize = ignoreWhitespace ? (line: string) => line.trim() : (line: string) => line;
  const beforeCount = beforeLines.length;
  const afterCount = afterLines.length;

  // lengths[i][j] is the LCS length of beforeLines[i..] and afterLines[j..].
  const lengths: number[][] = Array.from({ length: beforeCount + 1 }, () =>
    new Array<number>(afterCount + 1).fill(0)
  );

  for (let i = beforeCount - 1; i >= 0; i -= 1) {
    for (let j = afterCount - 1; j >= 0; j -= 1) {
      lengths[i][j] =
        normalize(beforeLines[i]) === normalize(afterLines[j])
          ? lengths[i + 1][j + 1] + 1
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }

  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < beforeCount && j < afterCount) {
    if (normalize(beforeLines[i]) === normalize(afterLines[j])) {
      lines.push({ type: 'context', value: afterLines[j], oldLine: i + 1, newLine: j + 1 });
      i += 1;
      j += 1;
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      lines.push({ type: 'removed', value: beforeLines[i], oldLine: i + 1 });
      i += 1;
    } else {
      lines.push({ type: 'added', value: afterLines[j], newLine: j + 1 });
      j += 1;
    }
  }

  while (i < beforeCount) {
    lines.push({ type: 'removed', value: beforeLines[i], oldLine: i + 1 });
    i += 1;
  }

  while (j < afterCount) {
    lines.push({ type: 'added', value: afterLines[j], newLine: j + 1 });
    j += 1;
  }

  return lines;
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    width: '100%',
    fontFamily: 'var(--diff-viewer-font-family, inherit)'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },

  title: {
    color: 'var(--diff-viewer-title-color, var(--text-basic-color, #222b45))',
    fontSize: '0.8125rem',
    fontWeight: 600
  },

  counts: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: 'var(--diff-viewer-font-family, ui-monospace, SFMono-Regular, monospace)',
    fontSize: '0.75rem',
    fontWeight: 600
  },

  addedCount: {
    color: 'var(--diff-viewer-added-color, var(--color-success-800, #007d6c))'
  },

  removedCount: {
    color: 'var(--diff-viewer-removed-color, var(--color-danger-800, #94124e))'
  },

  body: {
    overflowX: 'auto',
    borderRadius: '0.375rem',
    backgroundColor: 'var(--diff-viewer-background-color, #f7f9fc)',
    border: '1px solid var(--diff-viewer-border-color, var(--border-basic-color-3, #e4e9f2))',
    color: 'var(--diff-viewer-text-color, #222b45)',
    fontFamily: 'var(--diff-viewer-font-family, ui-monospace, SFMono-Regular, monospace)',
    fontSize: 'var(--diff-viewer-font-size, 0.8125rem)',
    lineHeight: 1.5
  },

  row: {
    display: 'flex',
    alignItems: 'stretch'
  },

  rowAdded: {
    backgroundColor: 'var(--diff-viewer-added-background-color, #e9f9ef)'
  },

  rowRemoved: {
    backgroundColor: 'var(--diff-viewer-removed-background-color, #ffecec)'
  },

  cell: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    minWidth: 0,
    padding: '0.05rem 0.5rem'
  },

  halfCell: {
    flex: '1 1 50%',
    width: '50%'
  },

  gutter: {
    flex: '0 0 auto',
    minWidth: '1rem',
    textAlign: 'center',
    color: 'var(--diff-viewer-marker-color, var(--text-hint-color, #8f9bb3))',
    userSelect: 'none'
  },

  lineNumber: {
    flex: '0 0 auto',
    minWidth: '2rem',
    textAlign: 'right',
    color: 'var(--diff-viewer-line-number-color, var(--text-hint-color, #8f9bb3))',
    userSelect: 'none'
  },

  code: {
    flex: '1 1 auto',
    minWidth: 0,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere'
  }
}));

export type DiffViewerStylesNames = Selectors<typeof useStyles>;

export interface DiffViewerProps extends DefaultProps<DiffViewerStylesNames> {
  before: string;
  after: string;
  mode?: 'split' | 'unified';
  showLineNumbers?: boolean;
  ignoreWhitespace?: boolean;
  title?: React.ReactNode;
  ariaLabel?: string;
  maxHeight?: number;
  className?: string;
}

const defaultProps: Partial<DiffViewerProps> = {
  mode: 'split',
  showLineNumbers: true,
  ignoreWhitespace: false,
  ariaLabel: 'Diff viewer'
};

function describeCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getMarker(type: DiffLineType): string {
  if (type === 'added') {
    return '+';
  }

  if (type === 'removed') {
    return '-';
  }

  return ' ';
}

interface SplitDiffRow {
  type: 'context' | 'changed';
  left?: DiffLine;
  right?: DiffLine;
}

/**
 * Pairs the removed lines of a change block with the added ones so the split
 * mode renders both sides on the same visual row.
 */
function buildSplitRows(lines: DiffLine[]): SplitDiffRow[] {
  const rows: SplitDiffRow[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (line.type === 'context') {
      rows.push({ type: 'context', left: line, right: line });
      index += 1;
    } else {
      const removed: DiffLine[] = [];
      const added: DiffLine[] = [];

      while (index < lines.length && lines[index].type === 'removed') {
        removed.push(lines[index]);
        index += 1;
      }

      while (index < lines.length && lines[index].type === 'added') {
        added.push(lines[index]);
        index += 1;
      }

      const blockSize = Math.max(removed.length, added.length);

      for (let offset = 0; offset < blockSize; offset += 1) {
        rows.push({ type: 'changed', left: removed[offset], right: added[offset] });
      }
    }
  }

  return rows;
}

const _DiffViewer = forwardRef<HTMLDivElement, DiffViewerProps>((props, ref) => {
  const {
    before,
    after,
    mode,
    showLineNumbers,
    ignoreWhitespace,
    title,
    ariaLabel,
    maxHeight,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'diff-viewer',
    classNames,
    styles,
    unstyled
  });
  const lines = useMemo(
    () => (before === after ? [] : diffLines(before, after, { ignoreWhitespace })),
    [before, after, ignoreWhitespace]
  );
  const splitRows = useMemo(() => buildSplitRows(lines), [lines]);
  const identical = before === after;
  const additions = lines.filter((line) => line.type === 'added').length;
  const removals = lines.filter((line) => line.type === 'removed').length;

  return (
    <div ref={ref} className={cx(classes.root, className)}>
      <div className={cx(classes.header)}>
        <div className={cx(classes.title)}>{title}</div>
        <div className={cx(classes.counts)}>
          <span
            className={cx(classes.addedCount)}
            aria-label={describeCount(additions, 'addition', 'additions')}
          >
            {`+${additions}`}
          </span>
          <span
            className={cx(classes.removedCount)}
            aria-label={describeCount(removals, 'removal', 'removals')}
          >
            {`-${removals}`}
          </span>
        </div>
      </div>

      {identical ? (
        <div role="group" aria-label={ariaLabel}>
          <EmptyState compact title="No changes" description="The compared content is identical." />
        </div>
      ) : (
        <div
          role="table"
          aria-label={ariaLabel}
          className={cx(classes.body)}
          style={{ maxHeight, overflowY: maxHeight ? 'auto' : undefined }}
        >
          <div role="rowgroup">
            {mode === 'unified'
              ? lines.map((line, index) => {
                  const lineNumber = line.type === 'removed' ? line.oldLine : line.newLine;

                  return (
                    <div
                      key={index}
                      role="row"
                      data-diff-type={line.type}
                      className={cx(
                        classes.row,
                        line.type === 'added' && classes.rowAdded,
                        line.type === 'removed' && classes.rowRemoved
                      )}
                    >
                      <span role="cell" aria-hidden="true" className={cx(classes.gutter)}>
                        {getMarker(line.type)}
                      </span>
                      {showLineNumbers && (
                        <span role="cell" aria-hidden="true" className={cx(classes.lineNumber)}>
                          {lineNumber ?? ''}
                        </span>
                      )}
                      <span role="cell" className={cx(classes.code)}>
                        {line.value}
                      </span>
                    </div>
                  );
                })
              : splitRows.map((row, index) => (
                  <div key={index} role="row" data-diff-type={row.type} className={cx(classes.row)}>
                    <div
                      role="cell"
                      data-diff-type={row.left?.type ?? 'empty'}
                      className={cx(
                        classes.cell,
                        classes.halfCell,
                        row.left?.type === 'removed' && classes.rowRemoved
                      )}
                    >
                      {showLineNumbers && row.left && (
                        <span aria-hidden="true" className={cx(classes.lineNumber)}>
                          {row.left.oldLine ?? ''}
                        </span>
                      )}
                      <span className={cx(classes.code)}>{row.left?.value ?? ''}</span>
                    </div>
                    <div
                      role="cell"
                      data-diff-type={row.right?.type ?? 'empty'}
                      className={cx(
                        classes.cell,
                        classes.halfCell,
                        row.right?.type === 'added' && classes.rowAdded
                      )}
                    >
                      {showLineNumbers && row.right && (
                        <span aria-hidden="true" className={cx(classes.lineNumber)}>
                          {row.right.newLine ?? ''}
                        </span>
                      )}
                      <span className={cx(classes.code)}>{row.right?.value ?? ''}</span>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}
    </div>
  );
});

_DiffViewer.displayName = 'DiffViewer';

export { _DiffViewer as DiffViewer };
