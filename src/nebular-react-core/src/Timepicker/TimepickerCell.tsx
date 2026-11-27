import React, { useEffect, useRef } from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import useStyles from './TimeList.style';

export type TimepickerCellStylesNames = Selectors<typeof useStyles>;

export interface TimepickerCellProps extends DefaultProps<TimepickerCellStylesNames> {
  value?: string;
  selected?: boolean;
  disabled?: boolean;
  opened?: boolean;
  onSelect?: (value: string) => void;
}

const defaultProps: Partial<TimepickerCellProps> = {
  selected: false,
  disabled: false,
  opened: false
};

function TimepickerCell(props: TimepickerCellProps) {
  const { value, selected, disabled, opened, onSelect, className, classNames, styles, unstyled } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'timepicker-cell',
    classNames,
    styles,
    unstyled
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected && opened && !disabled) {
      containerRef.current?.scrollIntoView?.({ block: 'center' });
    }
  }, [selected, opened, disabled]);

  const handleClick = () => {
    if (disabled) {
      return;
    }

    containerRef.current?.scrollIntoView?.({ block: 'center' });
    typeof onSelect === 'function' && onSelect(value);
  };

  return (
    <div
      ref={containerRef}
      className={cx(classes.timepickerCell, className, {
        disabled
      })}
      aria-disabled={disabled || undefined}
      // Keep input focus so choosing one column leaves the popup open for the next.
      onMouseDown={(event) => event.preventDefault()}
      onClick={handleClick}
    >
      {value}
    </div>
  );
}

TimepickerCell.displayName = 'TimepickerCell';

export { TimepickerCell };
