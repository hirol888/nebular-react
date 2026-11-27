import React, { forwardRef, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Button } from '../Button';

export interface ConfirmDialogProps extends DefaultProps<ConfirmDialogStylesNames> {
  opened: boolean;
  title?: React.ReactNode;
  message?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  onConfirm(): void;
  onCancel(): void;
  danger?: boolean;
  loading?: boolean;
  closeOnEsc?: boolean;
  zIndex?: number;
}

const useStyles = createStyles((_theme, { zIndex }: { zIndex: number }) => ({
  root: {
    position: 'fixed',
    inset: 0,
    zIndex,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },

  backdrop: {
    position: 'absolute',
    inset: 0,
    padding: 0,
    border: 0,
    backgroundColor: 'var(--confirm-dialog-backdrop-color, rgba(0, 0, 0, 0.35))'
  },

  panel: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 'var(--confirm-dialog-max-width, 26rem)',
    padding: '1.25rem',
    borderRadius: 'var(--confirm-dialog-border-radius, 0.5rem)',
    backgroundColor:
      'var(--confirm-dialog-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--confirm-dialog-text-color, var(--text-basic-color, #222b45))',
    boxShadow: 'var(--confirm-dialog-shadow, 0 12px 40px rgba(0, 0, 0, 0.25))'
  },

  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: 1.4
  },

  message: {
    margin: '0.5rem 0 0',
    color: 'var(--confirm-dialog-message-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.875rem',
    lineHeight: 1.5
  },

  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '1.25rem'
  }
}));

export type ConfirmDialogStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<ConfirmDialogProps> = {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: false,
  loading: false,
  closeOnEsc: true,
  zIndex: 1100
};

const _ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>((props, ref) => {
  const {
    opened,
    title,
    message,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    danger,
    loading,
    closeOnEsc,
    zIndex,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { zIndex },
    { name: 'confirm-dialog', classNames, styles, unstyled }
  );
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!opened) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;
    cancelRef.current?.focus();

    return () => {
      previousFocusRef.current?.focus();
    };
  }, [opened]);

  useEffect(() => {
    if (!opened || !closeOnEsc) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [opened, closeOnEsc, onCancel]);

  if (!opened || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className={cx(classes.root, className)}>
      <button
        type="button"
        className={cx(classes.backdrop)}
        aria-label="Cancel dialog"
        tabIndex={-1}
        onClick={onCancel}
      />
      <div
        ref={ref}
        className={cx(classes.panel)}
        role="alertdialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Confirmation dialog'}
        aria-describedby={message ? 'nebular-confirm-dialog-message' : undefined}
      >
        {title && <h2 className={cx(classes.title)}>{title}</h2>}
        {message && (
          <div id="nebular-confirm-dialog-message" className={cx(classes.message)}>
            {message}
          </div>
        )}
        <div className={cx(classes.actions)}>
          <Button ref={cancelRef} appearance="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            status={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading || undefined}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
});

_ConfirmDialog.displayName = 'ConfirmDialog';

export { _ConfirmDialog as ConfirmDialog };
