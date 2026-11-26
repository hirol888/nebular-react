import React, { createContext, forwardRef, useContext } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { SpacingValue, resolveSpacing } from '../Stack/Stack';

interface GridContextValue {
  columns: number;
}

const GridContext = createContext<GridContextValue>({ columns: 12 });

export interface GridStylesParams {
  columns: number;
  gap: string;
}

const useStyles = createStyles((_theme, { columns, gap }: GridStylesParams) => ({
  root: {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap,

    '@media (max-width: 768px)': {
      gridTemplateColumns: 'minmax(0, 1fr)'
    }
  }
}));

export type GridStylesNames = Selectors<typeof useStyles>;

export interface GridProps
  extends DefaultProps<GridStylesNames, GridStylesParams>, React.ComponentPropsWithoutRef<'div'> {
  columns?: number;
  gap?: SpacingValue;
}

const gridDefaultProps: Partial<GridProps> = {
  columns: 12,
  gap: 'md'
};

const _Grid = forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  const { children, columns, gap, className, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(gridDefaultProps, props);
  const { classes, cx } = useStyles(
    { columns, gap: resolveSpacing(gap) },
    { name: 'grid', classNames, styles, unstyled }
  );

  return (
    <GridContext.Provider value={{ columns }}>
      <div {...others} ref={ref} className={cx(classes.root, className)}>
        {children}
      </div>
    </GridContext.Provider>
  );
});

_Grid.displayName = 'Grid';

export interface GridColStylesParams {
  columns: number;
  span: number | 'auto';
  offset?: number;
  order?: number;
}

const useColStyles = createStyles(
  (_theme, { columns, span, offset, order }: GridColStylesParams) => {
    const resolvedSpan = span === 'auto' ? 'auto' : Math.min(span, columns);

    const placement =
      span === 'auto'
        ? { gridColumn: 'auto' }
        : offset !== undefined
          ? { gridColumnStart: String(offset + 1), gridColumnEnd: `span ${resolvedSpan}` }
          : { gridColumn: `span ${resolvedSpan}` };

    return {
      root: {
        minWidth: 0,
        ...placement,
        ...(order !== undefined ? { order } : {}),

        '@media (max-width: 768px)': {
          gridColumn: 'span 1'
        }
      }
    };
  }
);

export type GridColStylesNames = Selectors<typeof useColStyles>;

export interface GridColProps
  extends
    DefaultProps<GridColStylesNames, GridColStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  span?: number | 'auto';
  offset?: number;
  order?: number;
}

const _GridCol = forwardRef<HTMLDivElement, GridColProps>((props, ref) => {
  const { children, span, offset, order, className, classNames, styles, unstyled, ...others } =
    props;
  const { columns } = useContext(GridContext);
  const { classes, cx } = useColStyles(
    { columns, span: span ?? columns, offset, order },
    { name: 'grid-col', classNames, styles, unstyled }
  );

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      {children}
    </div>
  );
});

_GridCol.displayName = 'Grid.Col';

const Grid = Object.assign(_Grid, { Col: _GridCol });

export { Grid };
