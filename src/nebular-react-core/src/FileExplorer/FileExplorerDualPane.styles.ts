import { Selectors, createStyles } from '@nebular-react/styles';

export const useStyles = createStyles((_theme) => ({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: '18rem',
    overflow: 'hidden'
  },

  rootStacked: {
    flexDirection: 'column'
  },

  pane: {
    display: 'flex',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden'
  },

  panePrimary: {
    flex: '0 0 auto'
  },

  paneSecondary: {
    flex: '1 1 0%'
  },

  separator: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: 'var(--file-explorer-dual-pane-separator-size, 0.5rem)',
    padding: 0,
    border: 0,
    backgroundColor:
      'var(--file-explorer-dual-pane-separator-color, var(--border-basic-color-3, #e4e9f2))',
    cursor: 'col-resize',
    touchAction: 'none',
    transition: 'background-color 0.15s ease',

    '&:hover': {
      backgroundColor:
        'var(--file-explorer-dual-pane-separator-hover-color, var(--color-primary-500, #3366ff))'
    },

    '&:focus-visible': {
      outline:
        '2px solid var(--file-explorer-dual-pane-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  separatorStacked: {
    width: 'auto',
    height: 'var(--file-explorer-dual-pane-separator-size, 0.5rem)',
    cursor: 'row-resize'
  },

  separatorDragging: {
    backgroundColor:
      'var(--file-explorer-dual-pane-separator-hover-color, var(--color-primary-500, #3366ff))'
  },

  grip: {
    width: 2,
    height: 'var(--file-explorer-dual-pane-grip-length, 1.5rem)',
    borderRadius: '999px',
    backgroundColor: 'var(--file-explorer-dual-pane-grip-color, var(--text-hint-color, #8f9bb3))',
    pointerEvents: 'none'
  },

  gripStacked: {
    width: 'var(--file-explorer-dual-pane-grip-length, 1.5rem)',
    height: 2
  }
}));

export type FileExplorerDualPaneStylesNames = Selectors<typeof useStyles>;
