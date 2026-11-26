import React, { forwardRef, useRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Icon } from '../Icon';

export interface RatingProps
  extends DefaultProps<RatingStylesNames>, Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  value?: number;
  defaultValue?: number;
  onChange?(value: number): void;
  count?: number;
  readOnly?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  size?: number;
  color?: string;
  getLabel?(value: number): string;
}

const useStyles = createStyles((_theme, { size, color }: { size: number; color?: string }) => ({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.125rem',
    fontFamily: 'var(--rating-text-font-family, inherit)'
  },

  item: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 0,
    background: 'transparent',
    color: 'var(--rating-empty-color, var(--border-basic-color-4, #c5cee0))',
    fontSize: size,
    lineHeight: 1,
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px',
      borderRadius: '2px'
    },

    '&:disabled': {
      cursor: 'default'
    }
  },

  active: {
    color: color || 'var(--rating-color, var(--color-warning-500, #ffaa00))'
  }
}));

export type RatingStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<RatingProps> = {
  defaultValue: 0,
  count: 5,
  readOnly: false,
  disabled: false,
  allowClear: true,
  size: 24,
  getLabel: (value: number) => `${value} star${value === 1 ? '' : 's'}`
};

const _Rating = forwardRef<HTMLDivElement, RatingProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    count,
    readOnly,
    disabled,
    allowClear,
    size,
    color,
    getLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { size, color },
    { name: 'rating', classNames, styles, unstyled }
  );
  const [rating, setRating] = useUncontrolled<number>({
    value,
    defaultValue,
    finalValue: 0,
    onChange
  });
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isDisabled = disabled || readOnly;

  const select = (nextValue: number) => {
    if (isDisabled) {
      return;
    }

    setRating(allowClear && rating === nextValue ? 0 : nextValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (isDisabled) {
      return;
    }

    const direction =
      event.key === 'ArrowRight' || event.key === 'ArrowUp'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
          ? -1
          : 0;

    if (direction === 0) {
      return;
    }

    event.preventDefault();
    const nextIndex = Math.min(Math.max(index + direction, 0), count - 1);
    itemRefs.current[nextIndex]?.focus();
    select(nextIndex + 1);
  };

  return (
    <div
      {...others}
      ref={ref}
      role="radiogroup"
      aria-label={others['aria-label'] ?? 'Rating'}
      aria-readonly={readOnly || undefined}
      className={cx(classes.root, className)}
    >
      {Array.from({ length: count }, (_, index) => {
        const itemValue = index + 1;
        const active = itemValue <= rating;

        return (
          <button
            key={itemValue}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={rating === itemValue}
            aria-label={getLabel(itemValue)}
            tabIndex={rating === itemValue || (rating === 0 && index === 0) ? 0 : -1}
            disabled={disabled}
            className={cx(classes.item, { [classes.active]: active })}
            onClick={() => select(itemValue)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <Icon
              icon={active ? 'star' : 'star-outline'}
              pack="nebular-essentials"
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
});

_Rating.displayName = 'Rating';

export { _Rating as Rating };
