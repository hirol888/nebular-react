import React, { forwardRef, useEffect, useId, useRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { useMergedRef, useOverlayClickOutside, useUncontrolled } from '@nebular-react/hooks';
import { Icon } from '../Icon';

export type NotificationStatus = 'info' | 'success' | 'warning' | 'danger';
export type NotificationCenterPlacement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

export interface NotificationItem {
  id: string;
  title?: React.ReactNode;
  message?: React.ReactNode;
  status?: NotificationStatus;
  timestamp?: Date | string | number;
  read?: boolean;
}

interface NotificationCenterStylesParams {
  placement: NotificationCenterPlacement;
}

const useStyles = createStyles((_theme, { placement }: NotificationCenterStylesParams) => {
  const vertical = placement.startsWith('top') ? 'top' : 'bottom';
  const horizontal = placement.endsWith('start') ? 'start' : 'end';

  return {
    root: {
      position: 'relative',
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: horizontal === 'start' ? 'flex-start' : 'flex-end'
    },

    trigger: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'var(--notification-center-trigger-size, 2.5rem)',
      height: 'var(--notification-center-trigger-size, 2.5rem)',
      padding: 0,
      border:
        '1px solid var(--notification-center-trigger-border-color, ' +
        'var(--border-basic-color-3, #e4e9f2))',
      borderRadius: 'var(--notification-center-trigger-border-radius, 0.5rem)',
      backgroundColor:
        'var(--notification-center-trigger-background-color, ' +
        'var(--background-basic-color-1, #ffffff))',
      color: 'var(--notification-center-trigger-color, var(--text-basic-color, #222b45))',
      cursor: 'pointer',

      '&:focus-visible': {
        outline: '2px solid var(--color-primary-500, #3366ff)',
        outlineOffset: '2px'
      }
    },

    badge: {
      position: 'absolute',
      top: 'var(--notification-center-badge-offset, -0.25rem)',
      insetInlineEnd: 'var(--notification-center-badge-offset, -0.25rem)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 'var(--notification-center-badge-size, 1.125rem)',
      height: 'var(--notification-center-badge-size, 1.125rem)',
      padding: '0 0.25rem',
      boxSizing: 'border-box',
      borderRadius: 'var(--notification-center-badge-border-radius, 999px)',
      backgroundColor: 'var(--notification-center-badge-color, var(--color-danger-500, #ff3d71))',
      color: 'var(--notification-center-badge-text-color, #ffffff)',
      fontSize: '0.6875rem',
      fontWeight: 600,
      lineHeight: 1,
      pointerEvents: 'none'
    },

    panel: {
      position: 'absolute',
      zIndex: 'var(--notification-center-z-index, 1000)',
      display: 'flex',
      flexDirection: 'column',
      width: 'var(--notification-center-width, 22rem)',
      maxWidth: 'calc(100vw - 1rem)',
      border:
        '1px solid var(--notification-center-border-color, ' +
        'var(--border-basic-color-3, #e4e9f2))',
      borderRadius: 'var(--notification-center-border-radius, 0.5rem)',
      backgroundColor:
        'var(--notification-center-background-color, ' +
        'var(--background-basic-color-1, #ffffff))',
      color: 'var(--notification-center-text-color, var(--text-basic-color, #222b45))',
      boxShadow: 'var(--notification-center-shadow, 0 12px 32px rgba(0, 0, 0, 0.18))',
      ...(vertical === 'top'
        ? { bottom: 'calc(100% + var(--notification-center-offset, 0.5rem))' }
        : { top: 'calc(100% + var(--notification-center-offset, 0.5rem))' }),
      ...(horizontal === 'start' ? { insetInlineStart: 0 } : { insetInlineEnd: 0 })
    },

    header: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: 'var(--notification-center-header-padding, 0.75rem)'
    },

    title: {
      margin: 0,
      fontSize: '0.9375rem',
      fontWeight: 600,
      lineHeight: 1.4
    },

    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap'
    },

    action: {
      padding: 0,
      border: 0,
      backgroundColor: 'transparent',
      color: 'var(--notification-center-action-color, var(--color-primary-500, #3366ff))',
      fontFamily: 'inherit',
      fontSize: '0.75rem',
      lineHeight: 1.4,
      cursor: 'pointer',

      '&:disabled': {
        color: 'var(--notification-center-action-disabled-color, var(--text-hint-color, #8f9bb3))',
        cursor: 'default'
      },

      '&:focus-visible': {
        outline: '2px solid var(--color-primary-500, #3366ff)',
        outlineOffset: '2px'
      }
    },

    list: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      overflowY: 'auto'
    },

    listItem: {
      borderTop:
        '1px solid var(--notification-center-divider-color, ' +
        'var(--border-basic-color-3, #e4e9f2))'
    },

    item: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.625rem',
      width: '100%',
      padding: 'var(--notification-center-item-padding, 0.75rem)',
      border: 0,
      backgroundColor: 'transparent',
      color: 'inherit',
      fontFamily: 'inherit',
      textAlign: 'start',
      cursor: 'pointer',

      '&:hover': {
        backgroundColor:
          'var(--notification-center-item-hover-color, var(--background-basic-color-2, #f7f9fc))'
      },

      '&:focus-visible': {
        outline: '2px solid var(--color-primary-500, #3366ff)',
        outlineOffset: '-2px'
      }
    },

    unread: {
      backgroundColor:
        'var(--notification-center-unread-background-color, rgba(51, 102, 255, 0.06))'
    },

    itemContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.125rem',
      flex: 1,
      minWidth: 0
    },

    itemTitle: {
      fontSize: '0.8125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      overflowWrap: 'anywhere'
    },

    itemMessage: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
      color: 'var(--notification-center-message-color, var(--text-hint-color, #8f9bb3))',
      overflowWrap: 'anywhere'
    },

    timestamp: {
      fontSize: '0.6875rem',
      lineHeight: 1.4,
      color: 'var(--notification-center-timestamp-color, var(--text-hint-color, #8f9bb3))'
    },

    status: {
      flexShrink: 0,
      width: 'var(--notification-center-status-size, 0.5rem)',
      height: 'var(--notification-center-status-size, 0.5rem)',
      marginTop: '0.375rem',
      borderRadius: '999px'
    },

    statusInfo: {
      backgroundColor: 'var(--notification-center-info-color, var(--color-info-500, #0095ff))'
    },

    statusSuccess: {
      backgroundColor: 'var(--notification-center-success-color, var(--color-success-500, #00d68f))'
    },

    statusWarning: {
      backgroundColor: 'var(--notification-center-warning-color, var(--color-warning-500, #ffaa00))'
    },

    statusDanger: {
      backgroundColor: 'var(--notification-center-danger-color, var(--color-danger-500, #ff3d71))'
    },

    unreadDot: {
      flexShrink: 0,
      width: 'var(--notification-center-unread-dot-size, 0.5rem)',
      height: 'var(--notification-center-unread-dot-size, 0.5rem)',
      marginTop: '0.375rem',
      borderRadius: '999px',
      backgroundColor:
        'var(--notification-center-unread-dot-color, var(--color-primary-500, #3366ff))'
    },

    empty: {
      padding: 'var(--notification-center-empty-padding, 1.5rem 0.75rem)',
      borderTop:
        '1px solid var(--notification-center-divider-color, ' +
        'var(--border-basic-color-3, #e4e9f2))',
      fontSize: '0.8125rem',
      lineHeight: 1.5,
      textAlign: 'center',
      color: 'var(--notification-center-empty-color, var(--text-hint-color, #8f9bb3))'
    }
  };
});

