import { ComponentOrCustomStatus, createStyles } from '@nebular-react/styles';

export interface TooltipStylesParams {
  status: ComponentOrCustomStatus;
}

export default createStyles((theme, { status }: TooltipStylesParams) => {
  const leftCss = {
    ...theme.fns.ltr({ right: '-8.4px', transform: 'rotate(90deg)' }),
    ...theme.fns.rtl({ left: '-8.4px', transform: 'rotate(270deg)' }),
    top: 'calc(50% - 6px / 2.5)'
  };

  const rightCss = {
    ...theme.fns.ltr({ left: '-8.4px', transform: 'rotate(270deg)' }),
    ...theme.fns.rtl({ right: '-8.4px', transform: 'rotate(90deg)' }),
    top: 'calc(50% - 6px / 2.5)'
  };

  return {
    root: {
      boxShadow: 'var(--tooltip-shadow)',

      borderWidth: 'var(--tooltip-border-width)',
      borderStyle: 'var(--tooltip-border-style)',
      borderRadius: 'var(--tooltip-border-radius)',
      padding: 'var(--tooltip-padding)',
      maxWidth: 'var(--tooltip-max-width)',

      '.nebular-icon-root:only-child': {
        height: 'var(--tooltip-icon-height)',
        width: 'var(--tooltip-icon-width)'
      },

      '.nebular-icon-root:not(:only-child)': {
        height: 'var(--tooltip-text-font-size)',
        width: 'var(--tooltip-text-font-size)'
      },

      backgroundColor:
        status !== ''
          ? `var(--tooltip-${status}-background-color)`
          : 'var(--tooltip-background-color)',
      borderColor:
        status !== '' ? `var(--tooltip-${status}-border-color)` : 'var(--tooltip-border-color)',

      zIndex: 10000,

      '.nebular-icon-root + span': {
        marginLeft: '0.5rem'
      }
    },

    content: {
      color: status !== '' ? `var(--tooltip-${status}-text-color)` : 'var(--tooltip-text-color)',
      fontFamily: 'var(--tooltip-text-font-family)',
      fontSize: 'var(--tooltip-text-font-size)',
      fontWeight: 'var(--tooltip-text-font-weight)' as any,
      lineHeight: 'var(--tooltip-text-line-height)',

      display: 'flex',
      alignItems: 'center'
    },

    arrow: {
      borderBottomWidth: '6px',
      borderBottomStyle: 'var(--tooltip-border-style)' as any,
      borderBottomColor:
        status !== ''
          ? `var(--tooltip-${status}-background-color)`
          : 'var(--tooltip-background-color)',

      position: 'absolute',
      width: 0,
      height: 0,

      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent'
    },

    right: {
      flexDirection: 'row-reverse',

      '.nebular-icon-root + span': {
        marginRight: '0.5rem'
      },

      ...rightCss
    },

    bottom: {
      top: '-6px',
      left: 'calc(50% - 6px)'
    },

    bottomStart: {
      top: '-6px',
      ...theme.fns.ltr({ right: '6px' }),
      ...theme.fns.rtl({ left: '6px' })
    },

    bottomEnd: {
      top: '-6px',
      ...theme.fns.ltr({ left: '6px' }),
      ...theme.fns.rtl({ right: '6px' })
    },

    left: {
      ...leftCss
    },

    start: {
      ...leftCss
    },

    startTop: {
      right: '-8.4px',
      bottom: '6px',
      transform: 'rotate(90deg)'
    },

    startBottom: {
      right: '-8.4px',
      top: '6px',
      transform: 'rotate(90deg)'
    },

    top: {
      bottom: '-6px',
      left: 'calc(50% - 6px)',
      transform: 'rotate(180deg)'
    },

    topStart: {
      bottom: 'calc(-1 * 6px + 1px)',
      ...theme.fns.ltr({ right: '6px' }),
      ...theme.fns.rtl({ left: '6px' }),
      transform: 'rotate(180deg)'
    },

    topEnd: {
      bottom: '5px',
      ...theme.fns.ltr({ left: '6px' }),
      ...theme.fns.rtl({ right: '6px' }),
      transform: 'rotate(180deg)'
    },

    end: {
      ...rightCss
    },

    endTop: {
      left: 'calc(-6px - 6px / 2.5)',
      bottom: '6px',
      transform: 'rotate(270deg)'
    },

    endBottom: {
      left: 'calc(-6px - 6px / 2.5)',
      top: '6px',
      transform: 'rotate(270deg)'
    }
  };
});
