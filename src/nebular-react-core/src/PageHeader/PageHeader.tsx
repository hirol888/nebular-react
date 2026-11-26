import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface PageHeaderProps
  extends
    DefaultProps<PageHeaderStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'header'>, 'title' | 'children'> {
  /** Main page title, rendered as an h1. */
  title: React.ReactNode;
  /** Supporting text rendered below the title. */
  description?: React.ReactNode;
  /** Breadcrumb navigation rendered above the title. */
  breadcrumbs?: React.ReactNode;
  /** Actions rendered on the right side of the title. */
  actions?: React.ReactNode;
  /** Content rendered in the bottom row. */
  footer?: React.ReactNode;
  /** Tabs rendered in the bottom row. */
  tabs?: React.ReactNode;
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--page-header-gap, 0.75rem)',
    width: '100%',
    fontFamily: 'var(--page-header-text-font-family, inherit)'
  },

  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0
  },

  main: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 'var(--page-header-main-gap, 1rem)'
  },

  heading: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: '1 1 16rem',
    minWidth: 0
  },

  title: {
    margin: 0,
    color: 'var(--page-header-title-color, var(--text-basic-color, #222b45))',
    fontFamily: 'var(--page-header-title-font-family, inherit)',
    fontSize: 'var(--page-header-title-font-size, 1.5rem)',
    fontWeight: 700,
    lineHeight: 1.25,
    overflowWrap: 'break-word'
  },

  description: {
    color: 'var(--page-header-description-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--page-header-description-font-size, 0.875rem)',
    lineHeight: 1.5
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
    flex: '0 1 auto'
  },

  bottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },

  tabs: {
    flex: '1 1 auto',
    minWidth: 0
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem'
  }
}));

export type PageHeaderStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<PageHeaderProps> = {};

const _PageHeader = forwardRef<HTMLElement, PageHeaderProps>((props, ref) => {
  const {
    title,
    description,
    breadcrumbs,
    actions,
    footer,
    tabs,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'page-header', classNames, styles, unstyled });

  return (
    <header {...others} ref={ref} className={cx(classes.root, className)}>
      {breadcrumbs && <div className={cx(classes.breadcrumbs)}>{breadcrumbs}</div>}
      <div className={cx(classes.main)}>
        <div className={cx(classes.heading)}>
          <h1 className={cx(classes.title)}>{title}</h1>
          {description && <div className={cx(classes.description)}>{description}</div>}
        </div>
        {actions && <div className={cx(classes.actions)}>{actions}</div>}
      </div>
      {(tabs || footer) && (
        <div className={cx(classes.bottom)}>
          {tabs && <div className={cx(classes.tabs)}>{tabs}</div>}
          {footer && <div className={cx(classes.footer)}>{footer}</div>}
        </div>
      )}
    </header>
  );
});

_PageHeader.displayName = 'PageHeader';

export { _PageHeader as PageHeader };
