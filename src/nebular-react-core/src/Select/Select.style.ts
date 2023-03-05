import {
  ComponentOrCustomStatus,
  ComponentShape,
  ComponentSize,
  createStyles,
  CSSObject,
  NebularTheme,
  SelectAppearance
} from '@nebular-react/styles';

export interface SelectStylesParams {
  appearance: SelectAppearance;
  size: ComponentSize;
  shape: ComponentShape;
  status: ComponentOrCustomStatus;
  withPrefix: boolean;
  opened: boolean;
  empty: boolean;
  hasPlaceholder: boolean;
}

const getSelectDirStyles = (
  size: ComponentSize,
  withPrefix: boolean,
  theme: NebularTheme
): CSSObject => {
  const addonWidth = `var(--form-field-addon-${size}-width)`;

  return {
    ...(withPrefix
      ? theme.fns.ltr({ paddingLeft: addonWidth, textAlign: 'left' })
      : theme.fns.ltr({ paddingRight: 'var(--select-icon-offset)', textAlign: 'left' })),
    ...(withPrefix
      ? theme.fns.rtl({ paddingRight: addonWidth, textAlign: 'right' })
      : theme.fns.rtl({ paddingLeft: 'var(--select-icon-offset)', textAlign: 'right' }))
  };
};

const getAppearanceStyles = (
  appearance: SelectAppearance,
  status: ComponentOrCustomStatus,
  size: ComponentSize,
  withPrefix: boolean,
  hasPlaceholder: boolean,
  theme: NebularTheme
): CSSObject => {
  if (appearance === 'filled') {
    return getFilledStyles(status, size, withPrefix, hasPlaceholder, theme);
  }
  if (appearance === 'hero') {
    return getHeroStyles(status, size, withPrefix, hasPlaceholder, theme);
  }
  if (appearance === 'outline') {
    return getOutlineStyles(status, size, withPrefix, hasPlaceholder, theme);
  }
  return null;
};

const getFilledStyles = (
  status: ComponentOrCustomStatus,
  size: ComponentSize,
  withPrefix: boolean,
  hasPlaceholder: boolean,
  theme: NebularTheme
): CSSObject => ({
  borderStyle: 'var(--select-filled-border-style)',
  borderWidth: 'var(--select-filled-border-width)',

  padding: `var(--select-filled-${size}-padding)`,
  ...getSelectDirStyles(size, withPrefix, theme),

  backgroundColor: `var(--select-filled-${status}-background-color)`,
  borderColor: `var(--select-filled-${status}-border-color)`,
  color: hasPlaceholder
    ? `var(--select-filled-${status}-placeholder-text-color)`
    : `var(--select-filled-${status}-text-color)`,

  fontFamily: hasPlaceholder ? 'var(--select-placeholder-text-font-family)' : null,
  fontSize: hasPlaceholder ? `var(--select-${size}-placeholder-text-font-size)` : null,
  fontWeight: hasPlaceholder ? (`var(--select-${size}-placeholder-text-font-weight)` as any) : null,

  '&:focus': {
    backgroundColor: `var(--select-filled-${status}-focus-background-color)`,
    borderColor: `var(--select-filled-${status}-focus-border-color)`
  },

  '&:hover': {
    backgroundColor: `var(--select-filled-${status}-hover-background-color)`,
    borderColor: `var(--select-filled-${status}-hover-border-color)`
  },

  '&.nebular-select-disabled': {
    backgroundColor: `var(--select-filled-${status}-disabled-background-color)`,
    borderColor: `var(--select-filled-${status}-disabled-border-color)`,
    color: hasPlaceholder
      ? `var(--select-filled-${status}-placeholder-text-color)`
      : `var(--select-filled-${status}-text-color)`,

    '&:focus': {
      backgroundColor: `var(--select-filled-${status}-disabled-background-color)`,
      borderColor: `var(--select-filled-${status}-disabled-border-color)`
    },

    '&:hover': {
      backgroundColor: `var(--select-filled-${status}-disabled-background-color)`,
      borderColor: `var(--select-filled-${status}-disabled-border-color)`
    }
  }
});

const getHeroStyles = (
  status: ComponentOrCustomStatus,
  size: ComponentSize,
  withPrefix: boolean,
  hasPlaceholder: boolean,
  theme: NebularTheme
): CSSObject => {
  const leftColor = `var(--select-hero-${status}-left-background-color)`;
  const rightColor = `var(--select-hero-${status}-right-background-color)`;
  const leftFocusColor = `var(--select-hero-${status}-focus-left-background-color)`;
  const rightFocusColor = `var(--select-hero-${status}-focus-right-background-color)`;
  const leftHoverColor = `var(--select-hero-${status}-hover-left-background-color)`;
  const rightHoverColor = `var(--select-hero-${status}-hover-right-background-color)`;

  return {
    border: 'none',

    padding: `var(--select-hero-${size}-padding)`,
    ...getSelectDirStyles(size, withPrefix, theme),

    backgroundImage: `linear-gradient(to right, ${leftColor}, ${rightColor})`,
    color: hasPlaceholder
      ? `var(--select-hero-${status}-placeholder-text-color)`
      : `var(--select-hero-${status}-text-color)`,

    fontFamily: hasPlaceholder ? 'var(--select-placeholder-text-font-family)' : null,
    fontSize: hasPlaceholder ? `var(--select-${size}-placeholder-text-font-size)` : null,
    fontWeight: hasPlaceholder
      ? (`var(--select-${size}-placeholder-text-font-weight)` as any)
      : null,

    '&.placeholder': {
      ...getPlaceholderStyles('hero', status, size)
    },

    '&:focus': {
      backgroundImage: `linear-gradient(to right, ${leftFocusColor}, ${rightFocusColor})`
    },

    '&:hover': {
      backgroundImage: `linear-gradient(to right, ${leftHoverColor}, ${rightHoverColor})`
    },

    '&.nebular-select-disabled': {
      backgroundImage: 'none',
      backgroundColor: `var(--select-hero-${status}-disabled-background-color)`,
      borderColor: `var(--select-hero-${status}-disabled-border-color)`,

      '&:focus': {
        backgroundImage: 'none'
      },

      '&:hover': {
        backgroundImage: 'none'
      }
    }
  };
};

