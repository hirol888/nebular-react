import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  onClick?(event: React.MouseEvent<HTMLAnchorElement>): void;
}

export interface BreadcrumbsProps
  extends DefaultProps<BreadcrumbsStylesNames>, React.ComponentPropsWithoutRef<'nav'> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  ariaLabel?: string;
}

const useStyles = createStyles((_theme) => ({
  root: {
    width: '100%'
  },

  list: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.35rem',
    margin: 0,
    padding: 0,
    listStyle: 'none',
    color: 'var(--breadcrumbs-text-color, var(--text-hint-color, #8f9bb3))',
    fontFamily: 'var(--breadcrumbs-text-font-family, inherit)',
    fontSize: 'var(--breadcrumbs-text-font-size, 0.8125rem)',
    lineHeight: 1.5
  },

  item: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    minWidth: 0
  },

  link: {
    color: 'var(--breadcrumbs-link-color, var(--color-primary-500, #3366ff))',
    textDecoration: 'none',
    borderRadius: '2px',

    '&:hover': {
      textDecoration: 'underline'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  current: {
    color: 'var(--breadcrumbs-current-color, var(--text-basic-color, #222b45))',
    fontWeight: 600
  },

  separator: {
    color: 'var(--breadcrumbs-separator-color, var(--text-hint-color, #8f9bb3))',
    userSelect: 'none'
  }
}));

export type BreadcrumbsStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<BreadcrumbsProps> = {
  separator: '/',
  ariaLabel: 'Breadcrumb'
};

const _Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>((props, ref) => {
  const { items, separator, ariaLabel, className, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'breadcrumbs',
    classNames,
    styles,
    unstyled
  });

  return (
    <nav {...others} ref={ref} aria-label={ariaLabel} className={cx(classes.root, className)}>
      <ol className={cx(classes.list)}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className={cx(classes.item)}>
              {item.href ? (
                <a
                  href={item.href}
                  onClick={item.onClick}
                  className={cx(classes.link, { [classes.current]: isLast })}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={cx({ [classes.current]: isLast })}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className={cx(classes.separator)} aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

_Breadcrumbs.displayName = 'Breadcrumbs';

export { _Breadcrumbs as Breadcrumbs };
