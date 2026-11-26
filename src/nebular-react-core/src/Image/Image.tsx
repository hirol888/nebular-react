import React, { forwardRef, useEffect, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Skeleton } from '../Skeleton';

export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

export interface ImageStylesParams {
  radius?: number | string;
  fit?: ImageFit;
}

const useStyles = createStyles((_theme, { radius, fit }: ImageStylesParams) => {
  const resolvedRadius = typeof radius === 'number' ? `${radius}px` : radius || undefined;

  return {
    root: {
      display: 'inline-block',
      maxWidth: '100%'
    },

    imageWrapper: {
      position: 'relative',
      display: 'block',
      overflow: 'hidden',
      borderRadius: resolvedRadius
    },

    image: {
      display: 'block',
      width: '100%',
      height: '100%',
      objectFit: fit,
      borderRadius: resolvedRadius
    },

    placeholder: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },

    caption: {
      display: 'block',
      marginTop: '0.25rem',
      color: 'var(--image-caption-color, var(--text-hint-color, #8f9bb3))',
      fontFamily: 'var(--image-caption-font-family, inherit)',
      fontSize: 'var(--image-caption-font-size, 0.8125rem)',
      lineHeight: 1.5
    }
  };
});

export type ImageStylesNames = Selectors<typeof useStyles>;

export interface ImageProps
  extends
    DefaultProps<ImageStylesNames, ImageStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'img'>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  radius?: number | string;
  fit?: ImageFit;
  fallbackSrc?: string;
  withSkeleton?: boolean;
  skeletonHeight?: number | string;
  onLoad?(): void;
  onError?(): void;
  caption?: React.ReactNode;
  wrapperClassName?: string;
}

const defaultProps: Partial<ImageProps> = {
  withSkeleton: true
};

const _Image = forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  const {
    src,
    alt,
    radius,
    fit,
    fallbackSrc,
    withSkeleton,
    skeletonHeight,
    onLoad,
    onError,
    caption,
    wrapperClassName,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { radius, fit },
    { name: 'image', classNames, styles, unstyled }
  );

  const [currentSrc, setCurrentSrc] = useState(src);
  const [loading, setLoading] = useState(Boolean(withSkeleton));
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setLoading(Boolean(withSkeleton));
    setUsedFallback(false);
  }, [src, withSkeleton]);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    if (fallbackSrc && !usedFallback && currentSrc !== fallbackSrc) {
      setUsedFallback(true);
      setCurrentSrc(fallbackSrc);
    } else {
      setLoading(false);
    }

    onError?.();
  };

  const showPlaceholder = Boolean(withSkeleton) && loading;

  return (
    <div className={cx(classes.root, wrapperClassName)}>
      <div className={cx(classes.imageWrapper)}>
        <img
          {...others}
          ref={ref}
          src={currentSrc}
          alt={alt}
          className={cx(classes.image, className)}
          onLoad={handleLoad}
          onError={handleError}
        />
        {showPlaceholder && (
          <Skeleton
            className={cx(classes.placeholder)}
            width="100%"
            height={skeletonHeight ?? '100%'}
            radius={radius}
          />
        )}
      </div>
      {Boolean(caption) && <span className={cx(classes.caption)}>{caption}</span>}
    </div>
  );
});

_Image.displayName = 'Image';

export { _Image as Image };
