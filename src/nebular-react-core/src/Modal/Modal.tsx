import React, { forwardRef, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useMergedRef } from '@nebular-react/hooks';
import { Icon } from '../Icon';

export interface ModalProps extends DefaultProps<ModalStylesNames> {
  opened: boolean;
  onClose(): void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: number | string;
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  withCloseButton?: boolean;
  centered?: boolean;
  zIndex?: number;
  ariaLabel?: string;
}

interface ModalStylesParams {
  size: number | string;
  centered: boolean;
  zIndex: number;
}

const useStyles = createStyles((_theme, { size, centered, zIndex }: ModalStylesParams) => {
  const resolvedSize = typeof size === 'number' ? `${size}px` : size;

  return {
    root: {
      position: 'fixed',
      inset: 0,
      zIndex,
      display: 'flex',
      alignItems: centered ? 'center' : 'flex-start',
      justifyContent: 'center',
      padding: '1rem',
      overflowY: 'auto'
    },

    backdrop: {
      position: 'absolute',
      inset: 0,
      padding: 0,
      border: 0,
      backgroundColor: 'var(--modal-backdrop-color, rgba(0, 0, 0, 0.45))',
      cursor: 'default'
    },

    panel: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: resolvedSize,
      maxHeight: 'calc(100vh - 2rem)',
      overflow: 'hidden',
      borderRadius: 'var(--modal-border-radius, 0.5rem)',
      backgroundColor: 'var(--modal-background-color, var(--background-basic-color-1, #ffffff))',
      color: 'var(--modal-text-color, var(--text-basic-color, #222b45))',
      boxShadow: 'var(--modal-shadow, 0 16px 48px rgba(0, 0, 0, 0.3))',
      outline: 'none'
    },

    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      padding: '0.75rem 1.25rem',
      borderBottom: '1px solid var(--modal-border-color, var(--border-basic-color-3, #e4e9f2))'
    },

    title: {
      margin: 0,
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4
    },

    close: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '1.75rem',
      height: '1.75rem',
      marginInlineStart: 'auto',
      padding: 0,
      border: 0,
      borderRadius: '0.25rem',
      background: 'transparent',
      color: 'inherit',
      cursor: 'pointer',

      '&:focus-visible': {
        outline: '2px solid var(--color-primary-500, #3366ff)',
        outlineOffset: '2px'
      }
    },

    body: {
      flex: 1,
      minHeight: 0,
      overflow: 'auto',
      padding: '1rem 1.25rem'
    },

    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '0.5rem',
      padding: '0.75rem 1.25rem',
      borderTop: '1px solid var(--modal-border-color, var(--border-basic-color-3, #e4e9f2))'
    }
  };
});

export type ModalStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<ModalProps> = {
  size: 480,
  closeOnEsc: true,
  closeOnOverlayClick: true,
  withCloseButton: true,
  centered: true,
  zIndex: 1000
};

const _Modal = forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
  const {
    opened,
    onClose,
    title,
    children,
    footer,
    size,
    closeOnEsc,
    closeOnOverlayClick,
    withCloseButton,
    centered,
    zIndex,
    ariaLabel,
    className,
    style,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { size, centered, zIndex },
    { name: 'modal', classNames, styles, unstyled }
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const previousOverflowRef = useRef<string>('');
  const mergedPanelRef = useMergedRef(ref, panelRef);

  useEffect(() => {
    if (!opened) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;
    previousOverflowRef.current = document.body.style.overflow;
    panelRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflowRef.current;
      previousFocusRef.current?.focus();
    };
  }, [opened]);

  useEffect(() => {
    if (!opened || !closeOnEsc) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [opened, closeOnEsc, onClose]);

  if (!opened || typeof document === 'undefined') {
    return null;
  }

  const hasHeader = !!title || withCloseButton;
  const label = ariaLabel || (typeof title === 'string' && title ? title : 'Modal');

  const modal = (
    <div className={cx(classes.root, className)} style={style}>
      <button
        type="button"
        className={cx(classes.backdrop)}
        aria-label="Close modal overlay"
        tabIndex={-1}
        onClick={() => closeOnOverlayClick && onClose()}
      />
      <div
        ref={mergedPanelRef}
        className={cx(classes.panel)}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
      >
        {hasHeader && (
          <div className={cx(classes.header)}>
            {title && <h2 className={cx(classes.title)}>{title}</h2>}
            {withCloseButton && (
              <button
                type="button"
                className={cx(classes.close)}
                aria-label="Close modal"
                onClick={onClose}
              >
                <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div className={cx(classes.body)}>{children}</div>
        {footer && <div className={cx(classes.footer)}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
});

_Modal.displayName = 'Modal';

export { _Modal as Modal };
