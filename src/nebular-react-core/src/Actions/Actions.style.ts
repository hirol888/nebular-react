import { ComponentSize, createStyles } from '@nebular-react/styles';

export interface ActionsStylesParams {
  size: ComponentSize;
}

export default createStyles((theme, { size }: ActionsStylesParams) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--actions-background-color)',

    '.nebular-action-wrapper': {
      height: `var(--actions-${size}-height)`,
      padding: `var(--actions-${size}-padding)`
    },

    '.nebular-action-root': {
      color: 'var(--actions-text-color)',
      fontFamily: 'var(--actions-text-font-family)',
      fontWeight: 'var(--actions-text-font-weight)' as any,
      lineHeight: 'var(--actions-text-line-height)',
      fontSize: `var(--actions-${size}-text-font-size)`,

      '.nebular-icon-root': {
        fontSize: `var(--actions-${size}-icon-height)`
      }
    }
  },

  fullWidth: {
    justifyContent: 'center',
    width: '100%',

    '.nebular-action-wrapper': {
      width: '100%',
      '.nebular-action-root': {
        width: '100%'
      }
    }
  }
}));
