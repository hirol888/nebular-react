import React, { forwardRef } from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { useOverlay } from '@nebular-react/hooks';
import { Toast } from './types';
import { Icon } from '../Icon';
import useStyles, { ToastComponentStylesParams } from './ToastComponent.style';

export type ToastComponentStylesNames = Selectors<typeof useStyles>;

export interface ToastProps
  extends DefaultProps<ToastComponentStylesNames, ToastComponentStylesParams> {
  toast: Toast;
  onClose?(): void;
  apply(): void;
  paneRef: React.MutableRefObject<HTMLDivElement>;
  globalWrapperRef: React.MutableRefObject<HTMLDivElement>;
}

const ToastComponent = forwardRef<HTMLDivElement, ToastProps>((props, ref) => {
  const {
    toast,
    onClose,
    apply,
    paneRef,
    globalWrapperRef,
    classNames,
    styles,
    unstyled,
    ...others
  } = props;
  const { classes, cx } = useStyles(
    {
      status: toast.config.status,
      hasIcon: toast.config.hasIcon
    },
    { name: 'toast', classNames, styles, unstyled }
  );

  useOverlay({
    apply,
    paneRef,
    paneWrapperRef: globalWrapperRef,
    opened: true
  });

  return (
    <div
      className={cx(classes.root, `status-${toast.config.status}`, {
        [classes.destroyByClick]: toast.config.destroyByClick
      })}
      onClick={() => toast.config.destroyByClick && onClose()}
      ref={ref}
      {...others}
    >
      {toast.config.hasIcon && toast.config.icon && (
        <div className={cx(classes.iconContainer)}>
          <Icon icon={toast.config.icon} pack={toast.config.iconPack} />
        </div>
      )}
      <div className={cx(classes.contentContainer)}>
        <span className={cx(classes.title)}>{toast.title}</span>
        <div className={cx(classes.message)}>{toast.message}</div>
      </div>
    </div>
  );
});

export { ToastComponent };
