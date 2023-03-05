import {
  CSSObject,
  ComponentOrCustomStatus,
  ComponentSize,
  ComponentStatus,
  createStyles,
  NebularTheme
} from '@nebular-react/styles';

export interface AlertStylesParams {
  size: ComponentSize;
  status: ComponentOrCustomStatus;
  accent?: ComponentStatus;
  outline?: ComponentStatus;
  closable: boolean;
}

const getClosableStyles = (closable: boolean, theme: NebularTheme) => {
  let styles: CSSObject = {};
  if (closable) {
    styles = {
      ...theme.fns.ltr({ paddingRight: 'var(--alert-closable-start-padding)' }),
      ...theme.fns.rtl({ paddingLeft: 'var(--alert-closable-start-padding)' })
    };
  }

  return styles;
};

export default createStyles(
  (theme, { size, status, accent, outline, closable }: AlertStylesParams) => ({
    root: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',

      borderRadius: 'var(--alert-border-radius)',
      boxShadow: 'var(--alert-shadow)',
      fontFamily: 'var(--alert-text-font-family)',
      fontSize: 'var(--alert-text-font-size)',
      fontWeight: 'var(--alert-text-font-weight)' as any,
      lineHeight: 'var(--alert-text-line-height)',
      padding: 'var(--alert-padding)',

      marginBottom: 'var(--alert-bottom-margin)',

      ...theme.fns.scrollbars(
        'var(--alert-scrollbar-color)',
        'var(--alert-scrollbar-background-color)',
        'var(--alert-scrollbar-width)'
      ),

      height: `var(--alert-${size}-height)`,
      color: `var(--alert-${status}-text-color)`,
      backgroundColor: `var(--alert-${status}-background-color)`,

      borderTop: accent
        ? `var(--alert-border-radius) solid var(--alert-accent-${accent}-color)`
        : null,
      border: outline
        ? `var(--alert-outline-width) solid var(--alert-outline-${outline}-color)`
        : null,
      ...getClosableStyles(closable, theme)
    },

    close: {
      padding: 'var(--alert-padding)',
      fontSize: '1.5rem',
      lineHeight: 1,
      cursor: 'pointer',
      fontFamily: 'monospace',

      ...theme.fns.ltr({ right: 0 }),
      ...theme.fns.rtl({ left: 0 }),

      position: 'absolute',
      top: 0,
      color: 'inherit',
      backgroundColor: 'transparent',
      border: 0,
      appearance: 'none',

      fontWeight: 'var(--alert-close-font-weight)' as any,
      textShadow: 'var(--alert-close-text-shadow)',
      opacity: 'var(--alert-close-opacity)',

      '&:focus, &:hover': {
        opacity: 'var(--alert-close-hover-focus-opacity)'
      }
    }
  })
);
