import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { DiffViewer, diffLines } from '@nebular-react/core';

describe('diffLines', () => {
  it('diffLines_EqualInput_ShouldReturnContextLinesWithBothLineNumbers', () => {
    expect(diffLines('alpha\nbeta', 'alpha\nbeta')).toEqual([
      { type: 'context', value: 'alpha', oldLine: 1, newLine: 1 },
      { type: 'context', value: 'beta', oldLine: 2, newLine: 2 }
    ]);
  });

  it('diffLines_InsertedLine_ShouldMarkAdditionWithNewLineNumber', () => {
    expect(diffLines('alpha\ngamma', 'alpha\nbeta\ngamma')).toEqual([
      { type: 'context', value: 'alpha', oldLine: 1, newLine: 1 },
      { type: 'added', value: 'beta', newLine: 2 },
      { type: 'context', value: 'gamma', oldLine: 2, newLine: 3 }
    ]);
  });

  it('diffLines_DeletedLine_ShouldMarkRemovalWithOldLineNumber', () => {
    expect(diffLines('alpha\nbeta\ngamma', 'alpha\ngamma')).toEqual([
      { type: 'context', value: 'alpha', oldLine: 1, newLine: 1 },
      { type: 'removed', value: 'beta', oldLine: 2 },
      { type: 'context', value: 'gamma', oldLine: 3, newLine: 2 }
    ]);
  });

  it('diffLines_ReplacedLine_ShouldListRemovalsBeforeAdditions', () => {
    expect(diffLines('alpha', 'beta')).toEqual([
      { type: 'removed', value: 'alpha', oldLine: 1 },
      { type: 'added', value: 'beta', newLine: 1 }
    ]);
  });

  it('diffLines_IgnoreWhitespace_ShouldTreatTrimmedLinesAsContext', () => {
    expect(diffLines('alpha\n  beta', 'alpha\nbeta', { ignoreWhitespace: true })).toEqual([
      { type: 'context', value: 'alpha', oldLine: 1, newLine: 1 },
      { type: 'context', value: 'beta', oldLine: 2, newLine: 2 }
    ]);
  });

  it('diffLines_WhitespaceOnlyDifference_ShouldReportChangeWithoutOption', () => {
    expect(diffLines('alpha\n  beta', 'alpha\nbeta')).toEqual([
      { type: 'context', value: 'alpha', oldLine: 1, newLine: 1 },
      { type: 'removed', value: '  beta', oldLine: 2 },
      { type: 'added', value: 'beta', newLine: 2 }
    ]);
  });

  it('diffLines_RepeatedCalls_ShouldBeDeterministic', () => {
    const before = 'one\ntwo\nthree\nfour';
    const after = 'one\nthree\nfive';

    expect(diffLines(before, after)).toEqual(diffLines(before, after));
  });

  it('diffLines_EmptyInput_ShouldReturnEmptyArray', () => {
    expect(diffLines('', '')).toEqual([]);
  });

  it('diffLines_WindowsLineEndings_ShouldNormalizeToLf', () => {
    expect(diffLines('alpha\r\nbeta', 'alpha\nbeta')).toEqual([
      { type: 'context', value: 'alpha', oldLine: 1, newLine: 1 },
      { type: 'context', value: 'beta', oldLine: 2, newLine: 2 }
    ]);
  });
});

