import React, { cloneElement, useEffect, useId, useRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useMergedRef, useUncontrolled } from '@nebular-react/hooks';
import { Button } from '../Button';

interface PopconfirmTriggerProps {
  onClick?: React.MouseEventHandler<HTMLElement>;
  ref?: React.Ref<HTMLElement>;
  'aria-haspopup'?: React.AriaAttributes['aria-haspopup'];
  'aria-expanded'?: React.AriaAttributes['aria-expanded'];
  'aria-controls'?: string;
}

export interface PopconfirmProps extends DefaultProps<PopconfirmStylesNames> {
  children: React.ReactElement<any>;
  message: React.ReactNode;
  title?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm(): void;
  onCancel?(): void;
  opened?: boolean;
  defaultOpened?: boolean;
  onOpenChange?(opened: boolean): void;
  disabled?: boolean;
  position?: 'top' | 'bottom';
  ariaLabel?: string;
}

const useStyles = createStyles((_theme, { position }: { position: 'top' | 'bottom' }) => ({
  wrapper: {
    position: 'relative',
    display: 'inline-flex'
  },

  panel: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    ...(position === 'top'
      ? { bottom: 'calc(100% + var(--popconfirm-offset, 0.5rem))' }
      : { top: 'calc(100% + var(--popconfirm-offset, 0.5rem))' }),
    zIndex: 'var(--popconfirm-z-index, 1000)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: 'max-content',
    minWidth: 'var(--popconfirm-min-width, 14rem)',
    maxWidth: 'var(--popconfirm-max-width, 20rem)',
    padding: 'var(--popconfirm-padding, 0.75rem 1rem)',
    border: '1px solid var(--popconfirm-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--popconfirm-border-radius, 0.5rem)',
    backgroundColor: 'var(--popconfirm-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--popconfirm-text-color, var(--text-basic-color, #222b45))',
    boxShadow: 'var(--popconfirm-shadow, 0 8px 24px rgba(0, 0, 0, 0.2))'
  },

  title: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.4
  },

  message: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: 'var(--popconfirm-message-color, var(--text-hint-color, #8f9bb3))'
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.5rem'
  }
}));

export type PopconfirmStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<PopconfirmProps> = {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  position: 'top',
  disabled: false
};

const _Popconfirm = React.forwardRef<HTMLSpanElement, PopconfirmProps>((props, ref) => {
  const {
    children,
    message,
    title,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    opened,
    defaultOpened,
    onOpenChange,
    disabled,
    position,
    ariaLabel,
    className,
    style,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { position },
    { name: 'popconfirm', classNames, styles, unstyled }
  );
  const [isOpen, setOpened] = useUncontrolled<boolean>({
    value: opened,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange: onOpenChange
  });
  const panelId = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const mergedWrapperRef = useMergedRef(ref, wrapperRef);
  const triggerRef = useRef<HTMLElement>(null);

  const childProps = children.props as PopconfirmTriggerProps;
  const mergedTriggerRef = useMergedRef(triggerRef, childProps.ref);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpened(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpened]);

  const handleTriggerClick = (event: React.MouseEvent<HTMLElement>) => {
    childProps.onClick?.(event);

    if (!disabled) {
      setOpened(!isOpen);
    }
  };

  const close = () => setOpened(false);

  const handleConfirm = () => {
    close();
    onConfirm();
  };

  const handleCancel = () => {
    close();
    onCancel?.();
  };

  const trigger = cloneElement(children, {
    ref: mergedTriggerRef,
    onClick: handleTriggerClick,
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? panelId : undefined
  });

  const label =
    ariaLabel ||
    (typeof title === 'string' && title
      ? title
      : typeof message === 'string' && message
        ? message
        : 'Confirmation');

  return (
    <span ref={mergedWrapperRef} className={cx(classes.wrapper, className)} style={style}>
      {trigger}
      {isOpen && (
        <div id={panelId} className={cx(classes.panel)} role="dialog" aria-label={label}>
          {title && <div className={cx(classes.title)}>{title}</div>}
          <div className={cx(classes.message)}>{message}</div>
          <div className={cx(classes.actions)}>
            <Button size="small" appearance="ghost" onClick={handleCancel}>
              {cancelLabel}
            </Button>
            <Button size="small" status="primary" onClick={handleConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </span>
  );
});

_Popconfirm.displayName = 'Popconfirm';

export { _Popconfirm as Popconfirm };
