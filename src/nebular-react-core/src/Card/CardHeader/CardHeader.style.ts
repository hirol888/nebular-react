import { ComponentOrCustomStatus, createStyles } from '@nebular-react/styles';

export interface CardHeaderStylesParams {
  status: ComponentOrCustomStatus;
  hasAccent: boolean;
}

export default createStyles((theme, { status, hasAccent }: CardHeaderStylesParams) => ({
  root: {
    padding: 'var(--card-padding)',
    borderBottom: 'var(--card-divider-width) var(--card-divider-style) var(--card-border-color)',
    borderTopLeftRadius: 'var(--card-border-radius)',
    borderTopRightRadius: 'var(--card-border-radius)',

    fontFamily: 'var(--card-header-text-font-family)',
    fontSize: 'var(--card-header-text-font-size)',
    fontWeight: 'var(--card-header-text-font-weight)' as any,
    lineHeight: 'var(--card-header-text-line-height)',

    '&h1, &h2, &h3, &h4, &h5, &h6': {
      margin: 0
    },

    backgroundColor: status ? `var(--card-header-${status}-background-color)` : null,
    borderBottomWidth: status ? 0 : null,
    borderBottomColor: status ? `var(--card-header-${status}-background-color)` : null,
    color: status ? `var(--card-header-${status}-text-color)` : null,

    'a, a:hover': {
      color: status ? `var(--card-header-${status}-text-color)` : null
    },

    borderRadius: hasAccent ? 0 : null
  }
}));