export type NotificationCenterStylesNames = Selectors<typeof useStyles>;

export interface NotificationCenterLabels {
  title: React.ReactNode;
  markAllRead: string;
  clear: string;
  empty: React.ReactNode;
}

export interface NotificationCenterProps extends DefaultProps<NotificationCenterStylesNames> {
  notifications: NotificationItem[];
  opened?: boolean;
  defaultOpened?: boolean;
  onOpenChange?(opened: boolean): void;
  onMarkAllRead?(): void;
  onClear?(): void;
  onNotificationClick?(id: string): void;
  title?: React.ReactNode;
  emptyState?: React.ReactNode;
  placement?: NotificationCenterPlacement;
  maxHeight?: number | string;
  ariaLabel?: string;
  labels?: Partial<NotificationCenterLabels>;
}

interface FormattedTimestamp {
  label: string;
  dateTime: string;
}

const MAX_UNREAD_LABEL = 99;

const defaultProps: Partial<NotificationCenterProps> = {
  placement: 'bottom-end',
  maxHeight: 320
};

function formatTimestamp(value: Date | string | number): FormattedTimestamp | null {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return { label: date.toLocaleString(), dateTime: date.toISOString() };
}

const _NotificationCenter = forwardRef<HTMLDivElement, NotificationCenterProps>((props, ref) => {
  const {
    notifications,
    opened,
    defaultOpened,
    onOpenChange,
    onMarkAllRead,
    onClear,
    onNotificationClick,
    title,
    emptyState,
    placement,
    maxHeight,
    ariaLabel,
    labels,
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
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRootRef = useMergedRef(ref, rootRef);
  const panelId = useId();

  const { classes, cx } = useStyles(
    { placement },
    { name: 'notification-center', classNames, styles, unstyled }
  );
  const { t } = useNebularLocale();
  const resolvedTitle = title ?? labels?.title ?? t('notificationCenter.title', 'Notifications');
  const resolvedEmptyState =
    emptyState ?? labels?.empty ?? t('notificationCenter.empty', 'No notifications');
  const markAllReadLabel =
    labels?.markAllRead ?? t('notificationCenter.markAllRead', 'Mark all as read');
  const clearLabel = labels?.clear ?? t('notificationCenter.clear', 'Clear');

  const unreadCount = notifications.filter((item) => !item.read).length;
  const resolvedMaxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
  const fallbackLabel = t('notificationCenter.title', 'Notifications');
  const resolvedLabel =
    ariaLabel ||
    (typeof resolvedTitle === 'string' && resolvedTitle ? resolvedTitle : fallbackLabel);
  const unreadCountLabel = t('notificationCenter.unreadCount', '{count} unread', {
    count: unreadCount
  });
  const triggerLabel = unreadCount > 0 ? `${resolvedLabel}, ${unreadCountLabel}` : resolvedLabel;

  const statusClasses: Record<NotificationStatus, string> = {
    info: classes.statusInfo,
    success: classes.statusSuccess,
    warning: classes.statusWarning,
    danger: classes.statusDanger
  };

  const close = () => {
    if (isOpen) {
      setOpened(false);
    }
  };

  useOverlayClickOutside([rootRef], close);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpened(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpened]);

  const handleTriggerClick = () => {
    setOpened(!isOpen);
  };

  const handleNotificationClick = (id: string) => {
    onNotificationClick?.(id);
    close();
  };

  return (
    <div ref={mergedRootRef} className={cx(classes.root, className)} style={style}>
      <button
        type="button"
        className={cx(classes.trigger)}
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={handleTriggerClick}
      >
        <Icon icon="bell-outline" pack="eva" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className={cx(classes.badge)} aria-hidden="true">
            {unreadCount > MAX_UNREAD_LABEL ? `${MAX_UNREAD_LABEL}+` : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div id={panelId} className={cx(classes.panel)} role="dialog" aria-label={resolvedLabel}>
          <div className={cx(classes.header)}>
            <h2 className={cx(classes.title)}>{resolvedTitle}</h2>
            {notifications.length > 0 && (
              <div className={cx(classes.actions)}>
                <button
                  type="button"
                  className={cx(classes.action)}
                  onClick={() => onMarkAllRead?.()}
                  disabled={unreadCount === 0}
                >
                  {markAllReadLabel}
                </button>
                <button type="button" className={cx(classes.action)} onClick={() => onClear?.()}>
                  {clearLabel}
                </button>
              </div>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className={cx(classes.empty)}>{resolvedEmptyState}</div>
          ) : (
            <ul className={cx(classes.list)} style={{ maxHeight: resolvedMaxHeight }}>
              {notifications.map((item) => {
                const status = item.status ?? 'info';
                const timestamp =
                  item.timestamp !== undefined ? formatTimestamp(item.timestamp) : null;

                return (
                  <li key={item.id} className={cx(classes.listItem)}>
                    <button
                      type="button"
                      className={cx(classes.item, { [classes.unread]: !item.read })}
                      data-unread={!item.read ? 'true' : undefined}
                      onClick={() => handleNotificationClick(item.id)}
                    >
                      <span
                        className={cx(classes.status, statusClasses[status])}
                        aria-hidden="true"
                      />
                      <span className={cx(classes.itemContent)}>
                        {item.title && <span className={cx(classes.itemTitle)}>{item.title}</span>}
                        {item.message && (
                          <span className={cx(classes.itemMessage)}>{item.message}</span>
                        )}
                        {timestamp && (
                          <time className={cx(classes.timestamp)} dateTime={timestamp.dateTime}>
                            {timestamp.label}
                          </time>
                        )}
                      </span>
                      {!item.read && <span className={cx(classes.unreadDot)} aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
});

_NotificationCenter.displayName = 'NotificationCenter';

export { _NotificationCenter as NotificationCenter };
