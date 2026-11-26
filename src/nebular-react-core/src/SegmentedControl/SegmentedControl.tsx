import React, { forwardRef, useRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  ComponentSize,
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface SegmentedControlItem {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export interface SegmentedControlProps
  extends
    DefaultProps<SegmentedControlStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  data: (string | SegmentedControlItem)[];
  value?: string;
  defaultValue?: string;
  onChange?(value: string): void;
  size?: ComponentSize;
  fullWidth?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}

const useStyles = createStyles(
  (
    _theme,
    { size, fullWidth, disabled }: { size: ComponentSize; fullWidth: boolean; disabled: boolean }
  ) => ({
    root: {
      display: fullWidth ? 'grid' : 'inline-flex',
      gridAutoFlow: 'column',
      gridAutoColumns: '1fr',
      alignItems: 'stretch',
      gap: '0.125rem',
      padding: '0.1875rem',
      borderRadius: 'var(--segmented-control-border-radius, 0.375rem)',
      backgroundColor:
        'var(--segmented-control-background-color, var(--background-basic-color-2, #f7f9fc))',
      border:
        '1px solid var(--segmented-control-border-color, var(--border-basic-color-3, #e4e9f2))',
      opacity: disabled ? 0.6 : 1
    },

    item: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.35rem',
      minWidth: 0,
      padding: `var(--segmented-control-${size}-padding, 0.375rem 0.75rem)`,
      border: 0,
      borderRadius: 'var(--segmented-control-item-border-radius, 0.25rem)',
      background: 'transparent',
      color: 'var(--segmented-control-text-color, var(--text-basic-color, #222b45))',
      fontFamily: 'inherit',
      fontSize: `var(--segmented-control-${size}-font-size, 0.8125rem)`,
      lineHeight: 1.4,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background-color 120ms ease, color 120ms ease, box-shadow 120ms ease',

      '&:hover:not(:disabled):not([aria-checked="true"])': {
        backgroundColor:
          'var(--segmented-control-hover-background-color, var(--background-basic-color-3, #edf1f7))'
      },

      '&:focus-visible': {
        outline: '2px solid var(--color-primary-500, #3366ff)',
        outlineOffset: '1px'
      },

      '&:disabled': {
        cursor: 'not-allowed',
        opacity: 0.5
      }
    },

    active: {
      backgroundColor:
        'var(--segmented-control-active-background-color, var(--background-basic-color-1, #ffffff))',
      color: 'var(--segmented-control-active-text-color, var(--color-primary-500, #3366ff))',
      boxShadow: 'var(--segmented-control-active-shadow, 0 1px 3px rgba(0, 0, 0, 0.12))'
    }
  })
);

export type SegmentedControlStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<SegmentedControlProps> = {
  size: 'medium',
  fullWidth: false,
  disabled: false,
  ariaLabel: 'Segmented control'
};

const _SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>((props, ref) => {
  const {
    data,
    value,
    defaultValue,
    onChange,
    size,
    fullWidth,
    disabled,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { size, fullWidth, disabled },
    { name: 'segmented-control', classNames, styles, unstyled }
  );
  const items = data.map((item) =>
    typeof item === 'string' ? { label: item, value: item } : item
  );
  const [activeValue, setActiveValue] = useUncontrolled<string>({
    value,
    defaultValue: defaultValue ?? items[0]?.value,
    finalValue: '',
    onChange
  });
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (nextValue: string) => {
    setActiveValue(nextValue);
  };

  const focusItem = (index: number) => {
    const item = itemRefs.current[index];

    if (item) {
      item.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const direction =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;

    if (direction === 0) {
      return;
    }

    event.preventDefault();

    let nextIndex = index;

    for (let step = 0; step < items.length; step += 1) {
      nextIndex = (nextIndex + direction + items.length) % items.length;

      if (!items[nextIndex].disabled) {
        focusItem(nextIndex);
        select(items[nextIndex].value);
        return;
      }
    }
  };

  return (
    <div
      {...others}
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      className={cx(classes.root, className)}
    >
      {items.map((item, index) => (
        <button
          key={item.value}
          ref={(element) => {
            itemRefs.current[index] = element;
          }}
          type="button"
          role="radio"
          aria-checked={activeValue === item.value}
          disabled={disabled || item.disabled}
          className={cx(classes.item, {
            [classes.active]: activeValue === item.value
          })}
          onClick={() => select(item.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          tabIndex={activeValue === item.value ? 0 : -1}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
});

_SegmentedControl.displayName = 'SegmentedControl';

export { _SegmentedControl as SegmentedControl };
