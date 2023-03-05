import React from 'react';
import {
  ComponentOrCustomStatus,
  ComponentSize,
  ComponentStatus,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import useStyles, { AlertStylesParams } from './Alert.style';

export type AlertStylesNames = Selectors<typeof useStyles>;

export interface AlertProps
  extends DefaultProps<AlertStylesNames, AlertStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  size?: ComponentSize;
  status?: ComponentOrCustomStatus;
  accent?: ComponentStatus;
  outline?: ComponentStatus;
  closable?: boolean;
  onClose?(): void;
  children?: React.ReactNode;
}

const defaultProps: Partial<AlertProps> = {
  status: 'basic',
  closable: false
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  const {
    size,
    status,
    accent,
    outline,
    closable,
    className,
    onClose,
    children,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { size, status, accent, outline, closable },
    { name: 'alert', styles, classNames, unstyled }
  );

  return (
    <div
      className={cx(classes.root, className, size, status, accent, `outline-${outline}`)}
      ref={ref}
      {...others}
    >
      {closable && (
        <button className={cx(classes.close)} type="button" aria-label="Close" onClick={onClose}>
          <span aria-hidden="true">&times;</span>
        </button>
      )}
      {children}
    </div>
  );
});

Alert.displayName = '@nebular-react/core/Alert';

export { Alert };
