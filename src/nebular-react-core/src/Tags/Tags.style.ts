import {
  ComponentOrCustomStatus,
  ComponentShape,
  ComponentSize,
  createStyles,
  CSSObject,
  NebularTheme
} from '@nebular-react/styles';

export interface TagsStylesParams {
  shape: ComponentShape;
  size: ComponentSize;
  status: ComponentOrCustomStatus;
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
  (theme, { shape, size, status, withPrefix, withSuffix }: TagsStylesParams) => ({
    root: {
      display: 'inline-flex',
      position: 'relative',
      outline: 'none'
    },

    tagsWrapper: {
      margin: `-${`var(--tag-list-${size}-tag-offset)`}`,

      '.nebular-tag-root, .nebular-tags-tagInput': {
        margin: `var(--tag-list-${size}-tag-offset)`
      },

      display: 'inline-flex',
      alignItems: 'center',
      alignContent: 'center',
      flexWrap: 'wrap',
      flex: 1
    },

    tagsListbox: {
      display: 'inline-flex',
      alignItems: 'center',
      alignContent: 'center',
      flexWrap: 'wrap'
    },

    tagsWithInput: {
      borderStyle: 'var(--input-border-style)',
      borderWidth: 'var(--input-border-width)',
      fontFamily: 'var(--input-text-font-family)',
      appearance: 'none',

      ...theme.fns.transition(['border', 'background-color', 'color', 'box-shadow']),

      '&::placeholder': {
        fontFamily: 'var(--input-placeholder-text-font-family)',
        textOverflow: 'ellipsis'
      },

      '&.focus': {
        outline: 'none',
        backgroundColor: `var(--tag-input-${status}-focus-background-color)`,
        borderColor: `var(--tag-input-${status}-focus-border-color)`
      },

      borderRadius: `var(--tag-list-with-input-${shape}-border-radius)`,
      padding: `var(--tag-list-with-input-${size}-padding)`,

      backgroundColor: `var(--tag-input-${status}-background-color)`,
      borderColor: `var(--tag-input-${status}-border-color)`,

      ...getInputDirStyles(size, withPrefix, withSuffix, theme)
    },

    fullWidth: {
      width: '100%'
    },

    autocompleteList: {
      position: 'absolute',
      zIndex: 1000,
      top: '100%',
      left: 0,
      minWidth: '100%',
      maxHeight: 'var(--option-list-max-height)',
      margin: 0,
      padding: 0,
      overflow: 'auto',
      backgroundColor: 'var(--option-list-background-color)',
      borderColor: 'var(--option-list-border-color)',
      borderStyle: 'var(--option-list-border-style)',
      borderWidth: 'var(--option-list-border-width)',
      borderRadius: 'var(--option-list-border-radius)',
      boxShadow: 'var(--option-list-shadow)'
    },

    autocompleteItem: {
      cursor: 'pointer',
      padding: '0.5rem 0.75rem',
      color: 'var(--option-text-color)',
      fontFamily: 'var(--option-text-font-family)',
      fontSize: 'var(--option-text-font-size)',

      '&:hover': {
        backgroundColor: 'var(--option-hover-background-color)',
        color: 'var(--option-hover-text-color)'
      }
    },

    tagInput: {
      appearance: 'none',
      border: 'transparent',
      background: 'transparent',
      outline: 'none',

      flex: 1,
      minWidth: 'var(--tag-input-min-width)',
      fontFamily: 'var(--tag-input-text-font-family)',

      '&::placeholder': {
        fontFamily: 'var(--tag-input-placeholder-text-font-family)',
        fontSize: `var(--tag-input-${size}-placeholder-text-font-size)`,
        fontWeight: `var(--tag-input-${size}-placeholder-text-font-weight)` as any,
        lineHeight: `var(--tag-input-${size}-placeholder-text-line-height)`,
        color: `var(--tag-input-${status}-placeholder-text-color)`
      },

      fontSize: `var(--tag-input-${size}-text-font-size)`,
      fontWeight: `var(--tag-input-${size}-text-font-weight)` as any,
      lineHeight: `var(--tag-input-${size}-text-line-height)`,
      padding: `var(--tag-input-${size}-padding)`,

      color: `var(--tag-input-${status}-text-color)`,

      '&:disabled': {
        color: `var(--tag-input-${status}-disabled-text-color)`,

        '&::placeholder': {
          color: `var(--tag-input-${status}-disabled-placeholder-text-color)`
        }
      }
    }
  })
);
