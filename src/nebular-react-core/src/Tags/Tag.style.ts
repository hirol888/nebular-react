import { ComponentOrCustomStatus, ComponentSize, createStyles } from '@nebular-react/styles';
import { TagAppearance } from './types';

export interface TagStylesParams {
  size: ComponentSize;
  status: ComponentOrCustomStatus;
  appearance: TagAppearance;
}

export default createStyles((theme, { size, status, appearance }: TagStylesParams) => ({
  root: {
    borderStyle: 'var(--tag-border-style)',
    borderWidth: 'var(--tag-border-width)',
    borderRadius: 'var(--tag-border-radius)',

    display: 'inline-flex',
    alignItems: 'center',

    fontFamily: 'var(--tag-text-font-family)',
    textTransform: 'var(--tag-text-transform)' as any,

    cursor: 'default',

    ...theme.fns.transition(['background-color', 'border-color', 'color']),

    fontSize: `var(--tag-${size}-text-font-size)`,
    fontWeight: `var(--tag-${size}-text-font-weight)` as any,
    lineHeight: `var(--tag-${size}-text-line-height)`,
    padding: `var(--tag-${size}-padding)`,

    backgroundColor: `var(--tag-${appearance}-${status}-background-color)`,
    borderColor: `var(--tag-${appearance}-${status}-border-color)`,
    color: `var(--tag-${appearance}-${status}-text-color)`,

    '&:hover': {
      backgroundColor: `var(--tag-${appearance}-${status}-hover-background-color)`,
      borderColor: `var(--tag-${appearance}-${status}-hover-border-color)`,
      color: appearance === 'outline' ? `var(--tag-outline-${status}-hover-text-color)` : null
    }
  },

  selected: {
    backgroundColor: `var(--tag-${appearance}-${status}-selected-background-color)`,
    borderColor: `var(--tag-${appearance}-${status}-selected-border-color)`,
    color: appearance === 'outline' ? `var(--tag-outline-${status}-selected-text-color)` : null
  },

  active: {
    backgroundColor: `var(--tag-${appearance}-${status}-active-background-color)`,
    borderColor: `var(--tag-${appearance}-${status}-active-border-color)`,
    color: appearance === 'outline' ? `var(--tag-outline-${status}-active-text-color)` : null
  },

  tagRemove: {
    cursor: 'pointer',

    fontSize: `var(--tag-${size}-text-line-height)`,
    ...theme.fns.ltr({
      marginLeft: `var(--tag-${size}-close-offset)`,
      marginRight: `-${`var(--tag-${size}-close-offset)`}`
    }),
    ...theme.fns.rtl({
      marginRight: `var(--tag-${size}-close-offset)`,
      marginLeft: `-${`var(--tag-${size}-close-offset)`}`
    })
  }
}));
