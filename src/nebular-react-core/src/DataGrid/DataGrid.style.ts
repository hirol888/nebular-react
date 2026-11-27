import { createStyles } from '@nebular-react/styles';
import type { Property } from 'csstype';

export default createStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    minWidth: 0,
    width: '100%'
  },

  viewport: {
    overflow: 'auto',
    width: '100%',
    '&& > table > caption': {
      color: 'var(--table-caption-color, var(--text-basic-color, #222b45))'
    },
    '&& > table > thead th': {
      color: 'var(--table-header-text-color, var(--text-basic-color, #222b45))'
    }
  },

  resizableTable: {
    tableLayout: 'fixed'
  },

  headerCell: {
    position: 'relative'
  },

  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    minWidth: 0,
    paddingRight: '0.25rem'
  },

  reorderHandle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    padding: 0,
    border: 0,
    background: 'transparent',
    color: 'var(--datagrid-reorder-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'grab',
    fontSize: '0.875rem',
    lineHeight: 1,

    '&:active': {
      cursor: 'grabbing'
    },

    '&:focus-visible': {
      outline: '2px solid var(--datagrid-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px',
      borderRadius: '2px'
    }
  },

  resizeHandle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '0.5rem',
    cursor: 'col-resize',
    userSelect: 'none',
    touchAction: 'none',
    zIndex: 2,

    ...theme.fns.ltr({ right: 0 }),
    ...theme.fns.rtl({ left: 0 }),

    '&::after': {
      content: '""',
      position: 'absolute',
      top: '25%',
      bottom: '25%',
      width: '1px',
      backgroundColor: 'var(--datagrid-resize-color, var(--border-basic-color-3, #e4e9f2))'
    },

    '&:hover::after, &:focus-visible::after': {
      backgroundColor: 'var(--datagrid-resize-active-color, var(--color-primary-500, #3366ff))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--datagrid-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  virtualizedTable: {
    '& thead tr:first-child th': {
      position: 'sticky',
      top: 0,
      zIndex: 1,
      backgroundColor:
        'var(--datagrid-header-background-color, var(--background-basic-color-1, #ffffff))'
    }
  },

  sortButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: 0,
    border: 0,
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    textTransform: 'inherit',
    letterSpacing: 'inherit',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--datagrid-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px',
      borderRadius: '2px'
    }
  },

  sortIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    lineHeight: 1,
    opacity: 0.45
  },

  sortIconActive: {
    opacity: 1,
    color: 'var(--datagrid-sort-color, var(--color-primary-500, #3366ff))'
  },

  filterRow: {
    backgroundColor:
      'var(--datagrid-filter-row-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  filterInput: {
    width: '100%',
    minWidth: '5rem',
    padding: '0.25rem 0.5rem',
    border: '1px solid var(--datagrid-filter-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--datagrid-filter-border-radius, 0.25rem)',
    backgroundColor: 'var(--datagrid-filter-background-color, transparent)',
    color: 'inherit',
    font: 'inherit',
    textTransform: 'none',
    letterSpacing: 'normal',
    outline: 'none',

    '&::placeholder': {
      color: 'var(--datagrid-filter-placeholder-color, var(--text-hint-color, #8f9bb3))'
    },

    '&:focus': {
      borderColor: 'var(--datagrid-filter-focus-border-color, var(--color-primary-500, #3366ff))'
    }
  },

  filterRange: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    width: '100%'
  },

  filterRangeInput: {
    width: 'auto',
    minWidth: '4rem',
    flex: '1 1 0'
  },

  selectionCell: {
    width: '2.75rem',
    textAlign: 'center'
  },

  reorderCell: {
    width: '2.75rem',
    textAlign: 'center'
  },

  rowDragHandle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.75rem',
    padding: 0,
    border: 'none',
    borderRadius: 'var(--datagrid-row-drag-radius, 4px)',
    backgroundColor: 'transparent',
    color: 'var(--datagrid-row-drag-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'grab',
    '&:hover': {
      backgroundColor:
        'var(--datagrid-row-drag-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },
    '&:focus-visible': {
      outline: '2px solid var(--datagrid-focus-color, var(--color-primary-default, #3366ff))',
      outlineOffset: 1
    }
  },

  alignCenter: {
    textAlign: 'center'
  },

  alignRight: {
    textAlign: 'right'
  },

  spacerRow: {
    padding: 0,
    border: 0,
    lineHeight: 0
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
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },

  historyControls: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem'
  },

  batchControls: {
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },

  excelStatus: {
    color: 'var(--datagrid-toolbar-status-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.75rem',
    lineHeight: 1.4
  },

  viewControls: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },

  viewForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },

  viewSelect: {
    padding: '0.35rem 0.5rem',
    border: '1px solid var(--datagrid-toolbar-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--datagrid-toolbar-border-radius, 0.25rem)',
    backgroundColor:
      'var(--datagrid-toolbar-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--datagrid-toolbar-text-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    fontSize: '0.8125rem',
    lineHeight: 1.4,

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  viewInput: {
    padding: '0.35rem 0.5rem',
    border: '1px solid var(--datagrid-toolbar-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--datagrid-toolbar-border-radius, 0.25rem)',
    backgroundColor:
      'var(--datagrid-toolbar-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--datagrid-toolbar-text-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    fontSize: '0.8125rem',
    lineHeight: 1.4,
    outline: 'none',

    '&::placeholder': {
      color: 'var(--datagrid-toolbar-placeholder-color, var(--text-hint-color, #8f9bb3))'
    },

    '&:focus': {
      borderColor: 'var(--color-primary-500, #3366ff)'
    }
  },

  columnVisibility: {
    position: 'relative'
  },

  toolbarButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.35rem 0.65rem',
    border: '1px solid var(--datagrid-toolbar-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--datagrid-toolbar-border-radius, 0.25rem)',
    backgroundColor:
      'var(--datagrid-toolbar-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--datagrid-toolbar-text-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    fontSize: '0.8125rem',
    lineHeight: 1.4,
    cursor: 'pointer',
    listStyle: 'none',

    '&::-webkit-details-marker': {
      display: 'none'
    },

    '&:hover': {
      backgroundColor:
        'var(--datagrid-toolbar-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  columnPanel: {
    position: 'absolute',
    top: 'calc(100% + 0.35rem)',
    right: 0,
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    minWidth: '12rem',
    padding: '0.65rem',
    border: '1px solid var(--datagrid-toolbar-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--datagrid-toolbar-border-radius, 0.25rem)',
    backgroundColor:
      'var(--datagrid-toolbar-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--datagrid-toolbar-shadow, 0 8px 24px rgba(0, 0, 0, 0.18))'
  },

  expansionCell: {
    width: '2.5rem',
    textAlign: 'center'
  },

  expansionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.75rem',
    padding: 0,
    border: 0,
    borderRadius: '0.25rem',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  expansionRow: {
    backgroundColor:
      'var(--datagrid-expansion-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  pinnedCell: {
    backgroundColor:
      'var(--datagrid-pinned-background-color, var(--background-basic-color-1, #ffffff))'
  },

  pinnedHeader: {
    backgroundColor:
      'var(--datagrid-pinned-header-background-color, var(--datagrid-header-background-color, var(--background-basic-color-1, #ffffff)))'
  },

  pinnedLeftLast: {
    boxShadow: 'inset -6px 0 6px -6px rgba(0, 0, 0, 0.22)'
  },

  pinnedRightFirst: {
    boxShadow: 'inset 6px 0 6px -6px rgba(0, 0, 0, 0.22)'
  },

  groupHeaderCell: {
    textAlign: 'center',
    fontWeight: 600
  },

  summaryRow: {
    backgroundColor:
      'var(--datagrid-summary-background-color, var(--background-basic-color-2, #f7f9fc))',
    fontWeight: 'var(--datagrid-summary-font-weight, 600)' as unknown as Property.FontWeight
  },

  summaryCell: {
    borderTop: 'var(--datagrid-summary-border-top, 1px solid var(--border-basic-color-3, #e4e9f2))',
    fontVariantNumeric: 'tabular-nums'
  },

  groupSummaryRow: {
    backgroundColor:
      'var(--datagrid-group-summary-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  groupSummaryLabel: {
    color: 'var(--datagrid-group-summary-label-color, var(--text-hint-color, #8f9bb3))',
    fontStyle: 'italic'
  },

  groupRow: {
    backgroundColor:
      'var(--datagrid-group-background-color, var(--background-basic-color-3, #edf1f7))'
  },

  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontWeight: 600,
    color: 'var(--datagrid-group-text-color, var(--text-basic-color, #222b45))'
  },

  groupToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.5rem',
    height: '1.5rem',
    padding: 0,
    border: 0,
    borderRadius: '0.25rem',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  groupLabel: {
    minWidth: 0
  },

  groupCount: {
    marginLeft: 'auto',
    padding: '0.05rem 0.4rem',
    borderRadius: '999px',
    backgroundColor:
      'var(--datagrid-group-count-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--datagrid-group-count-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.7rem'
  },

  serverGroupCell: {
    verticalAlign: 'middle',
    fontVariantNumeric: 'tabular-nums'
  },

  groupAggregate: {
    display: 'inline-block',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--datagrid-group-aggregate-color, var(--text-basic-color, #222b45))'
  },

  treeCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    minWidth: 0
  },

  treeToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '1.5rem',
    height: '1.5rem',
    padding: 0,
    border: 0,
    borderRadius: '0.25rem',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  treeSpacer: {
    flex: '0 0 auto',
    width: '1.5rem',
    height: '1.5rem'
  },

  treeContent: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  autofitTable: {
    tableLayout: 'fixed',

    '& th, & td': {
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  },

  editingCell: {
    width: '2.5rem',
    textAlign: 'center'
  },

  editorRow: {
    backgroundColor:
      'var(--datagrid-editor-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  editorForm: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: '0.75rem',
    padding: '0.25rem 0'
  },

  editorField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    minWidth: '10rem',
    flex: '1 1 10rem'
  },

  cellEditButton: {
    display: 'block',
    width: '100%',
    padding: 0,
    border: 0,
    borderRadius: 'var(--datagrid-cell-edit-radius, 3px)',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'inherit',
    cursor: 'text',

    '&:hover': {
      backgroundColor:
        'var(--datagrid-cell-edit-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--datagrid-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: 1
    }
  },

  cellEditInput: {
    width: '100%',
    minWidth: 0,
    padding: '0.15rem 0.25rem',
    border: '1px solid var(--datagrid-cell-edit-border-color, var(--color-primary-500, #3366ff))',
    borderRadius: 'var(--datagrid-cell-edit-radius, 3px)',
    background: 'var(--datagrid-cell-edit-background-color, var(--background-basic-color-1, #fff))',
    color: 'inherit',
    font: 'inherit'
  },

  cellEditField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    minWidth: 0
  },

  cellEditInvalid: {
    borderColor: 'var(--datagrid-cell-edit-error-color, var(--color-danger-500, #ff3d71))'
  },

  cellEditError: {
    color: 'var(--datagrid-cell-edit-error-color, var(--color-danger-500, #ff3d71))',
    fontSize: '0.7rem',
    lineHeight: 1.2
  },

  editorLabel: {
    color: 'var(--datagrid-editor-label-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
    textTransform: 'uppercase'
  },

  editorActions: {
    display: 'flex',
    gap: '0.4rem',
    paddingBottom: '0.1rem'
  },

  virtualColumnSpacer: {
    padding: 0,
    border: 0,
    width: 0
  },

  batchPendingCell: {
    boxShadow: 'inset 0 -2px 0 var(--color-primary-500, #3366ff)'
  },

  rangeSelected: {
    backgroundColor:
      'var(--datagrid-range-selected-background-color, var(--color-primary-transparent-200, rgba(51, 102, 255, 0.16)))'
  },

  rangeFillCell: {
    position: 'relative'
  },

  rangeFillTarget: {
    backgroundColor:
      'var(--datagrid-range-fill-target-background-color, var(--color-primary-transparent-100, rgba(51, 102, 255, 0.08)))'
  },

  fillHandle: {
    position: 'absolute',
    bottom: '-0.3rem',
    width: '0.55rem',
    height: '0.55rem',
    padding: 0,
    border: '1px solid var(--datagrid-fill-handle-border-color, var(--color-primary-500, #3366ff))',
    borderRadius: '1px',
    backgroundColor:
      'var(--datagrid-fill-handle-background-color, var(--color-primary-500, #3366ff))',
    cursor: 'crosshair',
    touchAction: 'none',
    zIndex: 3,

    ...theme.fns.ltr({ right: '-0.3rem' }),
    ...theme.fns.rtl({ left: '-0.3rem' }),

    '&:focus-visible': {
      outline: '2px solid var(--datagrid-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: 1
    }
  },

  empty: {
    padding: '1.5rem',
    border: '1px solid var(--table-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--table-border-radius, 0.25rem)'
  },

  columnMenu: {
    position: 'relative',
    display: 'inline-flex',
    marginLeft: 'auto',
    flex: '0 0 auto'
  },

  columnMenuButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.5rem',
    height: '1.5rem',
    padding: 0,
    border: 0,
    borderRadius: 'var(--datagrid-column-menu-radius, 4px)',
    background: 'transparent',
    color: 'var(--datagrid-column-menu-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--datagrid-column-menu-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--datagrid-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: 1
    }
  },

  columnMenuDropdown: {
    position: 'fixed',
    zIndex: 20,
    pointerEvents: 'auto',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '10rem',
    maxWidth: 'calc(100vw - 0.5rem)',
    maxHeight: 'calc(100vh - 0.5rem)',
    overflow: 'auto',
    padding: '0.25rem',
    border: 'var(--datagrid-column-menu-border, 1px solid var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--datagrid-column-menu-border-radius, 6px)',
    backgroundColor:
      'var(--datagrid-column-menu-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)'
  },

  columnMenuItem: {
    display: 'block',
    width: '100%',
    padding: '0.375rem 0.5rem',
    border: 0,
    borderRadius: 'var(--datagrid-column-menu-item-radius, 4px)',
    backgroundColor: 'transparent',
    color: 'var(--datagrid-column-menu-item-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--datagrid-column-menu-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:disabled': {
      color: 'var(--datagrid-column-menu-item-disabled-color, var(--text-disabled-color, #c5cee0))',
      cursor: 'not-allowed'
    }
  },

  densityCompact: {
    '&& th, && td': {
      padding: 'var(--datagrid-cell-padding-compact, 0.35rem 0.5rem)'
    },

    '&& thead th': {
      fontSize: 'var(--datagrid-header-font-size-compact, 0.7rem)'
    }
  },

  densitySpacious: {
    '&& th, && td': {
      padding: 'var(--datagrid-cell-padding-spacious, 1rem 1.25rem)'
    }
  }
}));
