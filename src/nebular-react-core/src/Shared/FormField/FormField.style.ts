import {
  ComponentOrCustomStatus,
  ComponentSize,
  createStyles,
  CSSObject,
  NebularTheme
} from '@nebular-react/styles';

export interface FormFieldStylesParams {
  size: ComponentSize;
  status: ComponentOrCustomStatus;
  fieldFocused: boolean;
  withPrefix: boolean;
  withSuffix: boolean;
}

const getAddonStyles = (status: ComponentOrCustomStatus, fieldFocused: boolean): CSSObject => {
  let addonStyles: CSSObject = {};

  if (fieldFocused) {
    addonStyles = {
      ...addonStyles,
      color: `var(--form-field-addon-${status}-highlight-text-color)`
    };
  } else {
    addonStyles = { ...addonStyles, color: `var(--form-field-addon-${status}-text-color)` };
  }

  return addonStyles;
};

const getAddonDirStyles = (
  size: ComponentSize,
  withPrefix: boolean,
  withSuffix: boolean,
  theme: NebularTheme
): CSSObject => {
  let addonDirStyles: CSSObject = {};
  const addonWidth = `var(--form-field-addon-${size}-width)`;

  if (withPrefix) {
    addonDirStyles = {
      ...addonDirStyles,
      ...theme.fns.ltr({ marginRight: `calc(${addonWidth} * -1)` }),
      ...theme.fns.rtl({ marginLeft: `calc(${addonWidth} * -1)` })
    };
  }

  if (withSuffix) {
    addonDirStyles = {
      ...addonDirStyles,
      ...theme.fns.ltr({ marginLeft: `calc(${addonWidth} * -1)` }),
      ...theme.fns.rtl({ marginRight: `calc(${addonWidth} * -1)` })
    };
  }
  return addonDirStyles;
};

export default createStyles(
  (theme, { size, status, fieldFocused, withPrefix, withSuffix }: FormFieldStylesParams) => ({
    root: {
      ...theme.fns.transition(['color']),
      display: 'flex',
      alignItems: 'center',

      '&:not(.nebular-form-field-fullWidth)': {
        maxWidth: `var(--form-field-${size}-max-width)`
      }
    },

    container: {
      maxWidth: 'inherit'
    },

    fullWidth: {
      width: '100%'
    },

    addon: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
      ...theme.fns.transition(['color']),
      ...getAddonStyles(status, fieldFocused),

      height: `var(--form-field-addon-${size}-height)`,
      width: `var(--form-field-addon-${size}-width)`,
      fontSize: `var(--form-field-addon-${size}-font-size)`,
      fontWeight: `var(--form-field-addon-${size}-font-weight)` as any,
      lineHeight: `var(--form-field-addon-${size}-line-height)`,

      ...getAddonDirStyles(size, withPrefix, withSuffix, theme),

      '.nebular-icon-root': {
        fontSize: `var(--form-field-addon-${size}-icon-size)`,
        lineHeight: `var(--form-field-addon-${size}-icon-size)`
      }
    },

    disabled: {
      color: 'var(--form-field-addon-disabled-text-color)'
    }
  })
);