describe('DiffViewer', () => {
  it('DiffViewer_SplitMode_ShouldRenderTwoAlignedColumns', () => {
    const { container } = render(<DiffViewer before={'alpha\nbeta'} after={'alpha\ngamma'} />);
    const table = screen.getByRole('table', { name: 'Diff viewer' });
    const rows = within(table).getAllByRole('row');

    expect(rows).toHaveLength(2);

    const cells = within(rows[1]).getAllByRole('cell');

    expect(cells).toHaveLength(2);
    expect(cells[0]).toHaveTextContent('beta');
    expect(cells[1]).toHaveTextContent('gamma');
    expect(rows[1]).toHaveAttribute('data-diff-type', 'changed');
    expect(container.querySelectorAll('[role="cell"][data-diff-type="removed"]')).toHaveLength(1);
    expect(container.querySelectorAll('[role="cell"][data-diff-type="added"]')).toHaveLength(1);
  });

  it('DiffViewer_UnifiedMode_ShouldRenderOneRowPerLineWithMarkers', () => {
    render(<DiffViewer before={'alpha\nbeta'} after={'alpha\ngamma'} mode="unified" />);

    const rows = within(screen.getByRole('table')).getAllByRole('row');

    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveAttribute('data-diff-type', 'context');
    expect(rows[1]).toHaveAttribute('data-diff-type', 'removed');
    expect(rows[2]).toHaveAttribute('data-diff-type', 'added');
    expect(within(rows[1]).getByText('-')).toBeInTheDocument();
    expect(within(rows[2]).getByText('+')).toBeInTheDocument();
    expect(rows[1]).toHaveTextContent('beta');
    expect(rows[2]).toHaveTextContent('gamma');
  });

  it('DiffViewer_Header_ShouldCountAdditionsAndRemovals', () => {
    render(<DiffViewer before={'alpha\nbeta'} after={'alpha\ngamma\ndelta'} />);

    expect(screen.getByLabelText('2 additions')).toHaveTextContent('+2');
    expect(screen.getByLabelText('1 removal')).toHaveTextContent('-1');
  });

  it('DiffViewer_IdenticalContent_ShouldRenderEmptyState', () => {
    render(<DiffViewer before={'alpha\nbeta'} after={'alpha\nbeta'} />);

    expect(screen.getByText('No changes')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByLabelText('0 additions')).toBeInTheDocument();
    expect(screen.getByLabelText('0 removals')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Diff viewer' })).toBeInTheDocument();
  });

  it('DiffViewer_IgnoreWhitespace_ShouldCollapseWhitespaceOnlyChanges', () => {
    const { container } = render(
      <DiffViewer before={'alpha\n  beta'} after={'alpha\nbeta'} ignoreWhitespace />
    );

    expect(screen.getByLabelText('0 additions')).toBeInTheDocument();
    expect(screen.getByLabelText('0 removals')).toBeInTheDocument();
    expect(container.querySelectorAll('[role="row"]')).toHaveLength(2);
    expect(container.querySelectorAll('[role="row"][data-diff-type="context"]')).toHaveLength(2);
  });

  it('DiffViewer_TitleAndMaxHeight_ShouldRenderHeaderAndScrollableBody', () => {
    render(
      <DiffViewer
        before="alpha"
        after="beta"
        title="config.ts"
        maxHeight={200}
        ariaLabel="Config changes"
      />
    );

    expect(screen.getByText('config.ts')).toBeInTheDocument();

    const table = screen.getByRole('table', { name: 'Config changes' });

    expect(table).toHaveStyle({ maxHeight: '200px' });
    expect(table).toHaveStyle({ overflowY: 'auto' });
  });

  it('DiffViewer_LineNumbers_ShouldRenderByDefaultAndBeHiddenFromAssistiveTech', () => {
    render(<DiffViewer before="alpha" after="beta" mode="unified" />);

    const rows = screen.getAllByRole('row');
    const hiddenNumbers = rows.flatMap((row) =>
      Array.from(row.querySelectorAll('[class*="lineNumber"]'))
    );

    expect(hiddenNumbers.length).toBeGreaterThan(0);
    hiddenNumbers.forEach((number) => expect(number).toHaveAttribute('aria-hidden', 'true'));
    expect(within(rows[0]).getAllByRole('cell')).toHaveLength(1);
  });

  it('DiffViewer_ShowLineNumbersFalse_ShouldHideLineNumbers', () => {
    const { container } = render(
      <DiffViewer before="alpha" after="beta" showLineNumbers={false} />
    );

    expect(container.querySelectorAll('[class*="lineNumber"]')).toHaveLength(0);
  });

  it('DiffViewer_Accessibility_ShouldHaveNoViolations', async () => {
    const split = render(
      <DiffViewer
        before={'function sum(a, b) {\n  return a + b;\n}'}
        after={'function sum(a, b) {\n  return b + a;\n}'}
        title="sum.ts"
      />
    );

    expect(await axe(split.container)).toHaveNoViolations();
    split.unmount();

    const unified = render(
      <DiffViewer before="alpha" after="beta" mode="unified" ariaLabel="Unified changes" />
    );

    expect(await axe(unified.container)).toHaveNoViolations();
  });
});
