import {
  CSSObject,
  ComponentOrCustomStatus,
  createStyles,
  NebularTheme
} from '@nebular-react/styles';
import { BadgePosition } from './types';

export interface BadgeStylesParams {
  position: BadgePosition;
  status: ComponentOrCustomStatus;
}

const getPositionStyles = (position: BadgePosition, theme: NebularTheme): CSSObject => {
  let positionStyles: CSSObject = {};

  if (position.includes('top')) {
    positionStyles = { ...positionStyles, top: 0 };
  }
  if (position.includes('right')) {
    positionStyles = { ...positionStyles, right: 0 };
  }
  if (position.includes('bottom')) {
    positionStyles = { ...positionStyles, bottom: 0 };
  }
  if (position.includes('left')) {
    positionStyles = { ...positionStyles, left: 0 };
  }
  if (position.includes('center')) {
    positionStyles = { ...positionStyles, top: '50%', transform: 'translateY(-50%)' };
  }
  if (position.includes('start')) {
    positionStyles = { ...positionStyles, ...theme.fns.ltr({ left: 0 }) };
    positionStyles = { ...positionStyles, ...theme.fns.rtl({ right: 0 }) };
  }
  if (position.includes('end')) {
    positionStyles = { ...positionStyles, ...theme.fns.ltr({ right: 0 }) };
    positionStyles = { ...positionStyles, ...theme.fns.rtl({ left: 0 }) };
  }

  return positionStyles;
};

export default createStyles((theme, { position, status }: BadgeStylesParams) => ({
  root: {
    borderRadius: 'var(--badge-border-radius)',
    fontFamily: 'var(--badge-text-font-family)',
    fontSize: 'var(--badge-text-font-size)',
    fontWeight: 'var(--badge-text-font-weight)' as any,
    lineHeight: 'var(--badge-text-line-height)',
    padding: 'var(--badge-padding)',

    color: `var(--badge-${status}-text-color)`,
    backgroundColor: `var(--badge-${status}-background-color)`,

    position: 'absolute',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    verticalAlign: 'baseline',

    ...getPositionStyles(position, theme)
  },

  dotMode: {
    borderRadius: 'var(--badge-dot-mode-border-radius)',
    padding: 'var(--badge-dot-mode-padding)'
  }
}));
