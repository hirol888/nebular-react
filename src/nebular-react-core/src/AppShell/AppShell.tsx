import React, { forwardRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type AppShellPadding = 'none' | 'sm' | 'md' | 'lg';

interface AppShellStylesParams {
  headerHeight: number | string;
  navbarWidth: number | string;
  asideWidth: number | string;
  padding: AppShellPadding;
}

const paddingValues: Record<AppShellPadding, string> = {
  none: '0',
  sm: '0.75rem',
  md: '1.25rem',
  lg: '2rem'
};

function toCssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

const useStyles = createStyles(
  (_theme, { headerHeight, navbarWidth, asideWidth, padding }: AppShellStylesParams) => ({
    root: {
      '--app-shell-header-height': toCssSize(headerHeight),
      '--app-shell-navbar-width': toCssSize(navbarWidth),
      '--app-shell-aside-width': toCssSize(asideWidth),
      '--app-shell-padding': paddingValues[padding],
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      minHeight: 'var(--app-shell-min-height, 100vh)',
      backgroundColor:
        'var(--app-shell-background-color, var(--background-basic-color-2, #f7f9fc))',
      color: 'var(--app-shell-text-color, var(--text-basic-color, #222b45))',
      fontFamily: 'inherit'
    },

    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flex: '0 0 auto',
      minHeight: 'var(--app-shell-header-height, 56px)',
      padding: '0 var(--app-shell-padding, 1.25rem)',
      backgroundColor:
        'var(--app-shell-header-background-color, var(--background-basic-color-1, #ffffff))',
      borderBottom:
        '1px solid var(--app-shell-header-border-color, var(--border-basic-color-3, #e4e9f2))',
      zIndex: 10
    },

    headerSticky: {
      position: 'sticky',
      top: 0,
      zIndex: 200
    },

    headerContent: {
      flex: '1 1 auto',
      minWidth: 0
    },

    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flex: '0 0 auto',
      gap: '0.25rem',
      padding: '0.25rem var(--app-shell-padding, 1.25rem)'
    },

    controls: {
      display: 'flex',
      alignItems: 'center',
      flex: '0 0 auto',
      gap: '0.25rem',
      marginInlineStart: 'auto'
    },

    toggle: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'var(--app-shell-toggle-size, 2rem)',
      height: 'var(--app-shell-toggle-size, 2rem)',
      padding: 0,
      border:
        '1px solid var(--app-shell-toggle-border-color, var(--border-basic-color-3, #e4e9f2))',
      borderRadius: 'var(--app-shell-toggle-border-radius, 0.375rem)',
      backgroundColor: 'var(--app-shell-toggle-background-color, transparent)',
      color: 'var(--app-shell-toggle-color, var(--text-basic-color, #222b45))',
      fontSize: '0.875rem',
      lineHeight: 1,
      cursor: 'pointer',

      '&:hover': {
        backgroundColor:
          'var(--app-shell-toggle-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
      },

      '&:focus-visible': {
        outline: '2px solid var(--app-shell-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '2px'
      }
    },

    body: {
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'stretch',
      minHeight: 0
    },

    navbar: {
      flex: '0 0 auto',
      width: 'var(--app-shell-navbar-width, 260px)',
      minHeight: 0,
      overflow: 'hidden',
      backgroundColor:
        'var(--app-shell-navbar-background-color, var(--background-basic-color-1, #ffffff))',
      borderInlineEnd:
        '1px solid var(--app-shell-navbar-border-color, var(--border-basic-color-3, #e4e9f2))',
      transition: 'width 0.2s ease, transform 0.2s ease',

      '@media (max-width: 767px)': {
        position: 'fixed',
        top: 0,
        bottom: 0,
        insetInlineStart: 0,
        zIndex: 400,
        width: 'var(--app-shell-navbar-width, 260px)',
        boxShadow: 'var(--app-shell-navbar-shadow, 0 8px 32px rgba(0, 0, 0, 0.2))'
      }
    },

    navbarInner: {
      width: 'var(--app-shell-navbar-width, 260px)',
      height: '100%',
      overflow: 'auto'
    },

    navbarCollapsed: {
      width: 0,
      borderInlineEndWidth: 0,

      '@media (max-width: 767px)': {
        transform: 'translateX(-100%)',
        boxShadow: 'none'
      }
    },

    main: {
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 auto',
      minWidth: 0,
      minHeight: 0
    },

    content: {
      flex: '1 1 auto',
      minWidth: 0,
      padding: 'var(--app-shell-padding, 1.25rem)'
    },

    footer: {
      flex: '0 0 auto',
      padding: '0.75rem var(--app-shell-padding, 1.25rem)',
      backgroundColor:
        'var(--app-shell-footer-background-color, var(--background-basic-color-1, #ffffff))',
      borderTop:
        '1px solid var(--app-shell-footer-border-color, var(--border-basic-color-3, #e4e9f2))'
    },

    aside: {
      flex: '0 0 auto',
      width: 'var(--app-shell-aside-width, 300px)',
      minHeight: 0,
      overflow: 'hidden',
      backgroundColor:
        'var(--app-shell-aside-background-color, var(--background-basic-color-1, #ffffff))',
      borderInlineStart:
        '1px solid var(--app-shell-aside-border-color, var(--border-basic-color-3, #e4e9f2))',
      transition: 'width 0.2s ease, transform 0.2s ease',

      '@media (max-width: 1023px)': {
        position: 'fixed',
        top: 'var(--app-shell-header-height, 56px)',
        bottom: 0,
        insetInlineEnd: 0,
        zIndex: 300,
        boxShadow: 'var(--app-shell-aside-shadow, 0 8px 32px rgba(0, 0, 0, 0.2))'
      }
    },

    asideInner: {
      width: 'var(--app-shell-aside-width, 300px)',
      height: '100%',
      overflow: 'auto'
    },

    asideCollapsed: {
      width: 0,
      borderInlineStartWidth: 0,

      '@media (max-width: 1023px)': {
        transform: 'translateX(100%)'
      }
    }
  })
);

