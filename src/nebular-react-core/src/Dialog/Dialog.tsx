import React, { useEffect, useRef } from 'react';
import { DefaultProps } from '@nebular-react/styles';
import { useFocusTrap, useOverlay } from '@nebular-react/hooks';
import { DialogConfig } from './types';
import { closeDialog } from './events';
import useStyles from './Dialog.styles';

export interface DialogProps extends DefaultProps {
  dialogConfig: DialogConfig;
  apply: () => void;
  paneRef: React.RefObject<HTMLDivElement | null>;
  globalWrapperRef: React.RefObject<HTMLDivElement | null>;
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

  const focusActionsRef = useRef({ blurPreviousFocusedElement, focusInitialElement });
  const closeRef = useRef(close);

  focusActionsRef.current = { blurPreviousFocusedElement, focusInitialElement };
  closeRef.current = close;

  useEffect(() => {
    if (autoFocus && ftElementRef.current) {
      focusActionsRef.current.blurPreviousFocusedElement();
      focusActionsRef.current.focusInitialElement();
    }
  }, [autoFocus, ftElementRef]);

  useEffect(() => {
    if (!closeOnEsc) {
      return undefined;
    }

    const keyupListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeRef.current();
      }
    };

    document.addEventListener('keyup', keyupListener);

    return () => {
      document.removeEventListener('keyup', keyupListener);
    };
  }, [closeOnEsc]);

  return (
    <div
      className={cx(classes.root)}
      ref={ftElementRef}
      role="dialog"
      aria-modal="true"
      aria-label={dialogConfig.ariaLabel || 'Dialog'}
      {...others}
    >
      {content}
    </div>
  );
}
