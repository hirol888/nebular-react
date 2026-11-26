import React, { forwardRef, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { useMergedRef } from '@nebular-react/hooks';

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
    fontFamily: 'inherit'
  },

  svg: {
    display: 'block',
    maxWidth: '100%',
    border: '1px solid var(--signature-pad-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--signature-pad-border-radius, 0.25rem)',
    touchAction: 'none',
    userSelect: 'none'
  },

  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },

  clear: {
    alignSelf: 'flex-start',
    padding: '0.35rem 0.75rem',
    border: '1px solid var(--signature-pad-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--signature-pad-border-radius, 0.25rem)',
    backgroundColor: 'var(--signature-pad-clear-background-color, transparent)',
    color: 'var(--signature-pad-clear-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    fontSize: '0.8125rem',
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

export type SignaturePadStylesNames = Selectors<typeof useStyles>;

export interface SignaturePadProps extends DefaultProps<SignaturePadStylesNames> {
  /** SVG path data produced by the pad. */
  value?: string;
  defaultValue?: string;
  onChange?(pathData: string): void;
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
  disabled?: boolean;
  clearable?: boolean;
  ariaLabel?: string;
}

const defaultProps: Partial<SignaturePadProps> = {
  height: 160,
  penColor: '#222b45',
  backgroundColor: 'transparent',
  disabled: false,
  clearable: true
};

const _SignaturePad = forwardRef<SVGSVGElement, SignaturePadProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    width,
    height,
    penColor,
    backgroundColor,
    disabled,
    clearable,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'signature-pad',
    classNames,
    styles,
    unstyled
  });
  const { t } = useNebularLocale();
  const resolvedAriaLabel = ariaLabel ?? t('signaturePad.ariaLabel', 'Signature pad');

  const [internalValue, setInternalValue] = useState<string>(defaultValue ?? '');
  const isControlled = value !== undefined;
  const committed = isControlled ? value : internalValue;
  const [currentStroke, setCurrentStroke] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const mergedRef = useMergedRef(svgRef, ref);
  const drawingRef = useRef(false);
  const strokeRef = useRef('');

  const getPoint = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    return {
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top)
    };
  };

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (disabled) {
      return;
    }

    const { x, y } = getPoint(event);

    drawingRef.current = true;
    strokeRef.current = `M${x} ${y}`;
    setCurrentStroke(strokeRef.current);

    const target = event.currentTarget;

    if (typeof target.setPointerCapture === 'function') {
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is optional (and unavailable in some test environments).
      }
    }
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (disabled || !drawingRef.current) {
      return;
    }

    const { x, y } = getPoint(event);

    strokeRef.current = `${strokeRef.current} L${x} ${y}`;
    setCurrentStroke(strokeRef.current);
  };

  const finishStroke = (event: React.PointerEvent<SVGSVGElement>) => {
    if (disabled || !drawingRef.current) {
      return;
    }

    drawingRef.current = false;

    const stroke = strokeRef.current;
    strokeRef.current = '';
    setCurrentStroke(null);

    const target = event.currentTarget;

    if (typeof target.releasePointerCapture === 'function') {
      try {
        target.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture is optional (and unavailable in some test environments).
      }
    }

    if (stroke === '') {
      return;
    }

    const nextValue = `${committed} ${stroke}`.trim();

    if (!isControlled) {
      setInternalValue(nextValue);
    }

    typeof onChange === 'function' && onChange(nextValue);
  };

  const handleClear = () => {
    if (disabled) {
      return;
    }

    drawingRef.current = false;
    strokeRef.current = '';
    setCurrentStroke(null);

    if (!isControlled) {
      setInternalValue('');
    }

    typeof onChange === 'function' && onChange('');
  };

  const pathData = `${committed} ${currentStroke ?? ''}`.trim();

  return (
    <div className={cx(classes.root, className)}>
      <svg
        ref={mergedRef}
        className={cx(classes.svg, { [classes.disabled]: disabled })}
        width={width ?? '100%'}
        height={height}
        role="img"
        aria-label={resolvedAriaLabel}
        style={{ backgroundColor, cursor: disabled ? 'not-allowed' : 'crosshair' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerLeave={finishStroke}
        onPointerCancel={finishStroke}
      >
        {pathData !== '' && (
          <path
            d={pathData}
            fill="none"
            stroke={penColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {clearable && !disabled && (
        <button
          type="button"
          className={cx(classes.clear)}
          onClick={handleClear}
          disabled={pathData === ''}
        >
          {t('signaturePad.clear', 'Clear')}
        </button>
      )}
    </div>
  );
});

_SignaturePad.displayName = 'SignaturePad';

export { _SignaturePad as SignaturePad };