const getOutlineStyles = (
  status: ComponentOrCustomStatus,
  size: ComponentSize,
  withPrefix: boolean,
  hasPlaceholder: boolean,
  theme: NebularTheme
): CSSObject => ({
  borderStyle: 'var(--select-outline-border-style)',
  borderWidth: 'var(--select-outline-border-width)',

  padding: `var(--select-outline-${size}-padding)`,
  ...getSelectDirStyles(size, withPrefix, theme),

  '.top': {
    borderTopStyle: 'var(--select-outline-adjacent-border-style)' as any,
    borderTopWidth: 'var(--select-outline-adjacent-border-width)',
    borderColor: `var(--select-outline-${status}-open-border-color)`,
    borderTopColor: `var(--select-outline-${status}-adjacent-border-color)`
  },

  '.bottom': {
    borderBottomStyle: 'var(--select-outline-adjacent-border-style)' as any,
    borderBottomWidth: 'var(--select-outline-adjacent-border-width)',
    borderColor: `var(--select-outline-${status}-open-border-color)`,
    borderBottomColor: `var(--select-outline-${status}-adjacent-border-color)`
  },

  backgroundColor: `var(--select-outline-${status}-background-color)`,
  borderColor: `var(--select-outline-${status}-border-color)`,
  color: hasPlaceholder
    ? `var(--select-outline-${status}-placeholder-text-color)`
    : `var(--select-outline-${status}-text-color)`,

  fontFamily: hasPlaceholder ? 'var(--select-placeholder-text-font-family)' : null,
  fontSize: hasPlaceholder ? `var(--select-${size}-placeholder-text-font-size)` : null,
  fontWeight: hasPlaceholder ? (`var(--select-${size}-placeholder-text-font-weight)` as any) : null,

  '&:focus': {
    backgroundColor: `var(--select-outline-${status}-focus-background-color)`,
    borderColor: `var(--select-outline-${status}-focus-border-color)`
  },
  '&:hover': {
    backgroundColor: `var(--select-outline-${status}-hover-background-color)`,
    borderColor: `var(--select-outline-${status}-hover-border-color)`
  },

  '&.nebular-select-disabled': {
    backgroundColor: `var(--select-outline-${status}-disabled-background-color)`,
    borderColor: `var(--select-outline-${status}-disabled-border-color)`,

    '&:focus': {
      backgroundColor: `var(--select-outline-${status}-disabled-background-color)`,
      borderColor: `var(--select-outline-${status}-disabled-border-color)`
    },
    '&:hover': {
      backgroundColor: `var(--select-outline-${status}-disabled-background-color)`,
      borderColor: `var(--select-outline-${status}-disabled-border-color)`
    }
  }
});

const getPlaceholderStyles = (
  appearance: SelectAppearance,
  status: ComponentOrCustomStatus,
  size: ComponentSize
): CSSObject => ({
  fontFamily: 'var(--select-placeholder-text-font-family)',
  fontSize: `var(--select-${size}-placeholder-text-font-size)`,
  fontWeight: `var(--select-${size}-placeholder-text-font-weight)` as any,
  color: `var(--select-${appearance}-${status}-placeholder-text-color)`
});

export default createStyles(
  (
    theme,
    {
      appearance,
      size,
      shape,
      status,
      withPrefix,
      opened,
      empty,
      hasPlaceholder
    }: SelectStylesParams
  ) => ({
    root: {
      display: 'inline-block',

      '&:not(.nebular-select-fullWidth)': {
        maxWidth: `var(--select-${size}-max-width)`
      },

      ...theme.fns.transition([
        'background-color',
        'border-color',
        'border-radius',
        'box-shadow',
        'color'
      ])
    },

    selectButton: {
      minWidth: 'var(--select-min-width)',
      cursor: 'var(--select-cursor)',
      fontFamily: 'var(--select-text-font-family)',

      '&:focus-visible': {
        outline: 'none'
      },

      '> span': {
        fontSize: `var(--select-${size}-text-font-size)`,
        fontWeight: `var(--select-${size}-text-font-weight)` as any,
        lineHeight: `var(--select-${size}-text-line-height)`
      },

      '&::before': {
        content: empty ? '" "' : null,
        display: empty ? 'block' : null,
        height: empty ? `var(--select-${size}-text-line-height)` : null
      },

      borderRadius: `var(--select-${shape}-border-radius)`,

      ...getAppearanceStyles(appearance, status, size, withPrefix, hasPlaceholder, theme),

      '.nebular-icon-root': {
        fontSize: '1.5em',
        position: 'absolute',
        top: '50%',
        transform: opened ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
        transitionDuration: '300ms',
        transitionProperty: 'transform',
        transitionTimingFunction: 'ease-out',
        color: `var(--select-${appearance}-${status}-icon-color)`,

        ...theme.fns.ltr({ right: '0.2em' }),
        ...theme.fns.rtl({ left: '0.2em' })
      },

      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textTransform: 'none',
      whiteSpace: 'nowrap'
    },

    fullWidth: {
      width: '100%'
    },

    disabled: {
      cursor: 'var(--select-disabled-cursor)',

      '.nebular-icon-root': {
        color: `var(--select-${appearance}-${status}-disabled-icon-color)`
      }
    }
  })
);
