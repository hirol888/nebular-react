import { ComponentSize, createStyles } from '@nebular-react/styles';

export interface OptionGroupStylesParams {
  size: ComponentSize;
}

export default createStyles((theme, { size }: OptionGroupStylesParams) => ({
  root: {
    display: 'block',
    color: 'var(--option-group-text-color)',
    backgroundColor: 'inherit',
    fontFamily: 'var(--option-text-font-family)',

    fontSize: `var(--option-${size}-text-font-size)`,
    fontWeight: `var(--option-${size}-text-font-weight)` as any,
    lineHeight: `var(--option-${size}-text-line-height)`,

    userSelect: 'none',

    '.nebular-option-root': {
      paddingLeft: `var(--option-group-${size}-start-padding)`
    }
  },

  groupTitle: {
    display: 'block',
    padding: `var(--option-${size}-padding)`
  },

  disabled: {
    color: 'var(--option-disabled-text-color)',
    backgroundColor: 'var(--option-disabled-background-color)'
  }
}));
