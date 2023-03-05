import { CSSObject } from '../../../../tss/types/css-object';

export function scrollbars(color: any, background: any, width: any): CSSObject {
  return {
    '&::-webkit-scrollbar': {
      width,
      height: width
    },

    '&::-webkit-scrollbar-thumb': {
      background: color,
      cursor: 'pointer',
      borderRadius: `calc(${width} * 5)`
    },

    '&::-webkit-scrollbar-track': {
      background
    },

    '&::-webkit-scrollbar-corner': {
      background
    }
  };
}
