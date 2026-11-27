import React, { forwardRef, useState } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface ColorPickerProps
  extends
    DefaultProps<ColorPickerStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?(value: string): void;
  swatches?: string[];
  disabled?: boolean;
  label?: React.ReactNode;
  ariaLabel?: string;
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontFamily: 'inherit'
  },

  label: {
    color: 'var(--color-picker-label-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--color-picker-label-font-size, 0.8125rem)',
    fontWeight: 600
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },

  native: {
    flex: '0 0 auto',
    width: '2.25rem',
    height: '2.25rem',
    padding: 0,
    border: '1px solid var(--color-picker-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--color-picker-border-radius, 0.25rem)',
    backgroundColor: 'transparent',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    },

    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  },

  text: {
    flex: '1 1 auto',
    minWidth: 0,
    height: '2.25rem',
    padding: '0 0.5rem',
    border: '1px solid var(--color-picker-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--color-picker-border-radius, 0.25rem)',
    backgroundColor: 'var(--color-picker-background-color, transparent)',
    color: 'var(--color-picker-text-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    fontSize: '0.8125rem',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  swatches: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem'
  },

  swatch: {
    width: '1.35rem',
    height: '1.35rem',
    padding: 0,
    border: '1px solid var(--color-picker-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: '0.25rem',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    },

    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  }
}));

export type ColorPickerStylesNames = Selectors<typeof useStyles>;

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const defaultProps: Partial<ColorPickerProps> = {
  defaultValue: '#3366ff',
  swatches: ['#3366ff', '#00d68f', '#ffaa00', '#ff3d71', '#8f9bb3', '#222b45'],
  disabled: false,
  ariaLabel: 'Color picker'
};

const _ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    swatches,
    disabled,
    label,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'color-picker',
    classNames,
    styles,
    unstyled
  });
  const [color, setColor] = useUncontrolled<string>({
    value,
    defaultValue,
    finalValue: '#3366ff',
    onChange
  });
  const [textValue, setTextValue] = useState(color);

  const commitColor = (nextColor: string) => {
    setColor(nextColor);
    setTextValue(nextColor);
  };

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      {label && <span className={cx(classes.label)}>{label}</span>}
      <div className={cx(classes.row)}>
        <input
          type="color"
          className={cx(classes.native)}
          value={color}
          disabled={disabled}
          aria-label={ariaLabel}
          onChange={(event) => commitColor(event.target.value)}
        />
        <input
          type="text"
          className={cx(classes.text)}
          value={textValue}
          disabled={disabled}
          aria-label={`${ariaLabel} hex value`}
          onChange={(event) => {
            const nextValue = event.target.value;
            setTextValue(nextValue);

            if (HEX_COLOR.test(nextValue)) {
              setColor(nextValue);
            }
          }}
          onBlur={() => setTextValue(color)}
        />
      </div>
      {swatches && swatches.length > 0 && (
        <div className={cx(classes.swatches)}>
          {swatches.map((swatch) => (
            <button
              key={swatch}
              type="button"
              className={cx(classes.swatch)}
              style={{ backgroundColor: swatch }}
              aria-label={`Select color ${swatch}`}
              aria-pressed={color.toLowerCase() === swatch.toLowerCase()}
              disabled={disabled}
              onClick={() => commitColor(swatch)}
            />
          ))}
        </div>
      )}
    </div>
  );
});

_ColorPicker.displayName = 'ColorPicker';

export { _ColorPicker as ColorPicker };
