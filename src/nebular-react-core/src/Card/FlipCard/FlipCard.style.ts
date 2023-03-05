import { createStyles } from '@nebular-react/styles';

export default createStyles((theme) => ({
  root: {
    display: 'block',
    perspective: '1200px',
    position: 'relative'
  },

  flipped: {
    '.nebular-flipcard-flipcardBody': {
      transform: 'rotateY(-180deg)',

      '.nebular-flipcard-frontContainer': {
        opacity: 0,
        transition: 'opacity 0s 0.25s',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',

        '.nebular-flipcard-flipButton': {
          opacity: 0,
          zIndex: -1
        }
      },

      '.nebular-flipcard-backContainer': {
        backfaceVisibility: 'visible',
        WebkitBackfaceVisibility: 'visible'
      }
    }
  },

  flipcardBody: {
    display: 'flex',
    transition: 'transform 0.5s',
    transformStyle: 'preserve-3d',

    '.nebular-flipcard-frontContainer, .nebular-flipcard-backContainer': {
      flex: 1
    }
  },

  frontContainer: {
    backfaceVisibility: 'visible',
    WebkitBackfaceVisibility: 'visible',
    transition: 'opacity 0s 0.2s',

    ...theme.fns.ltr({ marginRight: '-100%' }),
    ...theme.fns.rtl({ marginLeft: '-100%' })
  },

  backContainer: {
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)'
  },

  flipButton: {
    cursor: 'pointer',
    position: 'absolute',
    right: 0,
    bottom: 0,
    opacity: 1,
    transition: 'opacity 0s 0.15s',

    lineHeight: 'var(--card-text-line-height)',
    marginBottom: 'var(--card-margin-bottom)',
    padding: 'var(--card-padding)'
  }
}));
