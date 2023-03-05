import {
  ComponentOrCustomStatus,
  ComponentShape,
  ComponentSize,
  createStyles,
  CSSObject,
  NebularTheme
} from '@nebular-react/styles';

export interface InputStylesParams {
  size: ComponentSize;
  status: ComponentOrCustomStatus;
  shape: ComponentShape;
  withPrefix: boolean;
  withSuffix: boolean;
}

const getInputDirStyles = (
  size: ComponentSize,
  withPrefix: boolean,
  withSuffix: boolean,
  theme: NebularTheme
): CSSObject => {
  let inputDirStyles: CSSObject = {};
  const addonWidth = `var(--form-field-addon-${size}-width)`;

  if (withPrefix) {
    inputDirStyles = {
      ...inputDirStyles,
      ...theme.fns.ltr({ paddingLeft: addonWidth }),
      ...theme.fns.rtl({ paddingRight: addonWidth })
    };
  }

  if (withSuffix) {
    inputDirStyles = {
      ...inputDirStyles,
      ...theme.fns.ltr({ paddingRight: addonWidth }),
      ...theme.fns.rtl({ paddingLeft: addonWidth })
    };
  }
  return inputDirStyles;
};

export default createStyles(
  (theme, { size, status, shape, withPrefix, withSuffix }: InputStylesParams) => ({
    root: {
      borderStyle: 'var(--input-border-style)',
      borderWidth: 'var(--input-border-width)',
      fontFamily: 'var(--input-text-font-family)',
      appearance: 'none',

      ...theme.fns.transition(['border', 'background-color', 'color', 'box-shadow']),

      '&::placeholder': {
        fontFamily: 'var(--input-placeholder-text-font-family)',
        textOverflow: 'ellipsis',
        color: `var(--input-${status}-placeholder-text-color)`,
        fontSize: `var(--input-${size}-placeholder-text-font-size)`,
        fontWeight: `var(--input-${size}-placeholder-text-font-weight)` as any
      },

      '&:focus': {
        outline: 'none',
        backgroundColor: `var(--input-${status}-focus-background-color)`,
        borderColor: `var(--input-${status}-focus-border-color)`
      },

      backgroundColor: `var(--input-${status}-background-color)`,
      borderColor: `var(--input-${status}-border-color)`,
      color: `var(--input-${status}-text-color)`,

      '&:hover': {
        backgroundColor: `var(--input-${status}-hover-background-color)`,
        borderColor: `var(--input-${status}-hover-border-color)`
      },

      fontSize: `var(--input-${size}-text-font-size)`,
      fontWeight: `var(--input-${size}-text-font-weight)` as any,
      lineHeight: `var(--input-${size}-text-line-height)`,
      padding: `var(--input-${size}-padding)`,

      borderRadius: `var(--input-${shape}-border-radius)`,

      '&:not(.nebular-input-fullWidth)': {
        maxWidth: `var(--input-${size}-max-width)`
      },

      ':disabled': {
        backgroundColor: `var(--input-${status}-disabled-background-color)`,
        borderColor: `var(--input-${status}-disabled-border-color)`,
        color: `var(--input-${status}-disabled-text-color)`,

        '&::placeholder': {
          color: `var(--input-${status}-disabled-placeholder-text-color)`
        }
      },
      ...getInputDirStyles(size, withPrefix, withSuffix, theme)
    },

    fullWidth: {
      width: '100%'
    }
  })
);