export type AppShellStylesNames = Selectors<typeof useStyles>;

export interface AppShellProps
  extends DefaultProps<AppShellStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
  header?: React.ReactNode;
  navbar?: React.ReactNode;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  navbarWidth?: number | string;
  asideWidth?: number | string;
  headerHeight?: number | string;
  navbarCollapsed?: boolean;
  defaultNavbarCollapsed?: boolean;
  onNavbarCollapseChange?(collapsed: boolean): void;
  asideCollapsed?: boolean;
  defaultAsideCollapsed?: boolean;
  onAsideCollapseChange?(collapsed: boolean): void;
  withNavbarToggle?: boolean;
  stickyHeader?: boolean;
  padding?: AppShellPadding;
  ariaLabel?: string;
}

const defaultProps: Partial<AppShellProps> = {
  navbarWidth: 260,
  asideWidth: 300,
  headerHeight: 56,
  withNavbarToggle: true,
  stickyHeader: false,
  padding: 'md'
};

const _AppShell = forwardRef<HTMLDivElement, AppShellProps>((props, ref) => {
  const {
    children,
    header,
    navbar,
    aside,
    footer,
    navbarWidth,
    asideWidth,
    headerHeight,
    navbarCollapsed: navbarCollapsedValue,
    defaultNavbarCollapsed,
    onNavbarCollapseChange,
    asideCollapsed: asideCollapsedValue,
    defaultAsideCollapsed,
    onAsideCollapseChange,
    withNavbarToggle,
    stickyHeader,
    padding,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { headerHeight, navbarWidth, asideWidth, padding },
    { name: 'app-shell', classNames, styles, unstyled }
  );

  const [navbarCollapsed, setNavbarCollapsed] = useUncontrolled<boolean>({
    value: navbarCollapsedValue,
    defaultValue: defaultNavbarCollapsed,
    finalValue: false,
    onChange: onNavbarCollapseChange
  });
  const [asideCollapsed, setAsideCollapsed] = useUncontrolled<boolean>({
    value: asideCollapsedValue,
    defaultValue: defaultAsideCollapsed,
    finalValue: false,
    onChange: onAsideCollapseChange
  });

  const hasNavbarToggle = !!navbar && withNavbarToggle;
  const hasAsideToggle = !!aside;
  const navbarLabel = ariaLabel ? `${ariaLabel} navigation` : 'Main navigation';
  const asideLabel = ariaLabel ? `${ariaLabel} aside` : 'Aside';

  const toggleButtons = (
    <>
      {hasNavbarToggle && (
        <button
          type="button"
          className={cx(classes.toggle)}
          aria-label="Toggle navigation"
          aria-expanded={!navbarCollapsed}
          onClick={() => setNavbarCollapsed(!navbarCollapsed)}
        >
          <span aria-hidden="true">{navbarCollapsed ? '☰' : '⇤'}</span>
        </button>
      )}
      {hasAsideToggle && (
        <button
          type="button"
          className={cx(classes.toggle)}
          aria-label="Toggle aside"
          aria-expanded={!asideCollapsed}
          onClick={() => setAsideCollapsed(!asideCollapsed)}
        >
          <span aria-hidden="true">{asideCollapsed ? '⇤' : '⇥'}</span>
        </button>
      )}
    </>
  );

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)} aria-label={ariaLabel}>
      {header && (
        <header className={cx(classes.header, { [classes.headerSticky]: stickyHeader })}>
          <div className={cx(classes.headerContent)}>{header}</div>
          {(hasNavbarToggle || hasAsideToggle) && (
            <div className={cx(classes.controls)}>{toggleButtons}</div>
          )}
        </header>
      )}

      {!header && (hasNavbarToggle || hasAsideToggle) && (
        <div className={cx(classes.toolbar)}>{toggleButtons}</div>
      )}

      <div className={cx(classes.body)}>
        {navbar && (
          <nav
            className={cx(classes.navbar, { [classes.navbarCollapsed]: navbarCollapsed })}
            aria-label={navbarLabel}
            data-collapsed={navbarCollapsed ? 'true' : 'false'}
          >
            <div className={cx(classes.navbarInner)}>{navbar}</div>
          </nav>
        )}

        <main className={cx(classes.main)}>
          <div className={cx(classes.content)}>{children}</div>
          {footer && <footer className={cx(classes.footer)}>{footer}</footer>}
        </main>

        {aside && (
          <aside
            className={cx(classes.aside, { [classes.asideCollapsed]: asideCollapsed })}
            aria-label={asideLabel}
            data-collapsed={asideCollapsed ? 'true' : 'false'}
          >
            <div className={cx(classes.asideInner)}>{aside}</div>
          </aside>
        )}
      </div>
    </div>
  );
});

_AppShell.displayName = 'AppShell';

export { _AppShell as AppShell };
