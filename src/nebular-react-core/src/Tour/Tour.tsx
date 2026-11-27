import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useMergedRef, useUncontrolled } from '@nebular-react/hooks';

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  target?: string | (() => HTMLElement | null);
  title?: React.ReactNode;
  content: React.ReactNode;
  placement?: TourPlacement;
}

interface TourStylesParams {
  hasTarget: boolean;
}

const useStyles = createStyles((_theme, { hasTarget }: TourStylesParams) => {
  const overlayColor = 'var(--tour-overlay-color, rgba(0, 0, 0, 0.65))';

  return {
    root: {
      position: 'fixed',
      inset: 0,
      zIndex: 'var(--tour-z-index, 1400)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    overlay: {
      position: 'absolute',
      inset: 0,
      padding: 0,
      border: 0,
      backgroundColor: hasTarget ? 'transparent' : overlayColor,
      cursor: 'default'
    },

    spotlight: {
      position: 'fixed',
      zIndex: 1,
      borderRadius: 'var(--tour-spotlight-border-radius, 0.5rem)',
      boxShadow: `0 0 0 9999px ${overlayColor}`,
      pointerEvents: 'none',
      transition: 'top 150ms ease, left 150ms ease, width 150ms ease, height 150ms ease'
    },

    card: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      boxSizing: 'border-box',
      width: 'var(--tour-card-width, 20rem)',
      maxWidth: 'calc(100vw - 2rem)',
      padding: 'var(--tour-card-padding, 1rem)',
      borderRadius: 'var(--tour-card-border-radius, 0.5rem)',
      backgroundColor: 'var(--tour-background-color, var(--background-basic-color-1, #ffffff))',
      color: 'var(--tour-text-color, var(--text-basic-color, #222b45))',
      boxShadow: 'var(--tour-shadow, 0 12px 32px rgba(0, 0, 0, 0.28))',
      outline: 'none'
    },

    title: {
      margin: 0,
      fontSize: '0.9375rem',
      fontWeight: 600,
      lineHeight: 1.4
    },

    content: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: 'var(--tour-content-color, var(--tour-text-color, inherit))'
    },

    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },

    indicator: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: 'var(--tour-indicator-color, var(--text-hint-color, #8f9bb3))'
    },

    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginInlineStart: 'auto'
    },

    button: {
      padding: '0.25rem 0.75rem',
      border: '1px solid var(--tour-button-border-color, var(--border-basic-color-3, #e4e9f2))',
      borderRadius: 'var(--tour-button-border-radius, 0.375rem)',
      backgroundColor: 'transparent',
      color: 'inherit',
      fontFamily: 'inherit',
      fontSize: '0.8125rem',
      lineHeight: 1.4,
      cursor: 'pointer',

      '&:focus-visible': {
        outline: '2px solid var(--color-primary-500, #3366ff)',
        outlineOffset: '2px'
      }
    },

    primaryButton: {
      borderColor: 'transparent',
      backgroundColor: 'var(--tour-primary-color, var(--color-primary-500, #3366ff))',
      color: 'var(--tour-primary-text-color, #ffffff)',

      '&:hover': {
        backgroundColor: 'var(--tour-primary-hover-color, var(--color-primary-600, #274bdb))'
      }
    },

    skipButton: {
      paddingInline: '0.25rem',
      borderColor: 'transparent',
      color: 'var(--tour-skip-color, var(--text-hint-color, #8f9bb3))'
    }
  };
});

export type TourStylesNames = Selectors<typeof useStyles>;

