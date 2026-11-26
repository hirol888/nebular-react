import React, { forwardRef } from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import useStyles, { TableStylesParams } from './Table.style';

export type TableStylesNames = Selectors<typeof useStyles>;

export interface TableProps
  extends
    DefaultProps<TableStylesNames, TableStylesParams>,
    React.ComponentPropsWithoutRef<'table'> {
  striped?: boolean;
  highlightOnHover?: boolean;
  withBorder?: boolean;
  withColumnBorders?: boolean;
  captionSide?: 'top' | 'bottom';
  children?: React.ReactNode;
}

const defaultProps: Partial<TableProps> = {
  striped: false,
  highlightOnHover: false,
  withBorder: false,
  withColumnBorders: false,
  captionSide: 'top'
};

const _Table = forwardRef<HTMLTableElement, TableProps>((props, ref) => {
  const {
    striped,
    highlightOnHover,
    withBorder,
    withColumnBorders,
    captionSide,
    className,
    classNames,
    styles,
    unstyled,
    children,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { striped, highlightOnHover, withBorder, withColumnBorders, captionSide },
    { name: 'table', classNames, styles, unstyled }
  );

  return (
    <table ref={ref} className={cx(classes.root, className)} {...others}>
      {children}
    </table>
  );
});

_Table.displayName = 'Table';

const Head = forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<'thead'>>(
  (props, ref) => <thead ref={ref} {...props} />
);
Head.displayName = 'Table.Head';

const Body = forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<'tbody'>>(
  (props, ref) => <tbody ref={ref} {...props} />
);
Body.displayName = 'Table.Body';

const Foot = forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<'tfoot'>>(
  (props, ref) => <tfoot ref={ref} {...props} />
);
Foot.displayName = 'Table.Foot';

const Row = forwardRef<HTMLTableRowElement, React.ComponentPropsWithoutRef<'tr'>>((props, ref) => (
  <tr ref={ref} {...props} />
));
Row.displayName = 'Table.Row';

const HeaderCell = forwardRef<HTMLTableCellElement, React.ComponentPropsWithoutRef<'th'>>(
  (props, ref) => <th scope="col" ref={ref} {...props} />
);
HeaderCell.displayName = 'Table.HeaderCell';

const Cell = forwardRef<HTMLTableCellElement, React.ComponentPropsWithoutRef<'td'>>(
  (props, ref) => <td ref={ref} {...props} />
);
Cell.displayName = 'Table.Cell';

const Caption = forwardRef<HTMLTableCaptionElement, React.ComponentPropsWithoutRef<'caption'>>(
  (props, ref) => <caption ref={ref} {...props} />
);
Caption.displayName = 'Table.Caption';

export const Table = Object.assign(_Table, {
  Head,
  Body,
  Foot,
  Row,
  HeaderCell,
  Cell,
  Caption
});
