import { createStyles } from '@nebular-react/styles';
import { Property } from 'csstype';

export interface PopoverStylesParams {
  padding?: Property.Padding;
}

export default createStyles((theme, { padding }: PopoverStylesParams) => ({
  root: {
    border: 'var(--popover-border-width) solid var(--popover-border-color)',
    borderRadius: 'var(--popover-border-radius)',
    backgroundColor: 'var(--popover-background-color)',
    boxShadow: 'var(--popover-shadow)',
    color: 'var(--popover-text-color)'
  },

  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,

    borderLeft: 'var(--popover-arrow-size) solid transparent',
    borderRight: 'var(--popover-arrow-size) solid transparent',
    borderBottom: 'var(--popover-arrow-size) solid var(--popover-border-color)',

    '&::after': {
      position: 'absolute',
      content: '" "',
      width: 0,
      height: 0,
      top: '3px',
      left: 'calc(50% - var(--popover-arrow-size))',
      borderLeft: 'var(--popover-arrow-size) solid transparent',
      borderRight: 'var(--popover-arrow-size) solid transparent',
      borderBottom: 'var(--popover-arrow-size) solid var(--popover-background-color)',
      clipPath: 'inset(0 0 2px)'
    }
  },

  textContainer: {
    fontFamily: 'var(--popover-text-font-family)',
    fontSize: 'var(--popover-text-font-size)',
    fontWeight: 'var(--popover-text-font-weight)' as any,
    lineHeight: 'var(--popover-text-line-height)',
    padding: padding || 'var(--popover-padding)'
  },

  overlayBottom: {
    top: 'calc(-1 * var(--popover-arrow-size) + 1px)',
    left: 'calc(50% - var(--popover-arrow-size))'
  },

  overlayBottomStart: {
    top: 'calc(-1 * var(--popover-arrow-size) + 1px)',
    ...theme.fns.ltr({ right: 'var(--popover-arrow-size)' }),
    ...theme.fns.rtl({ left: 'var(--popover-arrow-size)' })
  },

  overlayBottomEnd: {
    top: 'calc(-1 * var(--popover-arrow-size) + 1px)',
    ...theme.fns.ltr({ left: 'var(--popover-arrow-size)' }),
    ...theme.fns.rtl({ right: 'var(--popover-arrow-size)' })
  },

  overlayLeft: {
    right: 'calc(-1 * var(--popover-arrow-size) - var(--popover-arrow-size) / 2 + 2px)',
    top: 'calc(50% - var(--popover-arrow-size) * 0.5)',
    transform: 'rotate(90deg)'
  },

  overlayStartTop: {
    right: 'calc(-1 * var(--popover-arrow-size) - var(--popover-arrow-size) / 2 + 2px)',
    bottom: 'var(--popover-arrow-size)',
    transform: 'rotate(90deg)'
  },

  overlayStartBottom: {
    right: 'calc(-1 * var(--popover-arrow-size) - var(--popover-arrow-size) / 2 + 2px)',
    top: 'var(--popover-arrow-size)',
    transform: 'rotate(90deg)'
  },

  overlayTop: {
    bottom: 'calc(-1 * var(--popover-arrow-size) + 1px)',
    left: 'calc(50% - var(--popover-arrow-size))',
    transform: 'rotate(180deg)'
  },

  overlayTopStart: {
    bottom: 'calc(-1 *  var(--popover-arrow-size) + 1px)',
    ...theme.fns.ltr({ right: 'var(--popover-arrow-size)' }),
    ...theme.fns.rtl({ left: 'var(--popover-arrow-size)' }),
    transform: 'rotate(180deg)'
  },

  overlayTopEnd: {
    bottom: 'calc(-1 *  var(--popover-arrow-size) + 1px)',
    ...theme.fns.ltr({ left: 'var(--popover-arrow-size)' }),
    ...theme.fns.rtl({ right: 'var(--popover-arrow-size)' }),
    transform: 'rotate(180deg)'
  },

  overlayRight: {
    left: 'calc(-1 * var(--popover-arrow-size) - var(--popover-arrow-size) / 2 + 2px)',
    top: 'calc(50% - var(--popover-arrow-size) * 0.5)',
    transform: 'rotate(270deg)'
  },

  overlayEndTop: {
    left: 'calc(-1 * var(--popover-arrow-size) - var(--popover-arrow-size) / 2 + 2px)',
    bottom: 'var(--popover-arrow-size)',
    transform: 'rotate(270deg)'
  },

  overlayEndBottom: {
    left: 'calc(-1 * var(--popover-arrow-size) - var(--popover-arrow-size) / 2 + 2px)',
    top: 'var(--popover-arrow-size)',
    transform: 'rotate(270deg)'
  }
}));
