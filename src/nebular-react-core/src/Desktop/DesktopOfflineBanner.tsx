import React, { forwardRef } from 'react';
import { DefaultProps, Selectors, createStyles, useNebularLocale } from '@nebular-react/styles';
import { useOnlineStatus } from './Desktop.gestures';

export type DesktopOfflineBannerPosition = 'top' | 'bottom';

export interface DesktopOfflineBannerLabels {
  /** Banner title. Defaults to the `desktop.offline` message. */
  title: string;
  /** Banner description. Defaults to the `desktop.offlineDescription` message. */
  description: string;
  /** Retry button label. Defaults to the `desktop.retryConnection` message. */
  retry: string;
}

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'absolute',
    insetInline: 0,
    zIndex: 'var(--desktop-offline-banner-z-index, 2000000000)' as unknown as number,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 'var(--desktop-offline-banner-inset, 0.75rem)',
    pointerEvents: 'none',
    '&[hidden]': {
      display: 'none'
    }
  },
  top: {
    top: 'var(--desktop-offline-banner-offset, 0.75rem)',
    alignItems: 'flex-start'
  },
  bottom: {
    bottom: 'var(--desktop-offline-banner-offset, 0.75rem)',
    alignItems: 'flex-end'
  },
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--desktop-offline-banner-gap, 0.75rem)',
    maxWidth: 'var(--desktop-offline-banner-max-width, 32rem)',
    padding: 'var(--desktop-offline-banner-padding, 0.625rem 0.875rem)',
    border: '1px solid var(--desktop-offline-banner-border-color, #f0b4b4)',
    borderRadius: 'var(--desktop-offline-banner-border-radius, 0.5rem)',
    background: 'var(--desktop-offline-banner-background, #fff4f4)',
    color: 'var(--desktop-offline-banner-text-color, #8a1f1f)',
    boxShadow: 'var(--desktop-offline-banner-shadow, 0 10px 30px rgba(15, 23, 42, 0.18))',
    fontSize: 'var(--desktop-offline-banner-font-size, 0.8125rem)',
    lineHeight: 1.4,
    pointerEvents: 'auto'
  },
  indicator: {
    flexShrink: 0,
    width: 'var(--desktop-offline-banner-indicator-size, 0.5rem)',
    height: 'var(--desktop-offline-banner-indicator-size, 0.5rem)',
    borderRadius: '999px',
    background: 'var(--desktop-offline-banner-indicator-color, #e03131)',
    boxShadow: '0 0 0 3px var(--desktop-offline-banner-indicator-ring, rgba(224, 49, 49, 0.16))'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
    minWidth: 0
  },
  title: {
    fontWeight: 600
  },
  description: {
    color: 'var(--desktop-offline-banner-description-color, #6b2b2b)',
    overflowWrap: 'anywhere'
  },
  retry: {
    flexShrink: 0,
    marginInlineStart: '0.25rem',
    padding: '0.25rem 0.625rem',
    border: '1px solid var(--desktop-offline-banner-retry-border-color, #d98b8b)',
    borderRadius: 'var(--desktop-offline-banner-retry-border-radius, 0.375rem)',
    background: 'var(--desktop-offline-banner-retry-background, transparent)',
    color: 'var(--desktop-offline-banner-retry-color, #8a1f1f)',
    font: 'inherit',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 120ms ease',
    '&:hover': {
      background: 'var(--desktop-offline-banner-retry-hover-background, rgba(138, 31, 31, 0.08))'
    },
    '&:focus-visible': {
      outline: '2px solid var(--desktop-offline-banner-focus-color, #8a1f1f)',
      outlineOffset: '2px'
    }
  }
}));

export type DesktopOfflineBannerStylesNames = Selectors<typeof useStyles>;

export interface DesktopOfflineBannerProps
  extends
    DefaultProps<DesktopOfflineBannerStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  /** Forces the offline state. When omitted, the live connectivity is used. */
  offline?: boolean;
  /** Inverse of `offline`; takes precedence when provided. */
  online?: boolean;
  /** Custom title. Defaults to the localized `desktop.offline` label. */
  title?: React.ReactNode;
  /** Custom description. Defaults to the localized `desktop.offlineDescription` label. */
  description?: React.ReactNode;
  /** Shows a retry action when provided. */
  onRetry?(): void;
  /** Custom retry label. Defaults to the localized `desktop.retryConnection` label. */
  retryLabel?: React.ReactNode;
  /** Banner placement inside the desktop. Defaults to `top`. */
  position?: DesktopOfflineBannerPosition;
  /** Overrides the localized labels. */
  labels?: Partial<DesktopOfflineBannerLabels>;
}

/**
 * Status banner shown while the desktop is offline. It renders as a polite
 * live region and hides itself (keeping the live region mounted) when online.
 */
export const DesktopOfflineBanner = forwardRef<HTMLDivElement, DesktopOfflineBannerProps>(
  (
    {
      offline,
      online,
      title,
      description,
      onRetry,
      retryLabel,
      position = 'top',
      labels,
      className,
      classNames,
      styles,
      unstyled,
      ...others
    },
    ref
  ) => {
    const { classes, cx } = useStyles(undefined, {
      name: 'desktop-offline-banner',
      classNames,
      styles,
      unstyled
    });
    const { t } = useNebularLocale();
    const detectedOnline = useOnlineStatus();
    const isOnline = online ?? (offline === undefined ? detectedOnline : !offline);
    const titleText =
      title !== undefined ? title : (labels?.title ?? t('desktop.offline', 'Offline'));
    const descriptionText =
      description !== undefined
        ? description
        : (labels?.description ??
          t('desktop.offlineDescription', 'Changes will sync when the connection returns.'));
    const retryText =
      retryLabel !== undefined
        ? retryLabel
        : (labels?.retry ?? t('desktop.retryConnection', 'Retry'));

    return (
      <div
        {...others}
        ref={ref}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        hidden={isOnline}
        data-desktop-offline-banner={position}
        data-desktop-offline-state={isOnline ? 'online' : 'offline'}
        className={cx(
          classes.root,
          position === 'bottom' ? classes.bottom : classes.top,
          className
        )}
      >
        <div className={classes.banner}>
          <span className={classes.indicator} aria-hidden="true" />
          <div className={classes.content}>
            <span className={classes.title}>{titleText}</span>
            {descriptionText !== null && descriptionText !== undefined && (
              <span className={classes.description}>{descriptionText}</span>
            )}
          </div>
          {onRetry && (
            <button type="button" className={classes.retry} onClick={onRetry}>
              {retryText}
            </button>
          )}
        </div>
      </div>
    );
  }
);
