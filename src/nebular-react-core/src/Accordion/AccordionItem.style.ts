import { createStyles } from '@nebular-react/styles';

export default createStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--accordion-item-background-color)',
    color: 'var(--accordion-item-text-color)',
    fontFamily: 'var(--accordion-item-text-font-family)',
    fontSize: 'var(--accordion-item-text-font-size)',
    fontWeight: 'var(--accordion-item-text-font-weight)' as any,
    lineHeight: 'var(--accordion-item-text-line-height)',

    '&.disabled .nebular-accordion-item-header-root': {
      color: 'var(--accordion-header-disabled-text-color)',
      cursor: 'default'
    },

    '&:first-of-type': {
      borderTopLeftRadius: 'var(--accordion-border-radius)',
      borderTopRightRadius: 'var(--accordion-border-radius)'
    },

    '&:last-of-type': {
      borderBottomLeftRadius: 'var(--accordion-border-radius)',
      borderBottomRightRadius: 'var(--accordion-border-radius)',

      '&.collapsed .nebular-accordion-item-header-root': {
        borderBottom: 'none'
      }
    },

    '&:not(.collapsed) + & .nebular-accordion-item-header-root': {
      borderTopColor: 'var(--accordion-header-border-color)',
      borderTopStyle: 'var(--accordion-header-border-style)' as any,
      borderTopWidth: 'var(--accordion-header-border-width)'
    }
  }
}));
