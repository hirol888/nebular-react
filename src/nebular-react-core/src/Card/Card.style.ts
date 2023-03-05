import { ComponentSize, ComponentStatus, createStyles } from '@nebular-react/styles';

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
    fontWeight: 'var(--card-text-font-weight)' as any,
    lineHeight: 'var(--card-text-line-height)',

    marginBottom: 'var(--card-margin-bottom)',

    ...theme.fns.scrollbars(
      'var(--card-scrollbar-color)',
      'var(--card-scrollbar-background-color)',
      'var(--card-scrollbar-width)'
    ),
    height: size ? `var(--card-height-${size})` : null,

    borderTopStyle: accent ? ('var(--card-border-style)' as any) : null,
    borderTopWidth: accent ? 'var(--card-border-radius)' : null,
    borderTopColor: accent ? `var(--card-header-${accent}-background-color)` : null,

    display: 'flex',
    flexDirection: 'column'
  }
}));
