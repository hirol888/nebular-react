import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  ButtonAppearance,
  ComponentOrCustomStatus,
  ComponentSize,
  DefaultProps,
  Selectors,
  Styles,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useId, mergeRefs, useOverlayClickOutside } from '@nebular-react/hooks';
import { Button } from '../Button';
import type { ButtonStylesNames } from '../Button';
import { Icon } from '../Icon';

const mainButtonStyles: Styles<ButtonStylesNames> = {
  root: { borderStartEndRadius: 0, borderEndEndRadius: 0 }
};

const toggleButtonStyles: Styles<ButtonStylesNames> = {
  root: {
    borderStartStartRadius: 0,
    borderEndStartRadius: 0,
    minWidth: 'var(--split-button-toggle-min-width, 2rem)'
  }
};

const useStyles = createStyles(() => ({
  root: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'stretch',
    fontFamily: 'var(--split-button-text-font-family, inherit)'
  },

  menu: {
    position: 'absolute',
    insetInlineEnd: 0,
    top: 'calc(100% + var(--split-button-menu-offset, 0.25rem))',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--split-button-menu-gap, 0.125rem)',
    minWidth: 'var(--split-button-menu-min-width, 100%)',
    width: 'max-content',
    maxWidth: 'var(--split-button-menu-max-width, 18rem)',
    padding: 'var(--split-button-menu-padding, 0.25rem)',
    border: '1px solid var(--split-button-menu-border-color, var(--border-basic-color-4, #e4e9f2))',
    borderRadius: 'var(--split-button-menu-border-radius, 0.25rem)',
    backgroundColor:
      'var(--split-button-menu-background-color, var(--background-basic-color-1, #fff))',
    boxShadow: 'var(--split-button-menu-shadow, 0 4px 12px rgba(0, 0, 0, 0.12))'
  },

  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--split-button-item-gap, 0.5rem)',
    width: '100%',
    padding: 'var(--split-button-item-padding, 0.375rem 0.75rem)',
    border: 'none',
    borderRadius: 'var(--split-button-item-border-radius, 0.25rem)',
    backgroundColor: 'transparent',
    color: 'var(--split-button-item-text-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    fontSize: 'var(--split-button-item-font-size, 0.8125rem)',
    lineHeight: 'var(--split-button-item-line-height, 1.4)',
    textAlign: 'start',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    '&:hover:not(:disabled)': {
      backgroundColor:
        'var(--split-button-item-hover-background-color, var(--background-basic-color-3, #edf1f7))'
    },
    '&:focus-visible': {
      outline: '2px solid var(--split-button-item-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  itemDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5
  },

  itemIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    lineHeight: 1
  }
}));

export type SplitButtonStylesNames = Selectors<typeof useStyles>;

export interface SplitButtonItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?(): void;
}

export interface SplitButtonProps extends DefaultProps<SplitButtonStylesNames> {
  label: React.ReactNode;
  onClick?(): void;
  items: SplitButtonItem[];
  size?: ComponentSize;
  status?: ComponentOrCustomStatus;
  appearance?: ButtonAppearance;
  disabled?: boolean;
  ariaLabel?: string;
  menuAriaLabel?: string;
}

const defaultProps: Partial<SplitButtonProps> = {
  size: 'medium',
  status: 'basic',
  appearance: 'filled',
  disabled: false,
  menuAriaLabel: 'More actions'
};

const _SplitButton = forwardRef<HTMLDivElement, SplitButtonProps>((props, ref) => {
  const {
    label,
    onClick,
    items,
    size,
    status,
    appearance,
    disabled,
    ariaLabel,
    menuAriaLabel,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);

  const { classes, cx } = useStyles(null, { name: 'split-button', classNames, styles, unstyled });

  const [opened, setOpened] = useState<boolean>(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pendingFocus = useRef<'first' | 'last' | null>(null);

  const menuId = `${useId()}-menu`;

  const getEnabledIndexes = () =>
    items.reduce<number[]>((indexes, item, index) => {
      if (!item.disabled) {
        indexes.push(index);
      }
      return indexes;
    }, []);

  const focusItemAt = (position: 'first' | 'last') => {
    const enabledIndexes = getEnabledIndexes();

    if (enabledIndexes.length === 0) {
      return;
    }

    const index =
      position === 'first' ? enabledIndexes[0] : enabledIndexes[enabledIndexes.length - 1];
    itemRefs.current[index]?.focus();
  };

  const open = (focus?: 'first' | 'last') => {
    if (disabled) {
      return;
    }

    pendingFocus.current = focus ?? null;
    setOpened(true);
  };

  const close = (restoreFocus = false) => {
    setOpened(false);
    pendingFocus.current = null;

    if (restoreFocus) {
      toggleRef.current?.focus();
    }
  };

  useEffect(() => {
    if (!opened) {
      return;
    }

    const focusTarget = pendingFocus.current;
    pendingFocus.current = null;

    if (focusTarget) {
      focusItemAt(focusTarget);
    }
    // The menu only needs the focus hand-off on the first render after opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  useOverlayClickOutside([rootRef], () => {
    if (opened) {
      close();
    }
  });

  const handleItemClick = (item: SplitButtonItem) => {
    if (item.disabled) {
      return;
    }

    typeof item.onClick === 'function' && item.onClick();
    close(true);
  };

  const handleMainClick = () => {
    close();
    typeof onClick === 'function' && onClick();
  };

  const handleToggleClick = () => {
    if (opened) {
      close();
      return;
    }

    open();
  };

  const handleToggleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (opened) {
        focusItemAt('first');
      } else {
        open('first');
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (opened) {
        focusItemAt('last');
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
      (index) => itemRefs.current[index] === document.activeElement
    );

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();

      const step = event.key === 'ArrowDown' ? 1 : -1;
      const nextPosition =
        currentPosition < 0
          ? 0
          : (currentPosition + step + enabledIndexes.length) % enabledIndexes.length;

      itemRefs.current[enabledIndexes[nextPosition]]?.focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();

      const position = event.key === 'Home' ? 0 : enabledIndexes.length - 1;

      itemRefs.current[enabledIndexes[position]]?.focus();
    } else if (event.key === 'Tab') {
      close();
    }
  };

  return (
    <div
      ref={mergeRefs(ref, rootRef)}
      role="group"
      aria-label={ariaLabel}
      className={cx(classes.root, className)}
      data-disabled={disabled || undefined}
    >
      <Button
        styles={mainButtonStyles}
        size={size}
        status={status}
        appearance={appearance}
        disabled={disabled}
        onClick={handleMainClick}
      >
        {label}
      </Button>
      <Button
        ref={toggleRef}
        styles={toggleButtonStyles}
        size={size}
        status={status}
        appearance={appearance}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={opened}
        aria-controls={opened ? menuId : undefined}
        aria-label={menuAriaLabel}
        prefixIcon={<Icon icon="chevron-down-outline" pack="nebular-essentials" />}
        onClick={handleToggleClick}
        onKeyDown={handleToggleKeyDown}
      />

      {opened && (
        <div
          id={menuId}
          role="menu"
          tabIndex={-1}
          aria-label={menuAriaLabel}
          className={cx(classes.menu)}
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => (
            <button
              key={item.key}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={cx(classes.item, {
                [classes.itemDisabled]: item.disabled
              })}
              onClick={() => handleItemClick(item)}
            >
              {item.icon && (
                <span className={cx(classes.itemIcon)} aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

_SplitButton.displayName = 'SplitButton';

export { _SplitButton as SplitButton };
