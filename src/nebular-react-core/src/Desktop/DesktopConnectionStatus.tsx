import React, { forwardRef } from 'react';
import { DefaultProps, Selectors, createStyles, useNebularLocale } from '@nebular-react/styles';
import { useOnlineStatus } from './Desktop.gestures';

export interface DesktopConnectionStatusLabels {
  /** Label announced while online. */
  online: string;
  /** Label announced while offline. */
  offline: string;
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--desktop-connection-status-gap, 0.375rem)',
    color: 'var(--desktop-connection-status-text-color, inherit)',
    fontSize: 'var(--desktop-connection-status-font-size, 0.75rem)',
    lineHeight: 1,
    whiteSpace: 'nowrap'
  },
  dot: {
    width: 'var(--desktop-connection-status-dot-size, 0.5rem)',
    height: 'var(--desktop-connection-status-dot-size, 0.5rem)',
    flexShrink: 0,
    borderRadius: '999px',
    transition: 'background-color 160ms ease, box-shadow 160ms ease'
  },
  dotOnline: {
    background: 'var(--desktop-connection-status-online-color, #37b24d)',
    boxShadow: '0 0 0 3px var(--desktop-connection-status-online-ring, rgba(55, 178, 77, 0.18))'
  },
  dotOffline: {
    background: 'var(--desktop-connection-status-offline-color, #e03131)',
    boxShadow: '0 0 0 3px var(--desktop-connection-status-offline-ring, rgba(224, 49, 49, 0.18))'
  }
}));

export type DesktopConnectionStatusStylesNames = Selectors<typeof useStyles>;

export interface DesktopConnectionStatusProps
  extends
    DefaultProps<DesktopConnectionStatusStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  /** Forces the online state. When omitted, the live connectivity is used. */
  online?: boolean;
  /** Shows the textual label next to the dot. Defaults to false. */
  showLabel?: boolean;
  /** Native tooltip. Defaults to the resolved status label. */
  title?: string;
  /** Overrides the localized labels. */
  labels?: Partial<DesktopConnectionStatusLabels>;
}

/**
 * Compact connectivity indicator intended for the desktop taskbar or system
 * tray. The dot carries the visual state while `role="status"` announces it.
 */
export const DesktopConnectionStatus = forwardRef<HTMLDivElement, DesktopConnectionStatusProps>(
  (
    {
      online,
      showLabel = false,
      title,
      labels,
      className,
      classNames,
      styles,
      unstyled,
      'aria-label': ariaLabel,
      ...others
    },
    ref
  ) => {
    const { classes, cx } = useStyles(undefined, {
      name: 'desktop-connection-status',
      classNames,
      styles,
      unstyled
    });
    const { t } = useNebularLocale();
    const detectedOnline = useOnlineStatus();
    const isOnline = online ?? detectedOnline;
    const label = isOnline
      ? (labels?.online ?? t('desktop.online', 'Online'))
      : (labels?.offline ?? t('desktop.offline', 'Offline'));

    return (
      <div
        {...others}
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={ariaLabel ?? label}
        title={title ?? label}
        data-desktop-connection-status={isOnline ? 'online' : 'offline'}
        className={cx(classes.root, className)}
      >
        <span
          className={cx(classes.dot, isOnline ? classes.dotOnline : classes.dotOffline)}
          aria-hidden="true"
        />
        {showLabel && <span>{label}</span>}
      </div>
    );
  }
);
