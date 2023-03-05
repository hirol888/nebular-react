import React from 'react';
import {
  ComponentSize,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import useStyles, { ActionsStylesParams } from './Actions.style';

export type ActionsStylesNames = Selectors<typeof useStyles>;

export interface ActionsProps
  extends DefaultProps<ActionsStylesNames, ActionsStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  size?: ComponentSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const defaultProps: Partial<ActionsProps> = {
  size: 'small',
  fullWidth: false
};

const Actions = React.forwardRef<HTMLDivElement, ActionsProps>((props, ref) => {
  const { size, fullWidth, children, className, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles({ size }, { name: 'actions', unstyled, classNames, styles });

  return (
    <div
      className={cx(classes.root, className, size, { [classes.fullWidth]: fullWidth })}
      ref={ref}
      {...others}
    >
      {children}
    </div>
  );
});

Actions.displayName = '@nebular-react/core/Actions';

export { Actions };
