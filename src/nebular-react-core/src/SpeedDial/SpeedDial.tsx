import React, { forwardRef, useEffect, useRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { mergeRefs, useId, useOverlayClickOutside } from '@nebular-react/hooks';

export type SpeedDialDirection = 'up' | 'down' | 'left' | 'right';
export type SpeedDialPosition = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start';

interface SpeedDialStylesParams {
  direction: SpeedDialDirection;
  position: SpeedDialPosition;
  opened: boolean;
}

const OFFSET = 24;

const getContainerDirection = (direction: SpeedDialDirection) => {
  if (direction === 'down') {
    return 'column-reverse' as const;
  }
  if (direction === 'left') {
    return 'row' as const;
  }
  if (direction === 'right') {
    return 'row-reverse' as const;
  }
  return 'column' as const;
};

const useStyles = createStyles((_theme, { direction, position, opened }: SpeedDialStylesParams) => {
  const [vertical, horizontal] = position.split('-');
  const isHorizontal = direction === 'left' || direction === 'right';

  return {
    root: {
      position: 'fixed',
      zIndex: 1000,
      display: 'flex',
      flexDirection: getContainerDirection(direction),
      alignItems: 'center',
      gap: 'var(--speed-dial-gap, 0.75rem)',
      fontFamily: 'var(--speed-dial-text-font-family, inherit)',
      ...(vertical === 'top' ? { top: OFFSET } : { bottom: OFFSET }),
      ...(horizontal === 'start' ? { insetInlineStart: OFFSET } : { insetInlineEnd: OFFSET })
    },

    actions: {
      display: 'flex',
      flexDirection: isHorizontal ? 'row' : 'column',
      alignItems: 'center',
      gap: 'var(--speed-dial-actions-gap, 0.5rem)',
      opacity: opened ? 1 : 0,
      visibility: opened ? 'visible' : 'hidden',
      pointerEvents: opened ? 'auto' : 'none',
      transform: opened ? 'scale(1)' : 'scale(0.8)',
      transformOrigin:
        direction === 'up'
          ? 'bottom center'
          : direction === 'down'
            ? 'top center'
            : direction === 'left'
              ? 'center right'
              : 'center left',
      transition: 'opacity 150ms ease, transform 150ms ease, visibility 150ms ease'
    },

    action: {
      display: 'flex',
      flexDirection: direction === 'right' ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 'var(--speed-dial-action-gap, 0.5rem)',
      padding: 0,
      border: 'none',
      backgroundColor: 'transparent',
      color: 'var(--speed-dial-action-text-color, var(--text-basic-color, #222b45))',
      font: 'inherit',
      fontSize: 'var(--speed-dial-action-font-size, 0.8125rem)',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      '&:disabled': {
        cursor: 'not-allowed',
        opacity: 0.5
      }
    },

    actionLabel: {
      padding: 'var(--speed-dial-action-label-padding, 0.125rem 0.5rem)',
      borderRadius: 'var(--speed-dial-action-label-border-radius, 0.25rem)',
      backgroundColor:
        'var(--speed-dial-action-label-background-color, var(--background-basic-color-1, #fff))',
      boxShadow: 'var(--speed-dial-action-label-shadow, 0 2px 6px rgba(0, 0, 0, 0.12))',
      lineHeight: 'var(--speed-dial-action-label-line-height, 1.4)'
    },

    actionIcon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
      width: 'var(--speed-dial-action-size, 2.5rem)',
      height: 'var(--speed-dial-action-size, 2.5rem)',
      borderRadius: '999px',
      backgroundColor:
        'var(--speed-dial-action-background-color, var(--background-basic-color-1, #fff))',
      color: 'var(--speed-dial-action-icon-color, var(--text-basic-color, #222b45))',
      boxShadow: 'var(--speed-dial-action-shadow, 0 4px 12px rgba(0, 0, 0, 0.18))',
      lineHeight: 1
    },

    trigger: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
      width: 'var(--speed-dial-trigger-size, 3.5rem)',
      height: 'var(--speed-dial-trigger-size, 3.5rem)',
      padding: 0,
      border: 'none',
      borderRadius: '999px',
      backgroundColor:
        'var(--speed-dial-trigger-background-color, var(--color-primary-500, #3366ff))',
      color: 'var(--speed-dial-trigger-color, #ffffff)',
      boxShadow: 'var(--speed-dial-trigger-shadow, 0 4px 12px rgba(0, 0, 0, 0.24))',
      font: 'inherit',
      fontSize: 'var(--speed-dial-trigger-font-size, 1.5rem)',
      lineHeight: 1,
      cursor: 'pointer'
    },

    triggerIcon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1,
      transform: opened ? 'rotate(45deg)' : 'rotate(0deg)',
      transition: 'transform 150ms ease'
    }
  };
});

export type SpeedDialStylesNames = Selectors<typeof useStyles>;

export interface SpeedDialAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick?(): void;
  disabled?: boolean;
}

