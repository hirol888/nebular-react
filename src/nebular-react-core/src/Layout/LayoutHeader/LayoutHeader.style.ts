import { createStyles } from '@nebular-react/styles';

export default createStyles(() => ({
  root: {
    display: 'block',

    backgroundColor: 'var(--header-background-color)',
    color: 'var(--header-text-color)',
    fontFamily: 'var(--header-text-font-family)',
    fontSize: 'var(--header-text-font-size)',
    fontWeight: 'var(--header-text-font-weight)' as any,
    lineHeight: 'var(--header-text-line-height)',

    maxWidth: 'var(--layout-window-mode-max-width)',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',

    '& ~ .nebular-layout-layoutContainer': {
      minHeight: 'calc(var(--layout-min-height) - var(--header-height))'
    }
  },

  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',

    color: 'var(--header-text-color)',
    boxShadow: 'var(--header-shadow)',
    height: 'var(--header-height)',
    padding: 'var(--header-padding)',

    maxWidth: 'var(--layout-window-mode-max-width)',
    margin: '0 auto',

    a: {
      color: 'var(--header-text-color)',

      '&:focus, &:active, &:hover': {
        color: 'var(--header-text-color)'
      }
    }
  },

  fixed: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1040,

    '& ~ .nebular-layout-layoutContainer': {
      paddingTop: 'var(--header-height)',
      minHeight: 'var(--layout-min-height)'
    },

    '& ~ .nebular-layout-layoutContainer .nebular-sidebar-root .nebular-sidebar-container': {
      height: 'calc(var(--sidebar-height) - var(--header-height))'
    }
  }
}));
