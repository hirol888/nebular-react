import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Selectors, createStyles, useNebularLocale } from '@nebular-react/styles';
import { Icon } from '../Icon';
import { Calendar } from '../Calendar';

export interface DesktopCalendarFlyoutAnchorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type DesktopCalendarFlyoutPlacement = 'top' | 'bottom';

export interface DesktopCalendarFlyoutLabels {
  title: string;
  close: string;
}

export interface DesktopCalendarFlyoutProps {
  open: boolean;
  onClose(): void;
  anchorRect?: DesktopCalendarFlyoutAnchorRect;
  placement?: DesktopCalendarFlyoutPlacement;
  date?: Date;
  onDateChange?(date: Date): void;
  labels?: Partial<DesktopCalendarFlyoutLabels>;
  ariaLabel?: string;
  className?: string;
  /** Renders the flyout through a portal into this element. */
  container?: HTMLElement | null;
}

const ANCHOR_OFFSET = 8;

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'fixed',
    zIndex: 'var(--desktop-calendar-z-index, 1600000000)' as unknown as number,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--desktop-calendar-gap, 0.5rem)',
    boxSizing: 'border-box',
    width: 'var(--desktop-calendar-width, 21rem)',
    maxWidth: 'calc(100vw - 1rem)',
    maxHeight: 'calc(100vh - 1rem)',
    overflow: 'auto',
    padding: 'var(--desktop-calendar-padding, 0.65rem)',
    border: '1px solid var(--desktop-calendar-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-calendar-radius, 0.5rem)',
    backgroundColor:
      'var(--desktop-calendar-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--desktop-calendar-color, var(--text-basic-color, #222b45))',
    boxShadow: 'var(--desktop-calendar-shadow, 0 14px 38px rgba(0, 0, 0, 0.22))',
    fontFamily: 'var(--desktop-calendar-font-family, inherit)',
    outline: 'none'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  title: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.3
  },

  close: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--desktop-calendar-action-size, 1.75rem)',
    height: 'var(--desktop-calendar-action-size, 1.75rem)',
    marginInlineStart: 'auto',
    padding: 0,
    border: 0,
    borderRadius: 'var(--desktop-calendar-action-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--desktop-calendar-action-hover-background-color, var(--background-basic-color-3, #edf1f7))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  calendar: {
    display: 'flex',
    justifyContent: 'center',
    minWidth: 0
  }
}));

export type DesktopCalendarFlyoutStylesNames = Selectors<typeof useStyles>;

function isInsideAnchor(
  clientX: number,
  clientY: number,
  anchorRect: DesktopCalendarFlyoutAnchorRect
): boolean {
  return (
    clientX >= anchorRect.left &&
    clientX <= anchorRect.left + anchorRect.width &&
    clientY >= anchorRect.top &&
    clientY <= anchorRect.top + anchorRect.height
  );
}

export const DesktopCalendarFlyout = React.forwardRef<HTMLDivElement, DesktopCalendarFlyoutProps>(
  (props, ref) => {
    const {
      open,
      onClose,
      anchorRect,
      placement = 'bottom',
      date,
      onDateChange,
      labels: labelsProp,
      ariaLabel,
      className,
      container
    } = props;
    const { classes, cx } = useStyles(undefined, { name: 'desktop-calendar-flyout' });
    const { t } = useNebularLocale();
    const labels = useMemo<DesktopCalendarFlyoutLabels>(
      () => ({
        title: t('desktop.calendar', 'Calendar'),
        close: t('desktop.closeCalendar', 'Close calendar'),
        ...labelsProp
      }),
      [t, labelsProp]
    );
    const rootRef = useRef<HTMLDivElement | null>(null);
    const restoreFocusRef = useRef<HTMLElement | null>(null);
    const [measuredCenter, setMeasuredCenter] = useState<number | null>(null);

    useLayoutEffect(() => {
      if (!open || !anchorRect) {
        setMeasuredCenter(null);
        return;
      }

      const element = rootRef.current;
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

      if (!element || !viewportWidth) {
        return;
      }

      const center = anchorRect.left + anchorRect.width / 2;
      const halfWidth = element.offsetWidth / 2;
      const margin = 8;

      setMeasuredCenter(
        Math.min(Math.max(center, margin + halfWidth), viewportWidth - margin - halfWidth)
      );
    }, [anchorRect, open, placement]);

    const positionStyle = useMemo<React.CSSProperties>(() => {
      if (!anchorRect) {
        return {
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        };
      }

      const center = measuredCenter ?? anchorRect.left + anchorRect.width / 2;

      if (placement === 'top') {
        return {
          left: center,
          top: anchorRect.top - ANCHOR_OFFSET,
          transform: 'translate(-50%, -100%)'
        };
      }

      return {
        left: center,
        top: anchorRect.top + anchorRect.height + ANCHOR_OFFSET,
        transform: 'translateX(-50%)'
      };
    }, [anchorRect, measuredCenter, placement]);

    useEffect(() => {
      if (!open) {
        return undefined;
      }

      const active = document.activeElement;

      restoreFocusRef.current =
        active instanceof HTMLElement && active !== document.body ? active : null;
      rootRef.current?.focus();

      return () => {
        const previous = restoreFocusRef.current;

        restoreFocusRef.current = null;
        if (previous?.isConnected) {
          previous.focus();
        }
      };
    }, [open]);

    useEffect(() => {
      if (!open) {
        return undefined;
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      };

      const handleMouseDown = (event: MouseEvent) => {
        const { target, clientX, clientY } = event;

        if (target instanceof Node && rootRef.current?.contains(target)) {
          return;
        }

        if (anchorRect && isInsideAnchor(clientX, clientY, anchorRect)) {
          return;
        }

        onClose();
      };

      document.addEventListener('keydown', handleKeyDown, true);
      document.addEventListener('mousedown', handleMouseDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('mousedown', handleMouseDown);
      };
    }, [open, onClose, anchorRect]);

    if (!open) {
      return null;
    }

    const dialog = (
      <div
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cx(classes.root, className)}
        style={positionStyle}
        role="dialog"
        aria-label={ariaLabel ?? labels.title}
        tabIndex={-1}
        data-desktop-calendar-flyout=""
        data-placement={placement}
      >
        <div className={cx(classes.header)}>
          <h2 className={cx(classes.title)}>{labels.title}</h2>
          <button
            type="button"
            className={cx(classes.close)}
            aria-label={labels.close}
            title={labels.close}
            onClick={onClose}
          >
            <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
          </button>
        </div>
        <div className={cx(classes.calendar)}>
          <Calendar date={date} onDateChange={onDateChange} />
        </div>
      </div>
    );

    return container ? createPortal(dialog, container) : dialog;
  }
);

DesktopCalendarFlyout.displayName = 'DesktopCalendarFlyout';
