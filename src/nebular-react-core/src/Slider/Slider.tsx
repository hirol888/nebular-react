import React, { forwardRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface SliderProps
  extends DefaultProps<SliderStylesNames>, Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  value?: number;
  defaultValue?: number;
  onChange?(value: number): void;
  onChangeEnd?(value: number): void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: React.ReactNode;
  showValue?: boolean;
  status?: ComponentOrCustomStatus;
  ariaLabel?: string;
  name?: string;
}

const useStyles = createStyles((_theme, { status }: { status: ComponentOrCustomStatus }) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    width: '100%',
    fontFamily: 'inherit'
  },

  labelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    color: 'var(--slider-label-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--slider-label-font-size, 0.8125rem)',
    fontWeight: 600
  },

  value: {
    color: 'var(--slider-value-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--slider-value-font-size, 0.75rem)',
    fontVariantNumeric: 'tabular-nums'
  },

  input: {
    width: '100%',
    accentColor: `var(--slider-${status}-color, var(--color-primary-500, #3366ff))`,
    cursor: 'pointer',

    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  }
}));

export type SliderStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<SliderProps> = {
  defaultValue: 0,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  showValue: true,
  status: 'primary'
};

const _Slider = forwardRef<HTMLDivElement, SliderProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    onChangeEnd,
    min,
    max,
    step,
    disabled,
    label,
    showValue,
    status,
    ariaLabel,
    name,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles({ status }, { name: 'slider', classNames, styles, unstyled });
  const [sliderValue, setSliderValue] = useUncontrolled<number>({
    value,
    defaultValue,
    finalValue: min,
    onChange
  });
  const labelText = ariaLabel ?? (typeof label === 'string' ? label : 'Slider');

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      {(label || showValue) && (
        <div className={cx(classes.labelRow)}>
          {label && <span>{label}</span>}
          {showValue && <span className={cx(classes.value)}>{sliderValue}</span>}
        </div>
      )}
      <input
        type="range"
        className={cx(classes.input)}
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        disabled={disabled}
        name={name}
        aria-label={labelText}
        onChange={(event) => setSliderValue(Number(event.target.value))}
        onMouseUp={(event) =>
          typeof onChangeEnd === 'function' && onChangeEnd(Number(event.currentTarget.value))
        }
        onTouchEnd={(event) =>
          typeof onChangeEnd === 'function' && onChangeEnd(Number(event.currentTarget.value))
        }
      />
    </div>
  );
});

_Slider.displayName = 'Slider';

export { _Slider as Slider };
