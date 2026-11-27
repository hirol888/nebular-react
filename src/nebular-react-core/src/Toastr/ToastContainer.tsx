import React, { useEffect, useRef } from 'react';
import { DefaultProps } from '@nebular-react/styles';
import { ToastComponent } from './ToastComponent';
import { Toast } from './types';

export interface ToastContainerProps extends DefaultProps {
  toast: Toast;
  onHide(id: string): void;
  innerRef: React.ForwardedRef<HTMLDivElement>;
  apply(): void;
  paneRef: React.RefObject<HTMLDivElement | null>;
  globalWrapperRef: React.RefObject<HTMLDivElement | null>;
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
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
    // onOpen must run once per toast mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleDelayedHide();
    return calcelDelayedHide;
    // Restart the timer only when the auto-close delay changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
