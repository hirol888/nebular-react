import React, { forwardRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface RangeSliderProps
  extends
    DefaultProps<RangeSliderStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?(value: [number, number]): void;
  onChangeEnd?(value: [number, number]): void;
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
    color: 'var(--range-slider-label-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--range-slider-label-font-size, 0.8125rem)',
    fontWeight: 600
  },

  value: {
    color: 'var(--range-slider-value-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--range-slider-value-font-size, 0.75rem)',
    fontVariantNumeric: 'tabular-nums'
  },

  track: {
    position: 'relative',
    height: '1.75rem'
  },

  input: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '1.75rem',
    margin: 0,
    appearance: 'none',
    background: 'transparent',
    pointerEvents: 'none',
    accentColor: `var(--range-slider-${status}-color, var(--color-primary-500, #3366ff))`,

    '&::-webkit-slider-thumb': {
      appearance: 'none',
      width: '1rem',
      height: '1rem',
      borderRadius: '50%',
      backgroundColor: `var(--range-slider-${status}-color, var(--color-primary-500, #3366ff))`,
      pointerEvents: 'auto',
      cursor: 'pointer'
    },

    '&::-moz-range-thumb': {
      width: '1rem',
      height: '1rem',
      borderRadius: '50%',
      border: 0,
      backgroundColor: `var(--range-slider-${status}-color, var(--color-primary-500, #3366ff))`,
      pointerEvents: 'auto',
      cursor: 'pointer'
    },

    '&:disabled': {
      opacity: 0.5
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  }
}));

export type RangeSliderStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<RangeSliderProps> = {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  showValue: true,
  status: 'primary'
};

const _RangeSlider = forwardRef<HTMLDivElement, RangeSliderProps>((props, ref) => {
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
  const { classes, cx } = useStyles(
    { status },
    { name: 'range-slider', classNames, styles, unstyled }
  );
  const [rangeValue, setRangeValue] = useUncontrolled<[number, number]>({
    value,
    defaultValue: defaultValue ?? [min, max],
    finalValue: [min, max],
    onChange
  });
  const [start, end] = rangeValue;
  const labelText = ariaLabel ?? (typeof label === 'string' ? label : 'Range slider');

  const updateStart = (nextStart: number) => {
    setRangeValue([Math.min(nextStart, end), end]);
  };

  const updateEnd = (nextEnd: number) => {
    setRangeValue([start, Math.max(nextEnd, start)]);
  };

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      {(label || showValue) && (
        <div className={cx(classes.labelRow)}>
          {label && <span>{label}</span>}
          {showValue && (
            <span className={cx(classes.value)}>
              {start} – {end}
            </span>
          )}
        </div>
      )}
      <div className={cx(classes.track)}>
        <input
          type="range"
          className={cx(classes.input)}
          min={min}
          max={max}
          step={step}
          value={start}
          disabled={disabled}
          name={name ? `${name}-start` : undefined}
          aria-label={`${labelText} start`}
          onChange={(event) => updateStart(Number(event.target.value))}
          onMouseUp={() => typeof onChangeEnd === 'function' && onChangeEnd([start, end])}
          onTouchEnd={() => typeof onChangeEnd === 'function' && onChangeEnd([start, end])}
        />
        <input
          type="range"
          className={cx(classes.input)}
          min={min}
          max={max}
          step={step}
          value={end}
          disabled={disabled}
          name={name ? `${name}-end` : undefined}
          aria-label={`${labelText} end`}
          onChange={(event) => updateEnd(Number(event.target.value))}
          onMouseUp={() => typeof onChangeEnd === 'function' && onChangeEnd([start, end])}
          onTouchEnd={() => typeof onChangeEnd === 'function' && onChangeEnd([start, end])}
        />
      </div>
    </div>
  );
});

_RangeSlider.displayName = 'RangeSlider';

export { _RangeSlider as RangeSlider };
