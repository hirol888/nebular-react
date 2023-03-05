import React, { useEffect, useRef } from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import useStyles from './TimeList.style';

export type TimepickerCellStylesNames = Selectors<typeof useStyles>;

export interface TimepickerCellProps extends DefaultProps<TimepickerCellStylesNames> {
  value?: string;
  selected?: boolean;
  opened?: boolean;
  onSelect?: (value: string) => void;
}

const defaultProps: Partial<TimepickerCellProps> = {
  selected: false,
  opened: false
};

function TimepickerCell(props: TimepickerCellProps) {
  const { value, selected, opened, onSelect, className, classNames, styles, unstyled } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'timepicker-cell',
    classNames,
    styles,
    unstyled
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected && opened) {
      containerRef.current?.scrollIntoView({ block: 'center' });
    }
  }, [selected, opened]);

  const handleClick = () => {
    containerRef.current?.scrollIntoView({ block: 'center' });
    typeof onSelect === 'function' && onSelect(value);
  };

  return (
    <div ref={containerRef} className={cx(classes.timepickerCell, className)} onClick={handleClick}>
      {value}
    </div>
  );
}

TimepickerCell.displayName = '@nebular-react/core/TimepickerCell';

export { TimepickerCell };
