import { Position } from '@nebular-react/hooks';
import { createStyles, CSSObject } from '@nebular-react/styles';

export interface OptionListStylesParams {
  position: Position;
  itemsCount: number;
}

const getPostionStyles = (position: Position): CSSObject => {
  let positionStyles: CSSObject = {};
  const adjacentBorder =
    'var(--option-list-adjacent-border-width) var(--option-list-adjacent-border-style) var(--option-list-adjacent-border-color)';
  if (position === 'top') {
    positionStyles = { ...positionStyles, borderBottom: adjacentBorder };
  }
  if (position === 'bottom') {
    positionStyles = { ...positionStyles, borderTop: adjacentBorder };
  }

  return positionStyles;
};

export default createStyles((theme, { position, itemsCount }: OptionListStylesParams) => ({
  root: {
    backgroundColor: 'var(--option-list-background-color)',
    borderColor: 'var(--option-list-border-color)',
    borderStyle: 'var(--option-list-border-style)',
    borderWidth: itemsCount > 0 ? 'var(--option-list-border-width)' : 0,
    borderRadius: 'var(--option-list-border-radius)',
    boxShadow: 'var(--option-list-shadow)',
    overflow: 'hidden'
  },

  optionList: {
    height: '100%',
    maxHeight: 'var(--option-list-max-height)',
    margin: 0,
    padding: 0,
    overflow: 'auto',
    ...getPostionStyles(position),
    ...theme.fns.scrollbars(
      'var(--option-list-scrollbar-color)',
      'var(--option-list-scrollbar-background-color)',
      'var(--option-list-scrollbar-width)'
    )
  }
}));
