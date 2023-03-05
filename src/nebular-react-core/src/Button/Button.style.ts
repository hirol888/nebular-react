import {
  ButtonAppearance,
  ComponentOrCustomStatus,
  ComponentShape,
  ComponentSize,
  createStyles,
  NebularTheme,
  CSSObject
} from '@nebular-react/styles';

export interface ButtonStylesParams {
  size: ComponentSize;
  withPrefixIcon: boolean;
  withSuffixIcon: boolean;
  iconOnly: boolean;
  appearance: ButtonAppearance;
  shape: ComponentShape;
  status: ComponentOrCustomStatus;
}

const getIconDirStyles = (
  withPrefixIcon: boolean,
  withSuffixIcon: boolean,
  iconOnly: boolean,
  size: ComponentSize,
  theme: NebularTheme
): CSSObject => {
  if (iconOnly) {
    return null;
  }

  if (withPrefixIcon && !withSuffixIcon) {
    return {
      ...theme.fns.ltr({ marginRight: `var(--button-${size}-icon-offset)` }),
      ...theme.fns.rtl({ marginLeft: `var(--button-${size}-icon-offset)` })
    };
  }
  if (withSuffixIcon && !withPrefixIcon) {
    return {
      ...theme.fns.ltr({ marginLeft: `var(--button-${size}-icon-offset)` }),
      ...theme.fns.rtl({ marginRight: `var(--button-${size}-icon-offset)` })
    };
  }

  return null;
};

const getAppearanceStyles = (
  appearance: ButtonAppearance,
  status: ComponentOrCustomStatus,
  size: ComponentSize,
  theme: NebularTheme
): CSSObject => {
  if (appearance === 'filled') {
    return getFilledStyles(status, size, theme);
  }
  if (appearance === 'ghost') {
    return getGhostStyles(status, size, theme);
  }
  if (appearance === 'hero') {
    return getHeroStyles(status, size, theme);
  }
  if (appearance === 'outline') {
    return getOutlineStyles(status, size, theme);
  }
  return null;
};

const getFilledStyles = (
  status: ComponentOrCustomStatus,
  size: ComponentSize,
  theme: NebularTheme
): CSSObject => ({
  borderStyle: 'var(--button-filled-border-style)',
  borderWidth: 'var(--button-filled-border-width)',
  textTransform: 'var(--button-filled-text-transform)' as any,

  padding: `var(--button-filled-${size}-padding)`,

  backgroundColor: `var(--button-filled-${status}-background-color)`,
  borderColor: `var(--button-filled-${status}-border-color)`,
  color: `var(--button-filled-${status}-text-color)`,

  '&:focus': {
    position: 'relative',
    outline: 'none',
    ...theme.fns.outline('var(--button-outline-width)', 'var(--button-outline-color)'),
    backgroundColor: `var(--button-filled-${status}-focus-background-color)`,
    borderColor: `var(--button-filled-${status}-focus-border-color)`,
    color: `var(--button-filled-${status}-text-color)`
  },

  '&:hover': {
    backgroundColor: `var(--button-filled-${status}-hover-background-color)`,
    borderColor: `var(--button-filled-${status}-hover-border-color)`,
    color: `var(--button-filled-${status}-text-color)`
  },

  '&:active': {
    backgroundColor: `var(--button-filled-${status}-active-background-color)`,
    borderColor: `var(--button-filled-${status}-active-border-color)`,
    color: `var(--button-filled-${status}-text-color)`
  }
});

const getGhostStyles = (
  status: ComponentOrCustomStatus,
  size: ComponentSize,
  theme: NebularTheme
): CSSObject => ({
  backgroundColor: 'var(--button-ghost-background-color)',
  borderColor: 'var(--button-ghost-border-color)',
  borderStyle: 'var(--button-ghost-border-style)',
  borderWidth: 'var(--button-ghost-border-width)',
  textTransform: 'var(--button-ghost-text-transform)' as any,

  padding: `var(--button-ghost-${size}-padding)`,

  '&:focus': {
    ...theme.fns.outline(
      'var(--button-outline-width)',
      'var(--button-outline-color)',
      'var(--button-ghost-focus-inset-shadow-length)'
    ),
    backgroundColor: `var(--button-ghost-${status}-focus-background-color)`,
    borderColor: `var(--button-ghost-${status}-focus-border-color)`,
    color: `var(--button-ghost-${status}-focus-text-color)`,
    position: 'relative',
    outline: 'none'
  },

  color: `var(--button-ghost-${status}-text-color)`,

  '&:hover': {
    backgroundColor: `var(--button-ghost-${status}-hover-background-color)`,
    borderColor: `var(--button-ghost-${status}-hover-border-color)`,
    color: `var(--button-ghost-${status}-hover-text-color)`
  },

  '&:active': {
    backgroundColor: `var(--button-ghost-${status}-active-background-color)`,
    borderColor: `var(--button-ghost-${status}-active-border-color)`,
    color: `var(--button-ghost-${status}-active-text-color)`
  }
});

