import { Selectors, createStyles } from '@nebular-react/styles';

export const useStyles = createStyles((_theme) => ({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    minHeight: '18rem',
    overflow: 'hidden',
    color: 'var(--file-explorer-color, var(--text-basic-color, #222b45))',
    backgroundColor:
      'var(--file-explorer-background-color, var(--background-basic-color-1, #ffffff))',
    fontFamily: 'var(--file-explorer-font-family, inherit)'
  },

  body: {
    display: 'flex',
    flex: '1 1 auto',
    minHeight: 0
  },

  sidebar: {
    flex: '0 0 auto',
    width: 'var(--file-explorer-sidebar-width, 14rem)',
    minWidth: 0,
    overflow: 'auto',
    padding: '0.5rem',
    borderInlineEnd:
      '1px solid var(--file-explorer-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--file-explorer-sidebar-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  main: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: 0
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.35rem',
    flex: '0 0 auto',
    minHeight: '2.75rem',
    padding: '0.35rem 0.5rem',
    borderBottom:
      '1px solid var(--file-explorer-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--file-explorer-toolbar-background-color, var(--background-basic-color-1, #ffffff))'
  },

  tabBar: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '0.15rem',
    flex: '0 0 auto',
    minHeight: '2.15rem',
    padding: '0.25rem 0.35rem 0',
    overflowX: 'auto',
    borderBottom:
      '1px solid var(--file-explorer-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--file-explorer-tabbar-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  tab: {
    display: 'inline-flex',
    alignItems: 'stretch',
    flex: '0 0 auto',
    maxWidth: '13rem',
    border: '1px solid transparent',
    borderBottom: 0,
    borderRadius: 'var(--file-explorer-radius, 0.35rem) var(--file-explorer-radius, 0.35rem) 0 0',
    backgroundColor: 'transparent'
  },

  tabButton: {
    minWidth: '5rem',
    maxWidth: '11rem',
    overflow: 'hidden',
    padding: '0.25rem 0.45rem',
    border: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.78rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'start',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-2px'
    }
  },

  tabButtonActive: {
    backgroundColor:
      'var(--file-explorer-tab-active-background-color, var(--background-basic-color-1, #ffffff))',
    fontWeight: 600
  },

  tabClose: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.3rem',
    padding: 0,
    border: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',

    '&:hover:not(:disabled)': {
      color: 'var(--color-danger-500, #ff3d71)'
    },

    '&:disabled': {
      opacity: 0.3,
      cursor: 'default'
    }
  },

  tabNew: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.7rem',
    marginBottom: '0.2rem',
    border: 0,
    borderRadius: 'var(--file-explorer-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '1rem',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: 'var(--file-explorer-hover-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  navGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    flex: '0 0 auto'
  },

  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.9rem',
    height: '1.9rem',
    padding: 0,
    border: 0,
    borderRadius: 'var(--file-explorer-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',

    '&:hover:not(:disabled)': {
      backgroundColor: 'var(--file-explorer-hover-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    },

    '&:disabled': {
      opacity: 0.45,
      cursor: 'default'
    }
  },

  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.1rem',
    flex: '1 1 12rem',
    minWidth: 0,
    overflow: 'hidden'
  },

  breadcrumbButton: {
    maxWidth: '12rem',
    overflow: 'hidden',
    padding: '0.2rem 0.35rem',
    border: 0,
    borderRadius: 'var(--file-explorer-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: 'var(--file-explorer-hover-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  breadcrumbCurrent: {
    fontWeight: 600
  },

  breadcrumbSeparator: {
    flex: '0 0 auto',
    color: 'var(--text-hint-color, #8f9bb3)',
    fontSize: '0.75rem'
  },

  search: {
    flex: '0 1 12rem',
    minWidth: '7rem',
    minHeight: '1.9rem',
    padding: '0.25rem 0.5rem',
    border: '1px solid var(--file-explorer-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-explorer-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  spacer: {
    flex: '1 1 auto'
  },

  viewGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.1rem',
    flex: '0 0 auto'
  },

  viewButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '1.8rem',
    height: '1.9rem',
    padding: '0 0.35rem',
    border: 0,
    borderRadius: 'var(--file-explorer-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.75rem',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: 'var(--file-explorer-hover-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  viewButtonActive: {
    backgroundColor:
      'var(--file-explorer-active-background-color, var(--background-basic-color-2, #f7f9fc))',
    fontWeight: 600
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    flex: '0 0 auto'
  },

  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    minHeight: '1.9rem',
    padding: '0 0.5rem',
    border: 0,
    borderRadius: 'var(--file-explorer-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.78rem',
    cursor: 'pointer',

    '&:hover:not(:disabled)': {
      backgroundColor: 'var(--file-explorer-hover-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    },

    '&:disabled': {
      opacity: 0.45,
      cursor: 'default'
    }
  },

  danger: {
    color: 'var(--color-danger-500, #ff3d71)'
  },

  content: {
    position: 'relative',
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'auto',
    outline: 'none',

    '&:focus-visible': {
      boxShadow: 'inset 0 0 0 2px var(--color-primary-500, #3366ff)'
    }
  },

  dropOverlay: {
    position: 'absolute',
    inset: '0.5rem',
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed var(--color-primary-500, #3366ff)',
    borderRadius: 'var(--file-explorer-radius, 0.45rem)',
    backgroundColor: 'var(--file-explorer-drop-background, rgba(51, 102, 255, 0.08))',
    color: 'var(--color-primary-500, #3366ff)',
    fontSize: '0.875rem',
    fontWeight: 600,
    pointerEvents: 'none'
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.25rem'
  },

  row: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 6rem 9rem',
    alignItems: 'center',
    gap: '0.5rem',
    minHeight: '2.1rem',
    padding: '0.2rem 0.5rem',
    border: 0,
    borderRadius: 'var(--file-explorer-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',
    textAlign: 'start',
    cursor: 'pointer',
    userSelect: 'none',

    '&:hover': {
      backgroundColor: 'var(--file-explorer-hover-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-1px'
    }
  },

  rowSelected: {
    backgroundColor: 'var(--file-explorer-selected-background-color, rgba(51, 102, 255, 0.12))'
  },

  rowDropTarget: {
    outline: '2px dashed var(--color-primary-500, #3366ff)',
    outlineOffset: '-2px',
    backgroundColor: 'var(--file-explorer-drop-background, rgba(51, 102, 255, 0.08))'
  },

  rowName: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    minWidth: 0
  },

  entryName: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  entryMeta: {
    minWidth: 0,
    overflow: 'hidden',
    color: 'var(--text-hint-color, #8f9bb3)',
    fontSize: '0.75rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  entryIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '1.15rem',
    height: '1.15rem',
    color: 'var(--file-explorer-icon-color, var(--text-hint-color, #8f9bb3))'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))',
    gap: '0.35rem',
    padding: '0.5rem'
  },

  tile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.35rem',
    minHeight: '6.5rem',
    padding: '0.6rem 0.35rem',
    border: '1px solid transparent',
    borderRadius: 'var(--file-explorer-radius, 0.45rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.78rem',
    cursor: 'pointer',
    textAlign: 'center',

    '&:hover': {
      backgroundColor: 'var(--file-explorer-hover-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-1px'
    }
  },

  tileSelected: {
    borderColor: 'var(--color-primary-500, #3366ff)',
    backgroundColor: 'var(--file-explorer-selected-background-color, rgba(51, 102, 255, 0.12))'
  },

  tileDropTarget: {
    borderColor: 'var(--color-primary-500, #3366ff)',
    borderStyle: 'dashed',
    backgroundColor: 'var(--file-explorer-drop-background, rgba(51, 102, 255, 0.08))'
  },

  tileIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    color: 'var(--file-explorer-icon-color, var(--text-hint-color, #8f9bb3))'
  },

  tileName: {
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  details: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8125rem'
  },

  detailsHead: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor:
      'var(--file-explorer-header-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  detailsHeader: {
    padding: '0.45rem 0.6rem',
    borderBottom:
      '1px solid var(--file-explorer-border-color, var(--border-basic-color-3, #e4e9f2))',
    color: 'var(--text-hint-color, #8f9bb3)',
    fontSize: '0.72rem',
    fontWeight: 700,
    textAlign: 'start',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none'
  },

  detailsCell: {
    maxWidth: '20rem',
    padding: '0.4rem 0.6rem',
    borderBottom:
      '1px solid var(--file-explorer-border-color, var(--border-basic-color-3, #e4e9f2))',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  detailsRow: {
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: 'var(--file-explorer-hover-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-2px'
    }
  },

  detailsSelected: {
    backgroundColor: 'var(--file-explorer-selected-background-color, rgba(51, 102, 255, 0.12))'
  },

  createBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.5rem',
    borderBottom:
      '1px solid var(--file-explorer-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--file-explorer-toolbar-background-color, var(--background-basic-color-1, #ffffff))'
  },

  input: {
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: '1.9rem',
    padding: '0.25rem 0.5rem',
    border: '1px solid var(--file-explorer-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-explorer-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  renameInput: {
    width: '100%',
    minWidth: 0,
    padding: '0.1rem 0.3rem',
    border: '1px solid var(--color-primary-500, #3366ff)',
    borderRadius: 'var(--file-explorer-radius, 0.25rem)',
    backgroundColor:
      'var(--file-explorer-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem'
  },

  selectionBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.3rem 0.5rem',
    borderBottom:
      '1px solid var(--file-explorer-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor: 'var(--file-explorer-selection-background-color, rgba(51, 102, 255, 0.08))',
    fontSize: '0.78rem'
  },

  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '10rem',
    padding: '1rem',
    color: 'var(--text-hint-color, #8f9bb3)',
    fontSize: '0.85rem',
    textAlign: 'center'
  },

  error: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    minHeight: '10rem',
    padding: '1rem',
    color: 'var(--color-danger-500, #ff3d71)',
    fontSize: '0.85rem',
    textAlign: 'center'
  },

  preview: {
    flex: '0 0 auto',
    width: 'var(--file-explorer-preview-width, 18rem)',
    minWidth: 0,
    overflow: 'auto',
    padding: '0.5rem',
    borderInlineStart:
      '1px solid var(--file-explorer-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--file-explorer-preview-background-color, var(--background-basic-color-1, #ffffff))'
  },

  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.35rem',
    marginBottom: '0.5rem',
    fontSize: '0.8rem',
    fontWeight: 600
  },

  previewImage: {
    maxWidth: '100%',
    maxHeight: '18rem',
    objectFit: 'contain',
    borderRadius: 'var(--file-explorer-radius, 0.35rem)'
  },

  previewText: {
    margin: 0,
    maxHeight: '20rem',
    overflow: 'auto',
    padding: '0.5rem',
    borderRadius: 'var(--file-explorer-radius, 0.35rem)',
    backgroundColor:
      'var(--file-explorer-preview-code-background, var(--background-basic-color-2, #f7f9fc))',
    fontSize: '0.72rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },

  uploadBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.35rem 0.5rem',
    borderTop: '1px solid var(--file-explorer-border-color, var(--border-basic-color-3, #e4e9f2))',
    fontSize: '0.75rem'
  },

  uploadTrack: {
    flex: '1 1 auto',
    height: '0.35rem',
    overflow: 'hidden',
    borderRadius: '999px',
    backgroundColor: 'var(--background-basic-color-3, #edf1f7)'
  },

  uploadFill: {
    height: '100%',
    backgroundColor: 'var(--color-primary-500, #3366ff)',
    transition: 'width 120ms linear'
  },

  menu: {
    position: 'absolute',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    minWidth: '10rem',
    padding: '0.3rem',
    border: '1px solid var(--file-explorer-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-explorer-radius, 0.45rem)',
    backgroundColor:
      'var(--file-explorer-menu-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--file-explorer-menu-shadow, 0 8px 24px rgba(0, 0, 0, 0.16))'
  },

  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    width: '100%',
    padding: '0.4rem 0.5rem',
    border: 0,
    borderRadius: 'var(--file-explorer-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8rem',
    textAlign: 'start',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: 'var(--file-explorer-hover-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-1px'
    }
  },

  menuSeparator: {
    height: 1,
    margin: '0.2rem 0.3rem',
    backgroundColor: 'var(--file-explorer-border-color, var(--border-basic-color-3, #e4e9f2))'
  },

  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
  }
}));

export type FileExplorerStylesNames = Selectors<typeof useStyles>;
