import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';

export type CarouselOrientation = 'horizontal' | 'vertical';

export interface CarouselLabels {
  previous: string;
  next: string;
  slide(index: number): string;
  goTo(index: number): string;
}

export interface CarouselProps extends DefaultProps<CarouselStylesNames> {
  slides: React.ReactNode[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?(index: number): void;
  withIndicators?: boolean;
  withControls?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  pauseOnHover?: boolean;
  orientation?: CarouselOrientation;
  ariaLabel?: string;
  labels?: Partial<CarouselLabels>;
  height?: number | string;
}

interface CarouselStylesParams {
  orientation: CarouselOrientation;
}

const useStyles = createStyles((_theme, { orientation }: CarouselStylesParams) => {
  const vertical = orientation === 'vertical';

  return {
    root: {
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      borderRadius: 'var(--carousel-border-radius, 0.5rem)',
      backgroundColor: 'var(--carousel-background-color, var(--background-basic-color-1, #ffffff))',
      color: 'var(--carousel-text-color, var(--text-basic-color, #222b45))',
      outline: 'none',

      '&:focus-visible': {
        outline: '2px solid var(--carousel-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '2px'
      }
    },

    viewport: {
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    },

    track: {
      display: 'flex',
      flexDirection: vertical ? 'column' : 'row',
      width: '100%',
      height: '100%',
      transition: `transform var(--carousel-transition-duration, 300ms) ease`
    },

    slide: {
      flex: '0 0 100%',
      minWidth: 0,
      minHeight: 0,
      width: '100%',
      height: '100%'
    },

    control: {
      position: 'absolute',
      zIndex: 2,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '2.25rem',
      height: '2.25rem',
      padding: 0,
      border: 0,
      borderRadius: '50%',
      backgroundColor: 'var(--carousel-control-background-color, rgba(0, 0, 0, 0.45))',
      color: 'var(--carousel-control-color, #ffffff)',
      fontSize: '1.25rem',
      lineHeight: 1,
      cursor: 'pointer',

      '&:focus-visible': {
        outline: '2px solid var(--carousel-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '2px'
      }
    },

    controlPrevious: vertical
      ? {
          top: '0.75rem',
          left: '50%',
          transform: 'translateX(-50%)'
        }
      : {
          top: '50%',
          left: '0.75rem',
          transform: 'translateY(-50%)'
        },

    controlNext: vertical
      ? {
          bottom: '0.75rem',
          left: '50%',
          transform: 'translateX(-50%)'
        }
      : {
          top: '50%',
          right: '0.75rem',
          transform: 'translateY(-50%)'
        },

    indicators: {
      position: 'absolute',
      zIndex: 2,
      display: 'flex',
      gap: '0.375rem',
      ...(vertical
        ? { top: '50%', right: '0.75rem', flexDirection: 'column', transform: 'translateY(-50%)' }
        : { bottom: '0.75rem', left: '50%', flexDirection: 'row', transform: 'translateX(-50%)' })
    },

    indicator: {
      width: '0.5rem',
      height: '0.5rem',
      padding: 0,
      border: 0,
      borderRadius: '50%',
      backgroundColor: 'var(--carousel-indicator-color, rgba(255, 255, 255, 0.6))',
      cursor: 'pointer',

      '&:focus-visible': {
        outline: '2px solid var(--carousel-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '2px'
      }
    },

    indicatorActive: {
      backgroundColor: 'var(--carousel-indicator-active-color, var(--color-primary-500, #3366ff))'
    }
  };
});

export type CarouselStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<CarouselProps> = {
  withIndicators: true,
  withControls: true,
  loop: true,
  autoPlay: false,
  autoPlayInterval: 4000,
  pauseOnHover: true,
  orientation: 'horizontal',
  ariaLabel: 'Carousel',
  height: 320
};

const _Carousel = forwardRef<HTMLDivElement, CarouselProps>((props, ref) => {
  const {
    slides,
    index,
    defaultIndex,
    onIndexChange,
    withIndicators,
    withControls,
    loop,
    autoPlay,
    autoPlayInterval,
    pauseOnHover,
    orientation,
    ariaLabel,
    labels,
    height,
    className,
    style,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { orientation },
    { name: 'carousel', classNames, styles, unstyled }
  );
  const { t } = useNebularLocale();
  const resolvedLabels: CarouselLabels = {
    previous: t('carousel.previous', 'Previous slide'),
    next: t('carousel.next', 'Next slide'),
    slide: (slideNumber) => t('carousel.slide', 'Slide {index}', { index: slideNumber }),
    goTo: (slideNumber) => t('carousel.goTo', 'Go to slide {index}', { index: slideNumber }),
    ...labels
  };
  const [active, setActive] = useUncontrolled({
    value: index,
    defaultValue: defaultIndex,
    finalValue: 0,
    onChange: onIndexChange
  });
  const [paused, setPaused] = useState(false);
  const activeRef = useRef(active);
  const setActiveRef = useRef(setActive);

  const count = slides.length;
  const vertical = orientation === 'vertical';
  const resolvedHeight = typeof height === 'number' ? `${height}px` : height;

  useEffect(() => {
    activeRef.current = active;
    setActiveRef.current = setActive;
  });

  useEffect(() => {
    if (!autoPlay || count <= 1 || paused) {
      return undefined;
    }

    const timer = setInterval(() => {
      const currentIndex = activeRef.current;
      const nextIndex = currentIndex + 1 >= count ? (loop ? 0 : currentIndex) : currentIndex + 1;

      if (nextIndex !== currentIndex) {
        setActiveRef.current(nextIndex);
      }
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, count, loop, paused]);

  const goTo = (nextIndex: number) => {
    if (count <= 0) {
      return;
    }

    if (nextIndex < 0) {
      if (loop) {
        setActive(count - 1);
      }
      return;
    }

    if (nextIndex >= count) {
      if (loop) {
        setActive(0);
      }
      return;
    }

    setActive(nextIndex);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const previousKeys = vertical ? ['ArrowUp'] : ['ArrowLeft'];
    const nextKeys = vertical ? ['ArrowDown'] : ['ArrowRight'];

    if (previousKeys.includes(event.key)) {
      event.preventDefault();
      goTo(active - 1);
    } else if (nextKeys.includes(event.key)) {
      event.preventDefault();
      goTo(active + 1);
    }
  };

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setPaused(true);
    }
  };

  const handleMouseLeave = () => {
    setPaused(false);
  };

  const handleFocus = () => {
    setPaused(true);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setPaused(false);
  };

  const offset = active === 0 ? 0 : -active * 100;

  return (
    <div
      ref={ref}
      className={cx(classes.root, className)}
      style={{ height: resolvedHeight, ...style }}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      // The carousel region handles keyboard navigation itself.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div className={cx(classes.viewport)}>
        <div
          data-track="true"
          data-active-index={active}
          className={cx(classes.track)}
          style={{ transform: `translate${vertical ? 'Y' : 'X'}(${offset}%)` }}
        >
          {slides.map((slide, slideIndex) => (
            <div
              key={slideIndex}
              className={cx(classes.slide)}
              role="group"
              aria-roledescription="slide"
              aria-label={resolvedLabels.slide(slideIndex + 1)}
              inert={slideIndex !== active ? true : undefined}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {withControls && count > 1 && (
        <>
          <button
            type="button"
            className={cx(classes.control, classes.controlPrevious)}
            aria-label={resolvedLabels.previous}
            onClick={() => goTo(active - 1)}
          >
            <span aria-hidden="true">{vertical ? '▲' : '‹'}</span>
          </button>
          <button
            type="button"
            className={cx(classes.control, classes.controlNext)}
            aria-label={resolvedLabels.next}
            onClick={() => goTo(active + 1)}
          >
            <span aria-hidden="true">{vertical ? '▼' : '›'}</span>
          </button>
        </>
      )}

      {withIndicators && count > 1 && (
        <div className={cx(classes.indicators)}>
          {slides.map((_slide, slideIndex) => (
            <button
              key={slideIndex}
              type="button"
              className={cx(classes.indicator, {
                [classes.indicatorActive]: slideIndex === active
              })}
              aria-label={resolvedLabels.goTo(slideIndex + 1)}
              aria-current={slideIndex === active ? 'true' : undefined}
              onClick={() => goTo(slideIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
});

_Carousel.displayName = 'Carousel';

export { _Carousel as Carousel };
