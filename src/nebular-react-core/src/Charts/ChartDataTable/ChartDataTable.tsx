import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface ChartDataTableProps extends DefaultProps<ChartDataTableStylesNames> {
  /** Accessible caption rendered inside the table. */
  caption?: string;
  /** Column headers rendered with `scope="col"`. */
  columns: string[];
  /** Table body rows. Every cell can be any React node. */
  rows: Array<Array<React.ReactNode>>;
  /** Keeps the table in the accessibility tree while hiding it visually. */
  visuallyHidden?: boolean;
  /** Extra class applied to the scroll wrapper. */
  className?: string;
}

const useStyles = createStyles((_theme) => ({
  root: {
    width: '100%',
    maxWidth: '100%',
    overflowX: 'auto',
    fontFamily: 'var(--chart-text-font-family, inherit)',
    WebkitOverflowScrolling: 'touch'
  },

  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
    clipPath: 'inset(50%)'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    color: 'var(--chart-data-table-text-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--chart-data-table-font-size, 0.75rem)',
    lineHeight: 1.4
  },

  caption: {
    captionSide: 'top',
    padding: '0 0 0.35rem',
    color: 'var(--chart-data-table-caption-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.7rem',
    fontWeight: 600,
    textAlign: 'left'
  },

  headerCell: {
    padding: '0.35rem 0.5rem',
    borderBottom:
      '1px solid var(--chart-data-table-border-color, var(--border-basic-color-3, #e4e9f2))',
    fontWeight: 700,
    textAlign: 'left',
    whiteSpace: 'nowrap'
  },

  cell: {
    padding: '0.35rem 0.5rem',
    borderBottom:
      '1px solid var(--chart-data-table-border-color, var(--border-basic-color-3, #e4e9f2))',
    textAlign: 'left',
    verticalAlign: 'top',
    whiteSpace: 'nowrap'
  }
}));

export type ChartDataTableStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<ChartDataTableProps> = {
  visuallyHidden: false
};

const _ChartDataTable = forwardRef<HTMLDivElement, ChartDataTableProps>((props, ref) => {
  const { caption, columns, rows, visuallyHidden, className, classNames, styles, unstyled } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'chart-data-table',
    classNames,
    styles,
    unstyled
  });

  return (
    <div
      ref={ref}
      className={cx(classes.root, visuallyHidden && classes.visuallyHidden, className)}
      data-visually-hidden={visuallyHidden ? 'true' : undefined}
    >
      <table className={cx(classes.table)} aria-label={caption ? undefined : 'Chart data'}>
        {caption && <caption className={cx(classes.caption)}>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column, columnIndex) => (
              <th key={`${column}-${columnIndex}`} className={cx(classes.headerCell)} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={cx(classes.cell)}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

_ChartDataTable.displayName = 'ChartDataTable';

export { _ChartDataTable as ChartDataTable };
