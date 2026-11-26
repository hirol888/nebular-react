import React, { forwardRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Slider } from '../Slider';

export interface ImageComparisonSource {
  src: string;
  alt: string;
}

export interface ImageComparisonLabels {
  comparison: string;
  before: React.ReactNode;
  after: React.ReactNode;
}

const useStyles = createStyles(() => ({
  root: {
    margin: 0,
    color: 'var(--text-basic-color, #222b45)'
  },
  viewport: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 'var(--image-comparison-border-radius, 0.5rem)',
    backgroundColor: 'var(--background-basic-color-2, #f7f9fc)',
    '&:focus-within': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },
  image: {
    position: 'absolute',
    inset: 0,
    display: 'block',
    width: '100%',
    height: '100%',
    userSelect: 'none'
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    transform: 'translateX(-50%)',
    backgroundColor: 'var(--image-comparison-divider-color, #fff)',
    boxShadow: '0 0 4px rgb(0 0 0 / 45%)',
    display: 'grid',
    alignItems: 'center',
    justifyItems: 'center',
    pointerEvents: 'none'
  },
  handle: {
    width: '2.5rem',
    height: '2.5rem',
    display: 'grid',
    placeItems: 'center',
    border: '2px solid var(--image-comparison-divider-color, #fff)',
    borderRadius: '50%',
    color: 'var(--text-basic-color, #222b45)',
    backgroundColor: 'var(--background-basic-color-1, #fff)',
    boxShadow: '0 0 8px rgb(0 0 0 / 35%)'
  },
  control: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  input: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    appearance: 'none',
    opacity: 0,
    cursor: 'ew-resize',
    touchAction: 'pan-y',
    '&::-webkit-slider-thumb': {
      appearance: 'none',
      width: 1,
      height: 1
    },
    '&::-moz-range-thumb': {
      border: 0,
      width: 1,
      height: 1
    }
  },
  imageLabels: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.25rem',
    padding: '0.5rem',
    pointerEvents: 'none'
  },
  imageLabel: {
    padding: '0.125rem 0.5rem',
    borderRadius: '0.25rem',
    color: 'var(--text-basic-color, #222b45)',
    backgroundColor: 'var(--background-basic-color-1, #fff)',
    fontSize: '0.875rem',
    fontWeight: 600
  },
  caption: {
    marginBlockStart: '0.5rem'
  }
}));

export type ImageComparisonStylesNames = Selectors<typeof useStyles>;

export interface ImageComparisonProps
  extends
    DefaultProps<ImageComparisonStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'figure'>, 'children' | 'onChange'> {
  before: ImageComparisonSource;
  after: ImageComparisonSource;
  /** Percentage of the before image visible from the left edge. */
  value?: number;
  defaultValue?: number;
  onChange?(value: number): void;
  disabled?: boolean;
  aspectRatio?: React.CSSProperties['aspectRatio'];
  fit?: 'cover' | 'contain';
  labels?: Partial<ImageComparisonLabels>;
  caption?: React.ReactNode;
}

const defaultProps: Partial<ImageComparisonProps> = {
  defaultValue: 50,
  aspectRatio: '16 / 9',
  fit: 'cover'
};

const defaultLabels: ImageComparisonLabels = {
  comparison: 'Compare images',
  before: 'Before',
  after: 'After'
};

export const ImageComparison = forwardRef<HTMLElement, ImageComparisonProps>((props, ref) => {
  const {
    before,
    after,
    value,
    defaultValue,
    onChange,
    disabled,
    aspectRatio,
    fit,
    labels,
    caption,
    className,
    classNames,
    styles,
    unstyled,
    ...otherProps
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'image-comparison',
    classNames,
    styles,
    unstyled
  });
  const [position, setPosition] = useUncontrolled({
    value,
    defaultValue,
    finalValue: 50,
    onChange
  });
  const percent = Number.isFinite(position) ? Math.min(100, Math.max(0, Math.round(position))) : 50;
  const text = { ...defaultLabels, ...labels };

  return (
    <figure {...otherProps} ref={ref} className={cx(classes.root, className)}>
      <div className={classes.viewport} style={{ aspectRatio }}>
        <img
          {...after}
          alt={after.alt}
          className={classes.image}
          style={{ objectFit: fit }}
          draggable={false}
        />
        <img
          {...before}
          alt={before.alt}
          className={classes.image}
          style={{ objectFit: fit, clipPath: `inset(0 ${100 - percent}% 0 0)` }}
          draggable={false}
        />
        <div className={classes.imageLabels} dir="ltr" aria-hidden="true">
          {text.before != null && <span className={classes.imageLabel}>{text.before}</span>}
          {text.after != null && <span className={classes.imageLabel}>{text.after}</span>}
        </div>
        <div className={classes.divider} style={{ left: `${percent}%` }} aria-hidden="true">
          <span className={classes.handle}>↔</span>
        </div>
        <Slider
          dir="ltr"
          className={classes.control}
          classNames={{ input: classes.input }}
          ariaLabel={text.comparison}
          value={percent}
          onChange={setPosition}
          disabled={disabled}
          showValue={false}
        />
      </div>
      {caption != null && <figcaption className={classes.caption}>{caption}</figcaption>}
    </figure>
  );
});

ImageComparison.displayName = 'ImageComparison';
