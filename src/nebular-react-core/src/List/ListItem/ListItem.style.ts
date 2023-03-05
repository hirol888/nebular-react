import { createStyles } from '@nebular-react/styles';

export default createStyles(() => ({
  root: {
    borderBottom:
      'var(--list-item-divider-width) var(--list-item-divider-style) var(--list-item-divider-color)',

    color: 'var(--list-item-text-color)',
    fontFamily: 'var(--list-item-font-family)',
    fontSize: 'var(--list-item-font-size)',
    fontWeight: 'var(--list-item-font-weight)' as any,
    lineHeight: 'var(--list-item-line-height)',
    padding: 'var(--list-item-padding)',

    '&:first-of-type': {
      borderTop:
        'var(--list-item-divider-width) var(--list-item-divider-style) var(--list-item-divider-color)'
    },

    display: 'flex',
    alignItems: 'center',
    flexShrink: 0
  }
}));
