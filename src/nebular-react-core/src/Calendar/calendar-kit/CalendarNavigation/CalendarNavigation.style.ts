import { createStyles } from '@nebular-react/styles';

export default createStyles((theme) => ({
  root: {
    '.nebular-button-root.ghost.basic': {
      '&, &:hover, &:focus, &:active': {
        color: 'var(--calendar-navigation-text-color)',
        fontFamily: 'var(--calendar-navigation-text-font-family)',
        fontSize: 'var(--calendar-navigation-title-text-font-size)',
        fontWeight: 'var(--calendar-navigation-title-text-font-weight)' as any,
        lineHeight: 'var(--calendar-navigation-title-text-line-height)'
      },

      '&:focus': {
        '&, &:not(:hover):not(:active)': {
          boxShadow: 'none'
        }
      }
    }
  },

  pageableNavigation: {
    ...theme.fns.ltr({ marginLeft: 'auto' }),
    ...theme.fns.rtl({ marginRight: 'auto' })
  }
}));
