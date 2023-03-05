import { ComponentSize, createStyles } from '@nebular-react/styles';

export interface OptionStylesParams {
  size: ComponentSize;
}

export default createStyles((theme, { size }: OptionStylesParams) => ({
  root: {
    backgroundColor: 'var(--option-background-color)',
    color: 'var(--option-text-color)',
    fontFamily: 'var(--option-text-font-family)',

    '&:focus': {
      backgroundColor: 'var(--option-focus-background-color)',
      color: 'var(--option-focus-text-color)',
      outline: 'none'
    },

    '&:hover': {
      backgroundColor: 'var(--option-hover-background-color)',
      color: 'var(--option-hover-text-color)',
      cursor: 'pointer'
    },

    fontSize: `var(--option-${size}-text-font-size)`,
    fontWeight: `var(--option-${size}-text-font-weight)` as any,
    lineHeight: `var(--option-${size}-text-line-height)`,
    padding: `var(--option-${size}-padding)`,
    userSelect: 'none',

    ...theme.fns.transition(['background-color', 'color']),

    display: 'flex'
  },

  checkboxMultiple: {
    display: 'flex',
    pointerEvents: 'none',
    ...theme.fns.ltr({ marginRight: '0.5rem' }),
    ...theme.fns.rtl({ marginLeft: '0.5rem' }),

    label: {
      padding: 0
    }
  },

  selected: {
    backgroundColor: 'var(--option-selected-background-color)',
    color: 'var(--option-selected-text-color)',

    '&:focus': {
      backgroundColor: 'var(--option-selected-focus-background-color)',
      color: 'var(--option-selected-focus-text-color)'
    },

    '&:hover': {
      backgroundColor: 'var(--option-selected-hover-background-color)',
      color: 'var(--option-selected-hover-text-color)'
    }
  },

  multiple: {
    '&.nebular-option-selected': {
      backgroundColor: 'var(--option-background-color)',
      color: 'var(--option-text-color)'
    },

    '&:focus': {
      backgroundColor: 'var(--option-focus-background-color)',
      color: 'var(--option-focus-text-color)'
    },

    '&.nebular-option-active': {
      backgroundColor: 'var(--option-active-background-color)',
      color: 'var(--option-active-text-color)'
    }
  },

  active: {
    backgroundColor: 'var(--option-active-background-color)',
    color: 'var(--option-active-text-color)'
  },

  disabled: {
    backgroundColor: 'var(--option-disabled-background-color)',
    color: 'var(--option-disabled-text-color)',
    pointerEvents: 'none'
  }
}));
