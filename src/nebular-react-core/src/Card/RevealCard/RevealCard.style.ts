import { createStyles, CSSObject } from '@nebular-react/styles';

export default createStyles(() => {
  const cardStyles: CSSObject = {
    boxShadow: 'none',
    margin: 0
  };

  return {
    root: {
      display: 'block',
      position: 'relative',
      overflow: 'hidden',

      boxShadow: 'var(--card-shadow)',
      marginBottom: 'var(--card-margin-bottom)'
    },

    secondContainer: {
      position: 'absolute',
      top: '100%',
      right: 0,
      left: 0,
      overflow: 'hidden',
      transition: 'top 0s 0.5s',

      height: '100%',
      borderRadius: 'var(--card-border-radius)'
    },

    cardFront: {
      '&.nebular-card-root': {
        ...cardStyles
      },

      display: 'block'
    },

    cardBack: {
      '.nebular-card-root': {
        ...cardStyles
      },

      position: 'absolute',
      left: 0,
      top: '100%',
      width: '100%',
      transition: 'top 0.5s'
    },

    revealButton: {
      cursor: 'pointer',
      position: 'absolute',
      right: 0,
      bottom: 0,
      transform: 'rotate(180deg)',
      transition: 'transform 0.3s',

      lineHeight: 'var(--card-text-line-height)',
      padding: 'var(--card-padding)'
    },

    revealed: {
      '.nebular-revealcard-secondContainer': {
        top: 0,
        transition: 'none',

        '.nebular-revealcard-cardBack': {
          top: 0
        }
      },

      '.nebular-revealcard-revealButton': {
        transform: 'none'
      }
    }
  };
});
