import React, { useEffect, useRef } from 'react';
import { DefaultProps } from '@nebular-react/styles';
import { ToastComponent } from './ToastComponent';
import { Toast } from './types';

export interface ToastContainerProps extends DefaultProps {
  toast: Toast;
  onHide(id: string): void;
  innerRef: React.ForwardedRef<HTMLDivElement>;
  apply(): void;
  paneRef: React.MutableRefObject<HTMLDivElement>;
  globalWrapperRef: React.MutableRefObject<HTMLDivElement>;
}

function ToastContainer({
  toast,
  onHide,
  innerRef,
  apply,
  paneRef,
  globalWrapperRef,
  ...others
}: ToastContainerProps) {
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleHide = () => {
    onHide(toast.config.id);
    clearTimeout(hideTimeout.current);
  };

  const calcelDelayedHide = () => {
    clearTimeout(hideTimeout.current);
  };

  const handleDelayedHide = () => {
    if (typeof toast.config.autoClose === 'number') {
      hideTimeout.current = setTimeout(handleHide, toast.config.autoClose);
    }
  };

  useEffect(() => {
    if (typeof toast.onOpen === 'function') {
      toast.onOpen(toast);
    }
  }, []);

  useEffect(() => {
    handleDelayedHide();
    return calcelDelayedHide;
  }, [toast.config.autoClose]);

  return (
    <ToastComponent
      toast={toast}
      ref={innerRef}
      onClose={handleHide}
      apply={apply}
      paneRef={paneRef}
      globalWrapperRef={globalWrapperRef}
      {...others}
    />
  );
}

export { ToastContainer };
