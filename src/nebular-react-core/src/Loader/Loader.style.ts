import {
  ComponentOrCustomStatus,
  ComponentSize,
  createStyles,
  keyframes
} from '@nebular-react/styles';

export interface LoaderStylesParams {
  status: ComponentOrCustomStatus;
  size: ComponentSize;
}

export default createStyles((theme, { status, size }: LoaderStylesParams) => {
  const spin = keyframes({
    '0%': {
      transform: 'rotate(0deg)'
    },

    '40%': {
      transform: 'rotate(230deg)'
    },

    '100%': {
      transform: 'rotate(360deg)'
    }
  });

  const dot = keyframes({
    '0%, 80%, 100%': { boxShadow: '0 2.5em 0 -1.3em' },
    '40%': { boxShadow: '0 2.5em 0 0' }
  });

  return {
    root: {
      opacity: 1,
      position: 'absolute',
      borderRadius: 'inherit',
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      overflow: 'hidden',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      visibility: 'visible',

      backgroundColor: `var(--loader-${status}-background-color)`,
      fontSize: `var(--loader-height-${size})`
    },

    spinCircle: {
      animation: `${spin} 0.8s infinite linear`,
      borderRadius: '50%',
      borderStyle: 'solid',
      borderWidth: '0.125em',
      width: '1em',
      height: '1em',

      borderTopColor: `var(--loader-${status}-circle-filled-color)`,
      borderRightColor: `var(--loader-${status}-circle-empty-color)`,
      borderBottomColor: `var(--loader-${status}-circle-filled-color)`,
      borderLeftColor: `var(--loader-${status}-circle-filled-color)`
    },

    message: {
      marginLeft: '0.5rem',

      color: 'var(--loader-text-color)',
      fontFamily: 'var(--loader-text-font-family)',
      fontSize: 'var(--loader-text-font-size)',
      fontWeight: 'var(--loader-text-font-weight)' as any,
      lineHeight: 'var(--loader-text-line-height)'
    },

    dot: {
      borderRadius: '50%',
      width: '1em',
      height: '1em',
      // animationFillMode: 'both',
      animation: `${dot} 1.8s infinite ease-in-out`,

      backgroundColor: '#FFF',
      fontSize: '7px',
      textIndent: '-9999em',
      transform: 'translateZ(0)',
      animationDelay: '-0.16s',

      '&::before, &::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        borderRadius: '50%',
        width: '1em',
        height: '1em',
        // animationFillMode: 'both',
        animation: `${dot} 1.8s infinite ease-in-out`
      },

      '&::before': {
        left: '-1.5em',
        animationDelay: '-0.32s'
      },

      '&::after': {
        left: '1.5em'
      }
    }
  };
});