export interface SpeedDialProps extends DefaultProps<SpeedDialStylesNames, SpeedDialStylesParams> {
  actions: SpeedDialAction[];
  icon?: React.ReactNode;
  direction?: SpeedDialDirection;
  position?: SpeedDialPosition;
  opened?: boolean;
  defaultOpened?: boolean;
  onOpenChange?(opened: boolean): void;
  ariaLabel?: string;
}

const defaultProps: Partial<SpeedDialProps> = {
  direction: 'up',
  position: 'bottom-end',
  defaultOpened: false
};

const _SpeedDial = forwardRef<HTMLDivElement, SpeedDialProps>((props, ref) => {
  const {
    actions,
    icon,
    direction,
    position,
    opened: openedProp,
    defaultOpened,
    onOpenChange,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);

  const [opened, setOpened] = useUncontrolled<boolean>({
    value: openedProp,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange: onOpenChange
  });

  const { classes, cx } = useStyles(
    { direction, position, opened },
    { name: 'speed-dial', classNames, styles, unstyled }
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const actionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pendingFocus = useRef<'first' | 'last' | null>(null);

  const menuId = `${useId()}-menu`;

  const getEnabledIndexes = () =>
    actions.reduce<number[]>((indexes, action, index) => {
      if (!action.disabled) {
        indexes.push(index);
      }
      return indexes;
    }, []);

  const focusActionAt = (edge: 'first' | 'last') => {
    const enabledIndexes = getEnabledIndexes();

    if (enabledIndexes.length === 0) {
      return;
    }

    const index = edge === 'first' ? enabledIndexes[0] : enabledIndexes[enabledIndexes.length - 1];
    actionRefs.current[index]?.focus();
  };

  const open = (focus?: 'first' | 'last') => {
    pendingFocus.current = focus ?? null;
    setOpened(true);
  };

  const close = (restoreFocus = false) => {
    setOpened(false);
    pendingFocus.current = null;

    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  useEffect(() => {
    if (!opened) {
      return;
    }

    const focusTarget = pendingFocus.current;
    pendingFocus.current = null;

    if (focusTarget) {
      focusActionAt(focusTarget);
    }
    // Focus only needs to be handed over once, right after the dial expands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  useOverlayClickOutside([rootRef], () => {
    if (opened) {
      close();
    }
  });

  const handleTriggerClick = () => {
    if (opened) {
      close();
    } else {
      open();
    }
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (opened) {
        focusActionAt('first');
      } else {
        open('first');
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (opened) {
        focusActionAt('last');
      } else {
        open('last');
      }
    } else if (event.key === 'Escape' && opened) {
      event.preventDefault();
      close(true);
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    }

    const enabledIndexes = getEnabledIndexes();

    if (enabledIndexes.length === 0) {
      return;
    }

    const currentPosition = enabledIndexes.findIndex(
      (index) => actionRefs.current[index] === document.activeElement
    );

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();

      const step = event.key === 'ArrowDown' ? 1 : -1;
      const nextPosition =
        currentPosition < 0
          ? 0
          : (currentPosition + step + enabledIndexes.length) % enabledIndexes.length;

      actionRefs.current[enabledIndexes[nextPosition]]?.focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();

      const nextPosition = event.key === 'Home' ? 0 : enabledIndexes.length - 1;

      actionRefs.current[enabledIndexes[nextPosition]]?.focus();
    } else if (event.key === 'Tab') {
      close();
    }
  };

  const handleActionClick = (action: SpeedDialAction) => {
    if (action.disabled) {
      return;
    }

    typeof action.onClick === 'function' && action.onClick();
    close(true);
  };

  return (
    <div
      ref={mergeRefs(ref, rootRef)}
      className={cx(classes.root, className)}
      data-position={position}
      data-direction={direction}
      data-opened={opened}
    >
      <div
        id={menuId}
        role="menu"
        tabIndex={-1}
        aria-label={ariaLabel ? `${ariaLabel} actions` : 'Speed dial actions'}
        aria-hidden={!opened}
        data-opened={opened}
        className={cx(classes.actions)}
        onKeyDown={handleMenuKeyDown}
      >
        {actions.map((action, index) => (
          <button
            key={action.key}
            ref={(node) => {
              actionRefs.current[index] = node;
            }}
            type="button"
            role="menuitem"
            disabled={action.disabled}
            tabIndex={opened ? 0 : -1}
            className={cx(classes.action)}
            onClick={() => handleActionClick(action)}
          >
            <span className={cx(classes.actionLabel)} data-speed-dial-label>
              {action.label}
            </span>
            <span className={cx(classes.actionIcon)} aria-hidden="true">
              {action.icon}
            </span>
          </button>
        ))}
      </div>

      <button
        ref={triggerRef}
        type="button"
        className={cx(classes.trigger)}
        aria-label={ariaLabel ?? 'Speed dial'}
        aria-haspopup="menu"
        aria-expanded={opened}
        aria-controls={menuId}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={cx(classes.triggerIcon)} aria-hidden="true">
          {icon ?? '+'}
        </span>
      </button>
    </div>
  );
});

_SpeedDial.displayName = 'SpeedDial';

export { _SpeedDial as SpeedDial };