const getHeroStyles = (
  status: ComponentOrCustomStatus,
  size: ComponentSize,
  theme: NebularTheme
): CSSObject => {
  const leftColor = `var(--button-hero-${status}-left-background-color)`;
  const rightColor = `var(--button-hero-${status}-right-background-color)`;
  const bevel = `var(--button-hero-bevel-size) var(--button-hero-${status}-bevel-color)`;
  const glow = `var(--button-hero-glow-size} var(--button-hero-${status}-glow-color)`;
  const shadow = 'var(--button-hero-shadow)';
  const heroBoxShadow = `${bevel}, ${glow}, ${shadow}`;
  const leftFocusColor = `var(--button-hero-${status}-focus-left-background-color)`;
  const rightFocusColor = `var(--button-hero-${status}-focus-right-background-color)`;
  const leftHoverColor = `var(--button-hero-${status}-hover-left-background-color)`;
  const rightHoverColor = `var(--button-hero-${status}-hover-right-background-color)`;
  const leftActiveColor = `var(--button-hero-${status}-active-left-background-color)`;
  const rightActiveColor = `var(--button-hero-${status}-active-right-background-color)`;
  return {
    textShadow: 'var(--button-hero-text-shadow)',
    textTransform: 'var(--button-hero-text-transform)' as any,

    padding: `var(--button-hero-${size}-padding)`,

    backgroundImage: `linear-gradient(to right, ${leftColor}, ${rightColor})`,
    border: 'none',
    color: `var(--button-hero-${status}-text-color)`,

    '&:focus': {
      backgroundImage: `linear-gradient(to right, ${leftFocusColor}, ${rightFocusColor})`,
      boxShadow: `${heroBoxShadow}, 0 0 0 var(--button-hero-outline-width) var(--button-hero-outline-color)`,
      color: `var(--button-hero-${status}-text-color)`,
      position: 'relative',
      outline: 'none',
      ...theme.fns.outline('var(--button-outline-width)', 'var(--button-outline-color)')
    },

    '&:hover': {
      backgroundImage: `linear-gradient(to right, ${leftHoverColor}, ${rightHoverColor})`,
      color: `var(--button-hero-${status}-text-color)`
    },

    '&:active': {
      backgroundImage: `linear-gradient(to right, ${leftActiveColor}, ${rightActiveColor})`,
      color: `var(--button-hero-${status}-text-color)`
    }
  };
};

const getOutlineStyles = (
  status: ComponentOrCustomStatus,
  size: ComponentSize,
  theme: NebularTheme
): CSSObject => ({
  borderStyle: 'var(--button-outline-border-style)',
  borderWidth: 'var(--button-outline-border-width)',
  textTransform: 'var(--button-outline-text-transform)' as any,

  padding: `var(--button-outline-${size}-padding)`,

  '&:focus': {
    ...theme.fns.outline(
      'var(--button-outline-width)',
      'var(--button-outline-color)',
      'var(--button-outline-focus-inset-shadow-length)'
    ),
    backgroundColor: `var(--button-outline-${status}-focus-background-color)`,
    borderColor: `var(--button-outline-${status}-focus-border-color)`,
    color: `var(--button-outline-${status}-focus-text-color)`,
    position: 'relative',
    outline: 'none'
  },

  backgroundColor: `var(--button-outline-${status}-background-color)`,
  borderColor: `var(--button-outline-${status}-border-color)`,
  color: `var(--button-outline-${status}-text-color)`,

  '&:hover': {
    backgroundColor: `var(--button-outline-${status}-hover-background-color)`,
    borderColor: `var(--button-outline-${status}-hover-border-color)`,
    color: `var(--button-outline-${status}-hover-text-color)`
  },

  '&:active': {
    backgroundColor: `var(--button-outline-${status}-active-background-color)`,
    borderColor: `var(--button-outline-${status}-active-border-color)`,
    color: `var(--button-outline-${status}-active-text-color)`
  }
});

const getIconStyles = (withPrefixIcon: boolean, withSuffixIcon: boolean, size: ComponentSize) => {
  let styles: CSSObject = {};
  if (withPrefixIcon || withSuffixIcon) {
    styles = {
      verticalAlign: 'top',
      fontSize: `var(--button-${size}-text-font-size)`,
      height: `var(--button-${size}-icon-size)`,
      width: `var(--button-${size}-icon-size)`,
      marginTop: `var(--button-${size}-icon-vertical-margin)`,
      marginBottom: `var(--button-${size}-icon-vertical-margin)`
    };
  }

  return styles;
};

export default createStyles(
  (
    theme,
    {
      size,
      withPrefixIcon,
      withSuffixIcon,
      iconOnly,
      appearance,
      shape,
      status
    }: ButtonStylesParams
  ) => ({
    root: {
      appearance: 'none',
      textAlign: 'center',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap',
      verticalAlign: 'middle',
      userSelect: 'none',
      textDecoration: 'none',

      ...theme.fns.transition(['background-color', 'border-color', 'box-shadow', 'color']),
      ...getAppearanceStyles(appearance, status, size, theme),

      cursor: 'var(--button-cursor)',
      fontFamily: 'var(--button-text-font-family)',
      fontWeight: 'var(--button-text-font-weight)' as any,

      fontSize: `var(--button-${size}-text-font-size)`,
      lineHeight: `var(--button-${size}-text-line-height)`,

      padding: iconOnly
        ? `var(--icon-button-${appearance}-${size}-padding)`
        : `var(--button-${appearance}-${size}-padding)`,

      '.nebular-icon-root': {
        ...getIconStyles(withPrefixIcon, withSuffixIcon, size),
        ...getIconDirStyles(withPrefixIcon, withSuffixIcon, iconOnly, size, theme)
      },

      borderRadius: `var(--button-${shape}-border-radius)`
    },

    wrapper: {
      display: 'inline-flex',
      cursor: 'inherit',
      width: 'auto'
    },

    fullWidth: {
      width: '100%'
    },

    disabled: {
      pointerEvents: 'none',
      cursor: 'var(--button-disabled-cursor)',
      backgroundColor: `var(--button-${appearance}-${status}-disabled-background-color)`,
      borderColor: `var(--button-${appearance}-${status}-disabled-border-color)`,
      color: `var(--button-${appearance}-${status}-disabled-text-color)`
    },

    wrapperDisabled: {
      cursor: 'var(--button-disabled-cursor)'
    }
  })
);
