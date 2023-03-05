import {
  CSSObject,
  createStyles,
  ComponentOrCustomStatus,
  NebularTheme
} from '@nebular-react/styles';

export interface CheckboxStylesParams {
  status: ComponentOrCustomStatus;
  checked: boolean;
  indeterminate: boolean;
}

const getFocusStyles = (checked: boolean, theme: NebularTheme) => {
  let styles: CSSObject = {};
  if (checked) {
    styles = theme.fns.outline('var(--checkbox-outline-width)', 'var(--checkbox-outline-color)');
  } else {
    styles = theme.fns.outline(
      'var(--checkbox-outline-width)',
      'var(--checkbox-outline-color)',
      'var(--checkbox-focus-inset-shadow-length)'
    );
  }

  return styles;
};

export default createStyles((theme, { status, checked, indeterminate }: CheckboxStylesParams) => ({
  root: {},

  label: {
    padding: 'var(--checkbox-padding)',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    margin: 0,
    minHeight: 'inherit'
  },

  custom: {
    width: 'var(--checkbox-width)',
    height: 'var(--checkbox-height)',
    borderStyle: 'var(--checkbox-border-style)',
    borderWidth: 'var(--checkbox-border-width)',
    borderRadius: 'var(--checkbox-border-radius)',
    position: 'relative',
    flexShrink: 0,

    ...theme.fns.transition(['background-color', 'border', 'box-shadow']),

    backgroundColor: indeterminate
      ? `var(--checkbox-${status}-indeterminate-background-color)`
      : checked
      ? `var(--checkbox-${status}-checked-background-color)`
      : `var(--checkbox-${status}-background-color)`,
    borderColor: indeterminate
      ? `var(--checkbox-${status}-indeterminate-border-color)`
      : checked
      ? `var(--checkbox-${status}-checked-border-color)`
      : `var(--checkbox-${status}-border-color)`,

    '.nebular-checkbox-icon': {
      color: indeterminate
        ? `var(--checkbox-${status}-indeterminate-checkmark-color)`
        : checked
        ? `var(--checkbox-${status}-checked-checkmark-color)`
        : null
    },

    '&:hover': {
      backgroundColor:
        indeterminate || checked
          ? `var(--checkbox-${status}-hover-checked-background-color)`
          : `var(--checkbox-${status}-hover-background-color)`,
      borderColor:
        indeterminate || checked
          ? `var(--checkbox-${status}-hover-checked-border-color)`
          : `var(--checkbox-${status}-hover-border-color)`
    }
  },

  nativeInput: {
    ...theme.fns.hidden(),

    '&:focus + .nebular-checkbox-custom': {
      ...getFocusStyles(checked, theme)
    },

    '&:enabled:focus + .nebular-checkbox-custom': {
      backgroundColor:
        indeterminate || checked
          ? `var(--checkbox-${status}-focus-checked-background-color)`
          : `var(--checkbox-${status}-focus-background-color)`,
      borderColor:
        indeterminate || checked
          ? `var(--checkbox-${status}-focus-checked-border-color)`
          : `var(--checkbox-${status}-focus-border-color)`
    },

    '&:enabled:active + .nebular-checkbox-custom': {
      backgroundColor:
        indeterminate || checked
          ? `var(--checkbox-${status}-active-checked-background-color)`
          : `var(--checkbox-${status}-active-background-color)`,
      borderColor:
        indeterminate || checked
          ? `var(--checkbox-${status}-active-checked-border-color)`
          : `var(--checkbox-${status}-active-border-color)`
    },

    '&:disabled': {
      '& + .nebular-checkbox-custom': {
        backgroundColor: `var(--checkbox-${status}-disabled-background-color)`,
        borderColor: `var(--checkbox-${status}-disabled-border-color)`,

        '.nebular-icon-root': {
          color: `var(--checkbox-${status}-disabled-checkmark-color)`
        }
      },

      '& ~ .nebular-checkbox-text': {
        color: `var(--checkbox-${status}-disabled-text-color)`
      },

      '&:indeterminate + .nebular-checkbox-custom, &:checked + .nebular-checkbox-custom': {
        backgroundColor: `var(--checkbox-${status}-disabled-checked-background-color)`,
        borderColor: `var(--checkbox-${status}-disabled-checked-border-color)`
      }
    }
  },

  icon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '50%'
  },

  text: {
    fontFamily: 'var(--checkbox-text-font-family)',
    fontSize: 'var(--checkbox-text-font-size)',
    fontWeight: 'var(--checkbox-text-font-weight)' as any,
    lineHeight: 'var(--checkbox-text-line-height)',

    '&:not(:empty)': {
      ...theme.fns.ltr({ paddingLeft: 'var(--checkbox-text-space)' }),
      ...theme.fns.rtl({ paddingRight: 'var(--checkbox-text-space)' })
    },

    color: `var(--checkbox-${status}-text-color)`,

    ...theme.fns.transition(['color'])
  }
}));
