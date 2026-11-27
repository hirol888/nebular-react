import { createStyles } from '@nebular-react/styles';

export interface TableStylesParams {
  striped: boolean;
  highlightOnHover: boolean;
  withBorder: boolean;
  withColumnBorders: boolean;
  captionSide: 'top' | 'bottom';
}

export default createStyles(
  (
    _theme,
    { striped, highlightOnHover, withBorder, withColumnBorders, captionSide }: TableStylesParams
  ) => ({
    root: {
      width: '100%',
      borderCollapse: 'collapse',
      color: 'var(--table-text-color, var(--text-basic-color, #222b45))',
      fontFamily: 'var(--table-text-font-family, inherit)',
      fontSize: 'var(--table-text-font-size, 0.875rem)',
      lineHeight: 'var(--table-text-line-height, 1.5)',

      ...(withBorder
        ? {
            border: '1px solid var(--table-border-color, var(--border-basic-color-3, #e4e9f2))'
          }
        : {}),

      '& caption': {
        padding: '0.5rem 0',
        color: 'var(--table-caption-color, var(--text-hint-color, #8f9bb3))',
        fontSize: '0.8125rem',
        textAlign: 'left',
        captionSide
      },

      '& th, & td': {
        padding: 'var(--table-cell-padding, 0.75rem 1rem)',
        textAlign: 'left',
        verticalAlign: 'middle',

        ...(withColumnBorders
          ? {
              borderRight:
                '1px solid var(--table-border-color, var(--border-basic-color-3, #e4e9f2))',

              '&:last-child': {
                borderRight: 'none'
              }
            }
          : {})
      },

      '& thead th': {
        color: 'var(--table-header-text-color, var(--text-hint-color, #8f9bb3))',
        fontFamily: 'var(--table-header-text-font-family, inherit)',
        fontSize: 'var(--table-header-text-font-size, 0.75rem)',
        fontWeight: 'var(--table-header-text-font-weight, 600)' as any,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        borderBottom:
          '1px solid var(--table-header-border-color, var(--border-basic-color-3, #e4e9f2))'
      },

      '& tbody tr': {
        ...(striped
          ? {
              '&:nth-of-type(odd)': {
                backgroundColor:
                  'var(--table-striped-background-color, var(--background-basic-color-2, #f7f9fc))'
              }
            }
          : {})
      },

      ...(highlightOnHover
        ? {
            '& tbody tr:hover': {
              backgroundColor:
                'var(--table-hover-background-color, var(--background-basic-color-3, #edf1f7))'
            }
          }
        : {}),

      '& tbody td': {
        borderBottom: '1px solid var(--table-border-color, var(--border-basic-color-3, #e4e9f2))'
      },

      '& tbody tr:last-child td': {
        borderBottom: 'none'
      }
    }
  })
);
