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

export interface DrawerProps extends DefaultProps<DrawerStylesNames> {
  opened: boolean;
  onClose(): void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: number | string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  withOverlay?: boolean;
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  zIndex?: number;
}

const useStyles = createStyles(
  (
    _theme,
    {
      position,
      size,
      withOverlay,
      zIndex
    }: {
      position: 'left' | 'right' | 'top' | 'bottom';
      size: number | string;
      withOverlay: boolean;
      zIndex: number;
    }
  ) => {
    const resolvedSize = typeof size === 'number' ? `${size}px` : size;
    const horizontal = position === 'left' || position === 'right';

    return {
      root: {
        position: 'fixed',
        inset: 0,
        zIndex,
        display: 'flex',
        justifyContent:
          position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'stretch',
        alignItems:
          position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'stretch'
      },

      backdrop: {
        position: 'absolute',
        inset: 0,
        padding: 0,
        border: 0,
        backgroundColor: withOverlay
          ? 'var(--drawer-backdrop-color, rgba(0, 0, 0, 0.35))'
          : 'transparent',
        cursor: 'default'
      },

      panel: {
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: horizontal ? resolvedSize : '100%',
        height: horizontal ? '100%' : resolvedSize,
        backgroundColor: 'var(--drawer-background-color, var(--background-basic-color-1, #ffffff))',
        color: 'var(--drawer-text-color, var(--text-basic-color, #222b45))',
        boxShadow: 'var(--drawer-shadow, 0 8px 32px rgba(0, 0, 0, 0.24))',
        outline: 'none'
      },

      header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--drawer-border-color, var(--border-basic-color-3, #e4e9f2))'
      },

      title: {
        fontSize: '0.9375rem',
        fontWeight: 600,
        lineHeight: 1.4
      },

      close: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.75rem',
        height: '1.75rem',
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
        padding: '1rem'
      }
    };
  }
);

export type DrawerStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<DrawerProps> = {
  position: 'right',
  size: 320,
  withOverlay: true,
  closeOnEsc: true,
  closeOnOverlayClick: true,
  zIndex: 1000
};

const _Drawer = forwardRef<HTMLDivElement, DrawerProps>((props, ref) => {
  const {
    opened,
    onClose,
    position,
    size,
    title,
    children,
    withOverlay,
    closeOnEsc,
    closeOnOverlayClick,
    zIndex,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { position, size, withOverlay, zIndex },
    { name: 'drawer', classNames, styles, unstyled }
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const mergedPanelRef = useMergedRef(ref, panelRef);

  useEffect(() => {
    if (!opened) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;
    panelRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
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

  const panel = (
    <div className={cx(classes.root, className)}>
      <button
        type="button"
        className={cx(classes.backdrop)}
        aria-label="Close drawer overlay"
        tabIndex={-1}
        onClick={() => closeOnOverlayClick && onClose()}
      />
      <div
        ref={mergedPanelRef}
        className={cx(classes.panel)}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Drawer'}
        tabIndex={-1}
      >
        <div className={cx(classes.header)}>
          <div className={cx(classes.title)}>{title}</div>
          <button
            type="button"
            className={cx(classes.close)}
            aria-label="Close drawer"
            onClick={onClose}
          >
            <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
          </button>
        </div>
        <div className={cx(classes.body)}>{children}</div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
});

_Drawer.displayName = 'Drawer';

export { _Drawer as Drawer };