export interface TourProps extends DefaultProps<TourStylesNames> {
  steps: TourStep[];
  opened?: boolean;
  defaultOpened?: boolean;
  onOpenChange?(opened: boolean): void;
  activeStep?: number;
  defaultActiveStep?: number;
  onStepChange?(index: number): void;
  onFinish?(): void;
  onClose?(): void;
  nextLabel?: string;
  prevLabel?: string;
  finishLabel?: string;
  skipLabel?: string;
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  ariaLabel?: string;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const CARD_OFFSET = 12;

const defaultProps: Partial<TourProps> = {
  nextLabel: 'Next',
  prevLabel: 'Previous',
  finishLabel: 'Finish',
  skipLabel: 'Skip',
  closeOnEsc: true,
  closeOnOverlayClick: false
};

function resolveTarget(target: TourStep['target']): HTMLElement | null {
  if (!target) {
    return null;
  }

  if (typeof target === 'function') {
    return target();
  }

  if (typeof document === 'undefined') {
    return null;
  }

  try {
    return document.querySelector<HTMLElement>(target);
  } catch {
    return null;
  }
}

function isSameRect(current: TargetRect | null, next: TargetRect | null): boolean {
  if (current === next) {
    return true;
  }

  if (!current || !next) {
    return false;
  }

  return (
    current.top === next.top &&
    current.left === next.left &&
    current.width === next.width &&
    current.height === next.height
  );
}

function getCardStyle(rect: TargetRect, placement: TourPlacement): React.CSSProperties {
  const centerInline = rect.left + rect.width / 2;
  const centerBlock = rect.top + rect.height / 2;

  if (placement === 'top') {
    return {
      position: 'fixed',
      top: rect.top - CARD_OFFSET,
      left: centerInline,
      transform: 'translate(-50%, -100%)'
    };
  }

  if (placement === 'left') {
    return {
      position: 'fixed',
      top: centerBlock,
      left: rect.left - CARD_OFFSET,
      transform: 'translate(-100%, -50%)'
    };
  }

  if (placement === 'right') {
    return {
      position: 'fixed',
      top: centerBlock,
      left: rect.left + rect.width + CARD_OFFSET,
      transform: 'translateY(-50%)'
    };
  }

  return {
    position: 'fixed',
    top: rect.top + rect.height + CARD_OFFSET,
    left: centerInline,
    transform: 'translateX(-50%)'
  };
}

const _Tour = forwardRef<HTMLDivElement, TourProps>((props, ref) => {
  const {
    steps,
    opened,
    defaultOpened,
    onOpenChange,
    activeStep,
    defaultActiveStep,
    onStepChange,
    onFinish,
    onClose,
    nextLabel,
    prevLabel,
    finishLabel,
    skipLabel,
    closeOnEsc,
    closeOnOverlayClick,
    ariaLabel,
    className,
    style,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);

  const [isOpen, setOpened] = useUncontrolled<boolean>({
    value: opened,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange: onOpenChange
  });
  const [currentStep, setCurrentStep] = useUncontrolled<number>({
    value: activeStep,
    defaultValue: defaultActiveStep,
    finalValue: 0,
    onChange: onStepChange
  });
  const [rect, setRect] = useState<TargetRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const previousOverflowRef = useRef<string>('');

  const stepIndex = steps.length > 0 ? Math.min(Math.max(currentStep, 0), steps.length - 1) : 0;
  const step = steps[stepIndex];
  const placement = step?.placement ?? 'bottom';
  const mergedCardRef = useMergedRef(ref, cardRef);

  const { classes, cx } = useStyles(
    { hasTarget: rect !== null },
    { name: 'tour', classNames, styles, unstyled }
  );

  const close = useCallback(() => {
    if (!isOpen) {
      return;
    }

    setOpened(false);
    onClose?.();
  }, [isOpen, setOpened, onClose]);

  const finish = () => {
    onFinish?.();
    close();
  };

  const goToPreviousStep = useCallback(() => {
    if (stepIndex > 0) {
      setCurrentStep(stepIndex - 1);
    }
  }, [stepIndex, setCurrentStep]);

  const goToNextStep = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  }, [stepIndex, steps.length, setCurrentStep]);

  useEffect(() => {
    if (!isOpen) {
      setRect(null);
      return undefined;
    }

    const update = () => {
      const element = resolveTarget(step?.target);

      if (!element) {
        setRect((current) => (current === null ? current : null));
        return;
      }

      const bounding = element.getBoundingClientRect();
      const next: TargetRect = {
        top: bounding.top,
        left: bounding.left,
        width: bounding.width,
        height: bounding.height
      };

      setRect((current) => (isSameRect(current, next) ? current : next));
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cardRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflowRef.current;
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      cardRef.current?.focus();
    }
  }, [isOpen, stepIndex]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (closeOnEsc) {
          event.preventDefault();
          close();
        }
        return;
      }

      const target = event.target as HTMLElement | null;
      const isEditing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        !!target?.isContentEditable;

      if (isEditing) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextStep();
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousStep();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, close, goToNextStep, goToPreviousStep]);

  if (!isOpen || !step || typeof document === 'undefined') {
    return null;
  }

  const label = ariaLabel || (typeof step.title === 'string' && step.title ? step.title : 'Tour');
  const isLastStep = stepIndex === steps.length - 1;

  const tour = (
    <div className={cx(classes.root, className)} style={style}>
      <button
        type="button"
        className={cx(classes.overlay)}
        aria-label="Close tour overlay"
        tabIndex={-1}
        onClick={() => closeOnOverlayClick && close()}
      />
      {rect && (
        <div
          className={cx(classes.spotlight)}
          data-tour-spotlight=""
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
        />
      )}
      <div
        ref={mergedCardRef}
        className={cx(classes.card)}
        role="dialog"
        aria-label={label}
        tabIndex={-1}
        style={rect ? getCardStyle(rect, placement) : undefined}
      >
        {step.title && <div className={cx(classes.title)}>{step.title}</div>}
        <div className={cx(classes.content)}>{step.content}</div>
        <div className={cx(classes.footer)}>
          <span className={cx(classes.indicator)} aria-live="polite">
            Step {stepIndex + 1} of {steps.length}
          </span>
          <div className={cx(classes.actions)}>
            <button
              type="button"
              className={cx(classes.button, classes.skipButton)}
              onClick={close}
            >
              {skipLabel}
            </button>
            {stepIndex > 0 && (
              <button type="button" className={cx(classes.button)} onClick={goToPreviousStep}>
                {prevLabel}
              </button>
            )}
            {isLastStep ? (
              <button
                type="button"
                className={cx(classes.button, classes.primaryButton)}
                onClick={finish}
              >
                {finishLabel}
              </button>
            ) : (
              <button
                type="button"
                className={cx(classes.button, classes.primaryButton)}
                onClick={goToNextStep}
              >
                {nextLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(tour, document.body);
});

_Tour.displayName = 'Tour';

export { _Tour as Tour };
