import React, { useEffect } from 'react';
import { DefaultProps } from '@nebular-react/styles';
import { useFocusTrap, useOverlay } from '@nebular-react/hooks';
import { DialogConfig } from './types';
import { closeDialog } from './events';
import useStyles from './Dialog.styles';

export interface DialogProps extends DefaultProps {
  dialogConfig: DialogConfig;
  apply: () => void;
  paneRef: React.MutableRefObject<HTMLDivElement>;
  globalWrapperRef: React.MutableRefObject<HTMLDivElement>;
}

export function Dialog(props: DialogProps) {
  const {
    dialogConfig,
    apply,
    paneRef,
    globalWrapperRef,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = props;
  const {
    hasBackdrop,
    backdropClass,
    dialogClass,
    closeOnBackdropClick,
    closeOnEsc,
    hasScroll,
    autoFocus,
    content
  } = dialogConfig;
  const { classes, cx } = useStyles(null, { name: 'dialog', classNames, styles, unstyled });

  const close = () => {
    restoreFocus();
    closeDialog(dialogConfig.id);
  };

  useOverlay({
    apply,
    paneRef,
    paneWrapperRef: globalWrapperRef,
    opened: true,
    panelClass: dialogClass,
    scrollStrategy: hasScroll ? 'noop' : 'block',
    hasBackdrop,
    backdropClass,
    backdropClickHandler: closeOnBackdropClick ? close : () => ({})
  });
  const {
    elementRef: ftElementRef,
    blurPreviousFocusedElement,
    focusInitialElement,
    restoreFocus
  } = useFocusTrap(!autoFocus);

  useEffect(() => {
    if (autoFocus && ftElementRef.current) {
      blurPreviousFocusedElement();
      focusInitialElement();
    }
  }, [ftElementRef.current]);

  useEffect(() => {
    if (closeOnEsc) {
      document.addEventListener('keyup', keyupListener);
    }

    return () => {
      if (closeOnEsc) {
        document.removeEventListener('keyup', keyupListener);
      }
    };
  }, []);

  const keyupListener = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      close();
    }
  };

  return (
    <div className={cx(classes.root)} ref={ftElementRef} {...others}>
      {content}
    </div>
  );
}
