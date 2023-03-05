import React from 'react';
import {
  ComponentOrCustomStatus,
  ComponentSize,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import useStyles, { ProgressBarStylesParams } from './ProgressBar.style';

export type ProgressBarStylesNames = Selectors<typeof useStyles>;

export interface ProgressBarProps
  extends DefaultProps<ProgressBarStylesNames, ProgressBarStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  value?: number;
  status?: ComponentOrCustomStatus;
  size?: ComponentSize;
  displayValue?: boolean;
  children?: React.ReactNode;
}

const defaultProps: Partial<ProgressBarProps> = {
  value: 0,
  status: 'basic',
  size: 'medium',
  displayValue: false
};

const _ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (props: ProgressBarProps, ref) => {
    const {
      value,
      status,
      size,
      displayValue,
      className,
      children,
      classNames,
      styles,
      unstyled,
      ...others
    } = useComponentDefaultProps(defaultProps, props);
    const { classes, cx } = useStyles(
      { size, status },
      { name: 'progress-bar', classNames, styles, unstyled }
    );

    return (
      <div className={cx(classes.root, className)} ref={ref} {...others}>
        <div className={cx(classes.container)}>
          <div className={cx(classes.value)} style={{ width: `${value}%` }}>
            {displayValue && <span>{value}</span>}
            {children}
          </div>
        </div>
      </div>
    );
  }
);

_ProgressBar.displayName = '@nebular-react/core/ProgressBar';

export const ProgressBar = createPolymorphicComponent<'div', ProgressBarProps>(_ProgressBar);
