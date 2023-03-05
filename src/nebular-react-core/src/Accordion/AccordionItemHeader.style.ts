import { createStyles } from '@nebular-react/styles';

export interface AccordionItemHeaderStylesParams {
  collapsed: boolean;
}

export default createStyles((theme, { collapsed }: AccordionItemHeaderStylesParams) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',

    '&:focus': {
      outline: 0
    },

    position: 'relative',
    borderBottomWidth: 'var(--accordion-header-border-width)',
    borderBottomStyle: 'var(--accordion-header-border-style)' as any,
    borderBottomColor: 'var(--accordion-header-border-color)',
    color: 'var(--accordion-header-text-color)',
    fontFamily: 'var(--accordion-header-text-font-family)',
    fontSize: 'var(--accordion-header-text-font-size)',
    fontWeight: 'var(--accordion-header-text-font-weight)' as any,
    lineHeight: 'var(--accordion-header-text-line-height)',
    padding: 'var(--accordion-padding)',

    'h1, h2, h3, h4, h5, h6': {
      margin: 0
    }
  },

  expansionIndicator: {
    transitionProperty: 'transform',
    transitionDuration: '300ms',
    transitionTimingFunction: 'ease-out',
    position: 'absolute',
    ...theme.fns.ltr({ right: '1rem' }),
    ...theme.fns.rtl({ left: '1rem' }),

    transform: collapsed ? null : 'rotate(180deg)'
  }
}));
