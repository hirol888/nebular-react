import { ComponentOrCustomStatus, createStyles } from '@nebular-react/styles';
import type { Property } from 'csstype';

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
    fontWeight: 'var(--card-header-text-font-weight)' as unknown as Property.FontWeight,
    lineHeight: 'var(--card-header-text-line-height)',

    '&h1, &h2, &h3, &h4, &h5, &h6': {
      margin: 0
    },

    backgroundColor: status ? `var(--card-header-${status}-background-color)` : undefined,
    borderBottomWidth: status ? 0 : undefined,
    borderBottomColor: status ? `var(--card-header-${status}-background-color)` : undefined,
    color: status ? `var(--card-header-${status}-text-color)` : undefined,

    'a, a:hover': {
      color: status ? `var(--card-header-${status}-text-color)` : undefined
    },

    borderRadius: hasAccent ? 0 : undefined
  }
}));
