import { createStyles } from '@nebular-react/styles';

export default createStyles(() => ({
  root: {
    display: 'block',
    marginTop: 'auto',
    boxShadow: 'var(--footer-shadow)'
  },

  fixed: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 'var(--footer-fixed-z-index, 10)'
  },

  nav: {
    display: 'flex',
    justifyContent: 'center',

    backgroundColor: 'var(--footer-background-color)',
    borderTop:
      'var(--footer-divider-width) var(--footer-divider-style) var(--footer-divider-color)',
    color: 'var(--footer-text-color)',
    fontFamily: 'var(--footer-text-font-family)',
    fontSize: 'var(--footer-text-font-size)',
    fontWeight: 'var(--footer-text-font-weight)' as any,
    lineHeight: 'var(--footer-text-line-height)',
    padding: 'var(--footer-padding)',

    a: {
      color: 'var(--footer-text-highlight-color)',

      '&:focus, &:active, &:hover': {
        color: 'var(--footer-text-highlight-color)'
      }
    }
  }
}));
