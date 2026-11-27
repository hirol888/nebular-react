import React, { useId, useMemo, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { Icon } from '../Icon';

export interface DesktopWidget {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
  defaultCollapsed?: boolean;
}

export interface DesktopWidgetsLabels {
  title: string;
  count(count: number): string;
  toggle: string;
  close: string;
  empty: string;
}

type DesktopWidgetsBaseProps = DefaultProps<DesktopWidgetsStylesNames>;

export interface DesktopWidgetsProps extends DesktopWidgetsBaseProps {
  widgets: DesktopWidget[];
  title?: string;
  collapsed?: boolean;
  onCollapsedChange?(collapsed: boolean): void;
  onClose?(): void;
  labels?: Partial<DesktopWidgetsLabels>;
  ariaLabel?: string;
}

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'absolute',
    top: 'var(--desktop-widgets-top, auto)',
    right: 'var(--desktop-widgets-right, 0.75rem)',
    bottom: 'var(--desktop-widgets-bottom, 3.5rem)',
    left: 'var(--desktop-widgets-left, auto)',
    zIndex: 'var(--desktop-widgets-z-index, 1100000000)' as unknown as number,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    width: 'var(--desktop-widgets-width, 18rem)',
    maxWidth: 'calc(100vw - 1.5rem)',
    maxHeight: 'var(--desktop-widgets-max-height, min(26rem, 70vh))',
    overflow: 'hidden',
    border: '1px solid var(--desktop-widgets-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-widgets-radius, 0.5rem)',
    backgroundColor:
      'var(--desktop-widgets-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--desktop-widgets-color, var(--text-basic-color, #222b45))',
    boxShadow: 'var(--desktop-widgets-shadow, 0 12px 32px rgba(0, 0, 0, 0.18))',
    fontFamily: 'var(--desktop-widgets-font-family, inherit)'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: '0 0 auto',
    padding: 'var(--desktop-widgets-header-padding, 0.6rem 0.7rem)',
    borderBottom:
      '1px solid var(--desktop-widgets-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--desktop-widgets-header-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  heading: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.4rem',
    minWidth: 0
  },

  title: {
    margin: 0,
    overflow: 'hidden',
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.3,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  count: {
    flex: '0 0 auto',
    color: 'var(--desktop-widgets-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.72rem',
    fontWeight: 500
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.15rem',
    marginInlineStart: 'auto'
  },

  action: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--desktop-widgets-action-size, 1.75rem)',
    height: 'var(--desktop-widgets-action-size, 1.75rem)',
    padding: 0,
    border: 0,
    borderRadius: 'var(--desktop-widgets-action-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--desktop-widgets-action-hover-background-color, var(--background-basic-color-3, #edf1f7))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  body: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--desktop-widgets-body-padding, 0.55rem)',

    '&[hidden]': {
      display: 'none'
    }
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--desktop-widgets-gap, 0.5rem)',
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },

  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    minWidth: 0,
    padding: 'var(--desktop-widgets-card-padding, 0.6rem)',
    border:
      '1px solid var(--desktop-widgets-card-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-widgets-card-radius, 0.4rem)',
    backgroundColor:
      'var(--desktop-widgets-card-background-color, var(--background-basic-color-1, #ffffff))'
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    minWidth: 0
  },

  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    color: 'var(--desktop-widgets-icon-color, var(--color-primary-500, #3366ff))'
  },

  cardTitle: {
    margin: 0,
    overflow: 'hidden',
    fontSize: '0.8rem',
    fontWeight: 600,
    lineHeight: 1.3,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  cardAction: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.5rem',
    height: '1.5rem',
    marginInlineStart: 'auto',
    padding: 0,
    border: 0,
    borderRadius: 'var(--desktop-widgets-action-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'var(--desktop-widgets-hint-color, var(--text-hint-color, #8f9bb3))',
    font: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--desktop-widgets-action-hover-background-color, var(--background-basic-color-3, #edf1f7))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  description: {
    margin: 0,
    color: 'var(--desktop-widgets-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.73rem',
    lineHeight: 1.35
  },

  content: {
    minWidth: 0,
    fontSize: '0.78rem',
    lineHeight: 1.4,

    '&[hidden]': {
      display: 'none'
    }
  },

  empty: {
    margin: 0,
    padding: '0.75rem',
    border:
      '1px dashed var(--desktop-widgets-card-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-widgets-card-radius, 0.4rem)',
    color: 'var(--desktop-widgets-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.78rem',
    textAlign: 'center'
  }
}));

