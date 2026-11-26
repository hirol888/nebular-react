import { ComponentSize, ComponentStatus, createStyles } from '@nebular-react/styles';
import type { Property } from 'csstype';

export interface CardStylesParams {
  size: ComponentSize;
  accent: ComponentStatus;
}

export default createStyles((theme, { size, accent }: CardStylesParams) => ({
  root: {
    backgroundColor: 'var(--card-background-color)',
    border: 'var(--card-border-width) var(--card-border-style) var(--card-border-color)',
    borderRadius: 'var(--card-border-radius)',
    boxShadow: 'var(--card-shadow)',

    color: 'var(--card-text-color)',
    fontFamily: 'var(--card-text-font-family)',
    fontSize: 'var(--card-text-font-size)',
    fontWeight: 'var(--card-text-font-weight)' as unknown as Property.FontWeight,
    lineHeight: 'var(--card-text-line-height)',

    marginBottom: 'var(--card-margin-bottom)',

    ...theme.fns.scrollbars(
      'var(--card-scrollbar-color)',
      'var(--card-scrollbar-background-color)',
      'var(--card-scrollbar-width)'
    ),
    height: size ? `var(--card-height-${size})` : undefined,

    borderTopStyle: accent
      ? ('var(--card-border-style)' as unknown as Property.BorderTopStyle)
      : undefined,
    borderTopWidth: accent ? 'var(--card-border-radius)' : undefined,
    borderTopColor: accent ? `var(--card-header-${accent}-background-color)` : undefined,

    display: 'flex',
    flexDirection: 'column'
  }
}));