export type DesktopWidgetsStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<DesktopWidgetsProps> = {};

export const DesktopWidgets = React.forwardRef<HTMLElement, DesktopWidgetsProps>((props, ref) => {
  const {
    widgets,
    title,
    collapsed: controlledCollapsed,
    onCollapsedChange,
    onClose,
    labels: labelsProp,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(undefined, {
    name: 'desktop-widgets',
    classNames,
    styles,
    unstyled
  });
  const { t } = useNebularLocale();
  const labels = useMemo<DesktopWidgetsLabels>(
    () => ({
      title: t('desktop.widgets', 'Widgets'),
      count: (count) => String(count),
      toggle: t('desktop.toggleWidgets', 'Toggle widgets'),
      close: t('common.close', 'Close'),
      empty: t('desktop.noWidgets', 'No widgets'),
      ...labelsProp
    }),
    [t, labelsProp]
  );
  const bodyId = useId();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [widgetExpanded, setWidgetExpanded] = useState<Record<string, boolean>>({});
  const isCollapsed = controlledCollapsed ?? internalCollapsed;
  const heading = title ?? labels.title;

  const togglePanel = () => {
    const next = !isCollapsed;

    if (controlledCollapsed === undefined) {
      setInternalCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  const toggleWidget = (widget: DesktopWidget) => {
    const expanded = widgetExpanded[widget.id] ?? !widget.defaultCollapsed;

    setWidgetExpanded((current) => ({ ...current, [widget.id]: !expanded }));
  };

  return (
    <section
      {...others}
      ref={ref}
      className={cx(classes.root, className)}
      aria-label={ariaLabel ?? heading}
      data-desktop-widgets=""
    >
      <div className={cx(classes.header)}>
        <div className={cx(classes.heading)}>
          <h2 className={cx(classes.title)}>{heading}</h2>
          <span className={cx(classes.count)}>{labels.count(widgets.length)}</span>
        </div>
        <div className={cx(classes.actions)}>
          <button
            type="button"
            className={cx(classes.action)}
            aria-expanded={!isCollapsed}
            aria-controls={bodyId}
            aria-label={labels.toggle}
            title={labels.toggle}
            onClick={togglePanel}
          >
            <Icon
              icon={isCollapsed ? 'chevron-down-outline' : 'chevron-up-outline'}
              pack="nebular-essentials"
              aria-hidden="true"
            />
          </button>
          {onClose && (
            <button
              type="button"
              className={cx(classes.action)}
              aria-label={labels.close}
              title={labels.close}
              onClick={onClose}
            >
              <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <div id={bodyId} className={cx(classes.body)} hidden={isCollapsed}>
        {widgets.length === 0 ? (
          <p className={cx(classes.empty)}>{labels.empty}</p>
        ) : (
          <ul className={cx(classes.list)}>
            {widgets.map((widget) => {
              const expanded = widgetExpanded[widget.id] ?? !widget.defaultCollapsed;
              const contentId = `${bodyId}-${widget.id}`;

              return (
                <li key={widget.id} className={cx(classes.card)}>
                  <div className={cx(classes.cardHeader)}>
                    {widget.icon && (
                      <span className={cx(classes.icon)} aria-hidden="true">
                        {widget.icon}
                      </span>
                    )}
                    <h3 className={cx(classes.cardTitle)}>{widget.title}</h3>
                    <button
                      type="button"
                      className={cx(classes.cardAction)}
                      aria-expanded={expanded}
                      aria-controls={contentId}
                      aria-label={`${labels.toggle}: ${widget.title}`}
                      onClick={() => toggleWidget(widget)}
                    >
                      <Icon
                        icon={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                        pack="nebular-essentials"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  {widget.description && (
                    <p className={cx(classes.description)}>{widget.description}</p>
                  )}
                  <div id={contentId} className={cx(classes.content)} hidden={!expanded}>
                    {widget.content}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
});

DesktopWidgets.displayName = 'DesktopWidgets';
