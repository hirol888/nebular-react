import { Selectors, createStyles, keyframes } from '@nebular-react/styles';

const windowIn = keyframes({
  from: { opacity: 0, transform: 'translateY(4px) scale(0.985)' },
  to: { opacity: 1, transform: 'translateY(0) scale(1)' }
});

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 }
});

const menuIn = keyframes({
  from: { opacity: 0, transform: 'translateY(-2px)' },
  to: { opacity: 1, transform: 'translateY(0)' }
});

export const useStyles = createStyles((_theme) => ({
  root: {
    position: 'relative',
    display: 'grid',
    width: '100%',
    height: '100%',
    minHeight: '20rem',
    overflow: 'hidden',
    color: 'var(--desktop-text-color, var(--text-basic-color, #222b45))',
    backgroundColor: 'var(--desktop-background-color, #edf1f7)',
    fontFamily: 'var(--desktop-text-font-family, inherit)'
  },

  fullscreen: {
    position: 'fixed',
    inset: 0,
    zIndex: 'var(--desktop-z-index, 1000)' as unknown as number
  },

  taskbarBottom: {
    gridTemplateRows: 'minmax(0, 1fr) var(--desktop-taskbar-size, 2.75rem)',
    gridTemplateAreas: '"desktop" "taskbar"'
  },

  taskbarTop: {
    gridTemplateRows: 'var(--desktop-taskbar-size, 2.75rem) minmax(0, 1fr)',
    gridTemplateAreas: '"taskbar" "desktop"'
  },

  taskbarLeft: {
    gridTemplateColumns: 'var(--desktop-taskbar-size, 2.75rem) minmax(0, 1fr)',
    gridTemplateAreas: '"taskbar desktop"'
  },

  taskbarRight: {
    gridTemplateColumns: 'minmax(0, 1fr) var(--desktop-taskbar-size, 2.75rem)',
    gridTemplateAreas: '"desktop taskbar"'
  },

  desktop: {
    position: 'relative',
    gridArea: 'desktop',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    backgroundColor: 'var(--desktop-wallpaper, #edf1f7)',
    backgroundImage: 'var(--desktop-wallpaper-image, none)',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  },

  taskbar: {
    position: 'relative',
    zIndex: 1500000000,
    gridArea: 'taskbar',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    minWidth: 0,
    minHeight: 0,
    padding: '0.25rem',
    backgroundColor: 'var(--desktop-taskbar-background-color, rgba(255, 255, 255, 0.94))',
    border: '1px solid var(--desktop-taskbar-border-color, var(--border-basic-color-3, #e4e9f2))',
    backdropFilter: 'var(--desktop-taskbar-backdrop-filter, blur(8px))'
  },

  taskbarVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start'
  },

  taskbarItems: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: 0,
    overflowX: 'auto',
    overflowY: 'hidden'
  },

  taskbarItemsVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
    overflowX: 'hidden',
    overflowY: 'auto'
  },

  taskbarStart: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    gap: '0.35rem',
    minHeight: '2rem',
    padding: '0.25rem 0.55rem',
    border: 0,
    borderRadius: 'var(--desktop-taskbar-item-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--desktop-taskbar-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  taskbarItem: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '0.4rem',
    flex: '0 1 auto',
    maxWidth: '12rem',
    minWidth: '2rem',
    minHeight: '2rem',
    padding: '0.25rem 0.55rem',
    border: 0,
    borderBottom: '2px solid transparent',
    borderRadius: 'var(--desktop-taskbar-item-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',

    '&:hover': {
      backgroundColor:
        'var(--desktop-taskbar-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  taskbarItemActive: {
    backgroundColor:
      'var(--desktop-taskbar-item-active-background-color, var(--background-basic-color-2, #f7f9fc))',
    borderBottomColor:
      'var(--desktop-taskbar-item-active-border-color, var(--color-primary-500, #3366ff))'
  },

  taskbarItemMinimized: {
    opacity: 0.65
  },

  taskbarIcon: {
    display: 'inline-flex',
    flex: '0 0 auto',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.1rem',
    height: '1.1rem'
  },

  taskbarLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  taskbarSpacer: {
    flex: '1 1 auto',
    minWidth: '0.25rem'
  },

  taskbarMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    flex: '0 0 auto',
    minWidth: 0
  },

  taskbarMetaVertical: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    gap: '0.2rem'
  },

  clock: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: '0 0 auto',
    padding: '0 0.35rem',
    font: 'inherit',
    fontSize: '0.75rem',
    lineHeight: 1.15,
    color: 'var(--desktop-clock-color, var(--text-hint-color, #8f9bb3))'
  },

  clockVertical: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    textAlign: 'center'
  },

  clockTime: {
    color: 'var(--desktop-clock-time-color, var(--text-basic-color, #222b45))',
    fontSize: '0.8125rem',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums'
  },

  tray: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flex: '0 0 auto'
  },

  trayVertical: {
    flexDirection: 'column',
    alignItems: 'center'
  },

  startMenu: {
    position: 'absolute',
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    width: 'var(--desktop-start-menu-width, 16rem)',
    maxHeight: 'min(28rem, 70vh)',
    overflowY: 'auto',
    padding: '0.35rem',
    border:
      '1px solid var(--desktop-start-menu-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-start-menu-radius, 0.5rem)',
    backgroundColor:
      'var(--desktop-start-menu-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--desktop-start-menu-shadow, 0 12px 32px rgba(0, 0, 0, 0.18))',
    animation: `${menuIn} var(--desktop-animation-duration, 110ms) ease-out`,

    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none'
    }
  },

  startMenuBottom: {
    insetInlineStart: 0,
    bottom: 'calc(100% + 0.25rem)'
  },

  startMenuTop: {
    insetInlineStart: 0,
    top: 'calc(100% + 0.25rem)'
  },

  startMenuLeft: {
    left: 'calc(100% + 0.25rem)',
    top: 0
  },

  startMenuRight: {
    right: 'calc(100% + 0.25rem)',
    top: 0
  },

  startMenuTitle: {
    padding: '0.35rem 0.5rem',
    color: 'var(--desktop-start-menu-title-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textAlign: 'start',
    textTransform: 'uppercase'
  },

  startMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem 0.6rem',
    border: 0,
    borderRadius: 'var(--desktop-start-menu-item-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',
    textAlign: 'start',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--desktop-start-menu-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-1px'
    }
  },

  startMenuLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  startMenuEmpty: {
    padding: '0.75rem 0.5rem',
    color: 'var(--desktop-start-menu-empty-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.8125rem',
    textAlign: 'center'
  },

  window: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 'var(--desktop-window-min-width, 15rem)',
    minHeight: 'var(--desktop-window-min-height, 9rem)',
    overflow: 'hidden',
    border: '1px solid var(--desktop-window-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-window-radius, 0.45rem)',
    backgroundColor:
      'var(--desktop-window-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--desktop-window-shadow, 0 10px 30px rgba(0, 0, 0, 0.22))',
    outline: 'none',
    animation: `${windowIn} var(--desktop-animation-duration, 140ms) ease-out`,

    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none'
    }
  },

  windowMaximized: {
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    borderRadius: 0,
    border: 0
  },

  windowInactive: {
    boxShadow: 'var(--desktop-window-inactive-shadow, 0 6px 18px rgba(0, 0, 0, 0.14))'
  },

  windowBlocked: {
    filter: 'saturate(0.7)'
  },

  titleBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    flex: '0 0 auto',
    minHeight: '2.1rem',
    paddingBlock: '0.2rem',
    paddingInlineStart: '0.6rem',
    paddingInlineEnd: '0.25rem',
    borderBottom:
      '1px solid var(--desktop-window-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--desktop-window-titlebar-background-color, var(--background-basic-color-2, #f7f9fc))',
    cursor: 'grab',
    userSelect: 'none',
    touchAction: 'none',

    '&:active': {
      cursor: 'grabbing'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-2px'
    }
  },

  titleBarStatic: {
    cursor: 'default'
  },

  titleBarInactive: {
    backgroundColor:
      'var(--desktop-window-titlebar-inactive-background-color, var(--background-basic-color-1, #ffffff))'
  },

  windowIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '1.1rem',
    height: '1.1rem',
    color: 'var(--desktop-window-icon-color, currentColor)'
  },

  windowTitle: {
    flex: '1 1 auto',
    minWidth: 0,
    overflow: 'hidden',
    color: 'var(--desktop-window-title-color, var(--text-basic-color, #222b45))',
    fontSize: '0.8125rem',
    fontWeight: 600,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  windowControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.1rem',
    flex: '0 0 auto'
  },

  windowControl: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.65rem',
    padding: 0,
    border: 0,
    borderRadius: '0.2rem',
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--desktop-window-control-hover-background-color, var(--background-basic-color-3, #edf1f7))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-1px'
    }
  },

  windowControlClose: {
    '&:hover': {
      backgroundColor: 'var(--color-danger-500, #ff3d71)',
      color: '#ffffff'
    }
  },

  windowBody: {
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'auto',
    padding: 'var(--desktop-window-body-padding, 0.75rem)'
  },

  windowError: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.5rem',
    padding: '0.75rem',
    color: 'var(--color-danger-500, #ff3d71)',
    fontSize: '0.8125rem'
  },

  windowErrorAction: {
    minHeight: '1.8rem',
    padding: '0.25rem 0.6rem',
    border: '1px solid currentColor',
    borderRadius: 'var(--desktop-window-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.78rem',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  resizeHandle: {
    position: 'absolute',
    zIndex: 1,
    touchAction: 'none'
  },

  resizeN: {
    top: 0,
    left: 10,
    right: 84,
    height: 6,
    cursor: 'ns-resize'
  },

  resizeS: {
    bottom: 0,
    left: 10,
    right: 10,
    height: 6,
    cursor: 'ns-resize'
  },

  resizeE: {
    top: 42,
    right: 0,
    bottom: 0,
    width: 6,
    cursor: 'ew-resize'
  },

  resizeW: {
    top: 42,
    left: 0,
    bottom: 0,
    width: 6,
    cursor: 'ew-resize'
  },

  resizeNe: {
    top: 42,
    right: 0,
    width: 10,
    height: 10,
    cursor: 'nesw-resize'
  },

  resizeNw: {
    top: 42,
    left: 0,
    width: 10,
    height: 10,
    cursor: 'nwse-resize'
  },

  resizeSe: {
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    cursor: 'nwse-resize'
  },

  resizeSw: {
    bottom: 0,
    left: 0,
    width: 12,
    height: 12,
    cursor: 'nesw-resize'
  },

  modalBackdrop: {
    position: 'absolute',
    backgroundColor: 'var(--desktop-modal-backdrop-color, rgba(0, 0, 0, 0.24))',
    animation: `${fadeIn} var(--desktop-animation-duration, 120ms) ease-out`,

    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none'
    }
  },

  snapPreview: {
    position: 'absolute',
    zIndex: 0,
    pointerEvents: 'none',
    border: '2px solid var(--desktop-snap-preview-border-color, var(--color-primary-500, #3366ff))',
    borderRadius: 'var(--desktop-window-radius, 0.45rem)',
    backgroundColor: 'var(--desktop-snap-preview-background-color, rgba(51, 102, 255, 0.16))',
    transition:
      'left var(--desktop-animation-duration, 80ms) ease-out, top var(--desktop-animation-duration, 80ms) ease-out, width var(--desktop-animation-duration, 80ms) ease-out, height var(--desktop-animation-duration, 80ms) ease-out',

    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none'
    }
  },

  displayZone: {
    position: 'absolute',
    zIndex: 0,
    pointerEvents: 'none',
    border: '1px dashed var(--desktop-display-border-color, rgba(51, 102, 255, 0.35))',
    borderRadius: 'var(--desktop-window-radius, 0.45rem)'
  },

  icons: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    gap: '0.35rem',
    padding: '0.65rem',
    pointerEvents: 'none'
  },

  iconButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    width: '5.5rem',
    padding: '0.4rem 0.25rem',
    border: '1px solid transparent',
    borderRadius: 'var(--desktop-icon-radius, 0.4rem)',
    backgroundColor: 'transparent',
    color: 'var(--desktop-icon-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    fontSize: '0.72rem',
    textAlign: 'center',
    cursor: 'pointer',
    pointerEvents: 'auto',

    '&:hover': {
      backgroundColor: 'var(--desktop-icon-hover-background-color, rgba(255, 255, 255, 0.55))',
      borderColor: 'var(--desktop-icon-hover-border-color, rgba(51, 102, 255, 0.35))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  iconGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    color: 'var(--desktop-icon-glyph-color, var(--color-primary-500, #3366ff))'
  },

  iconLabel: {
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  overview: {
    position: 'absolute',
    inset: 0,
    zIndex: 900000000,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem',
    overflow: 'auto',
    backgroundColor: 'var(--desktop-overview-background-color, rgba(13, 18, 30, 0.72))',
    backdropFilter: 'blur(6px)'
  },

  overviewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    fontWeight: 600
  },

  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))',
    gap: '0.65rem'
  },

  overviewCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.5rem',
    minHeight: '6rem',
    padding: '0.75rem',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: 'var(--desktop-window-radius, 0.45rem)',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    color: 'var(--text-basic-color, #222b45)',
    font: 'inherit',
    fontSize: '0.85rem',
    textAlign: 'start',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: '#ffffff'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  overviewCardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    minWidth: 0,
    fontWeight: 600
  },

  overviewCardMeta: {
    color: 'var(--text-hint-color, #8f9bb3)',
    fontSize: '0.75rem'
  },

  taskbarGroup: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    flex: '0 1 auto',
    minWidth: 0,
    maxWidth: '16rem'
  },

  taskbarGroupButton: {
    flex: '1 1 auto',
    minWidth: 0,
    maxWidth: '10rem'
  },

  taskbarGroupToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '1.35rem',
    height: '2rem',
    padding: 0,
    border: 0,
    borderRadius: 'var(--desktop-taskbar-item-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--desktop-taskbar-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  taskbarCount: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    minWidth: '1rem',
    height: '1rem',
    padding: '0 0.2rem',
    borderRadius: '999px',
    backgroundColor:
      'var(--desktop-taskbar-count-background-color, var(--color-primary-500, #3366ff))',
    color: 'var(--desktop-taskbar-count-color, #ffffff)',
    fontSize: '0.65rem',
    fontWeight: 700,
    lineHeight: 1
  },

  taskbarCompactItem: {
    justifyContent: 'center',
    width: '2.15rem',
    maxWidth: '2.15rem',
    padding: '0.25rem'
  },

  taskbarPreview: {
    position: 'fixed',
    zIndex: 2000000000,
    width: 'var(--desktop-taskbar-preview-width, 15rem)',
    padding: '0.5rem',
    border:
      '1px solid var(--desktop-taskbar-preview-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-taskbar-preview-radius, 0.45rem)',
    backgroundColor:
      'var(--desktop-taskbar-preview-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--desktop-taskbar-preview-shadow, 0 12px 28px rgba(0, 0, 0, 0.18))',
    color: 'var(--desktop-taskbar-preview-color, var(--text-basic-color, #222b45))',
    fontSize: '0.78rem',
    pointerEvents: 'none'
  },

  taskbarPreviewTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '0.35rem',
    fontWeight: 600
  },

  taskbarPreviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    margin: 0,
    padding: 0,
    listStyle: 'none',
    color: 'var(--text-hint-color, #8f9bb3)'
  },

  workspaceSwitcher: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    flex: '0 0 auto'
  },

  workspaceSwitcherVertical: {
    flexDirection: 'column',
    alignItems: 'stretch'
  },

  workspaceButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '1.75rem',
    height: '1.85rem',
    padding: '0 0.35rem',
    border: 0,
    borderRadius: 'var(--desktop-taskbar-item-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--desktop-taskbar-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  workspaceButtonActive: {
    backgroundColor:
      'var(--desktop-workspace-active-background-color, var(--color-primary-500, #3366ff))',
    color: 'var(--desktop-workspace-active-color, #ffffff)',

    '&:hover': {
      backgroundColor:
        'var(--desktop-workspace-active-background-color, var(--color-primary-500, #3366ff))'
    }
  },

  startMenuSearch: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    padding: '0.15rem 0.15rem 0.35rem',
    backgroundColor:
      'var(--desktop-start-menu-background-color, var(--background-basic-color-1, #ffffff))'
  },

  startMenuSearchInput: {
    width: '100%',
    minHeight: '2rem',
    padding: '0.35rem 0.55rem',
    border:
      '1px solid var(--desktop-start-menu-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-start-menu-radius, 0.4rem)',
    backgroundColor: 'var(--desktop-start-menu-search-background, transparent)',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  startMenuSection: {
    padding: '0.55rem 0.5rem 0.2rem',
    color: 'var(--desktop-start-menu-title-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase'
  },

  contextMenu: {
    position: 'absolute',
    zIndex: 2000000000,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    minWidth: '11rem',
    maxWidth: '18rem',
    padding: '0.3rem',
    border:
      '1px solid var(--desktop-context-menu-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-context-menu-radius, 0.45rem)',
    backgroundColor:
      'var(--desktop-context-menu-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--desktop-context-menu-shadow, 0 10px 28px rgba(0, 0, 0, 0.18))',
    animation: `${menuIn} var(--desktop-animation-duration, 100ms) ease-out`,

    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none'
    }
  },

  contextMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    width: '100%',
    padding: '0.4rem 0.5rem',
    border: 0,
    borderRadius: 'var(--desktop-context-menu-item-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',
    textAlign: 'start',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--desktop-context-menu-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-1px'
    }
  },

  contextMenuItemDanger: {
    color: 'var(--color-danger-500, #ff3d71)'
  },

  contextMenuSeparator: {
    height: 1,
    margin: '0.2rem 0.3rem',
    backgroundColor:
      'var(--desktop-context-menu-border-color, var(--border-basic-color-3, #e4e9f2))'
  },

  contextMenuLabel: {
    padding: '0.35rem 0.5rem 0.2rem',
    color: 'var(--desktop-context-menu-label-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textAlign: 'start',
    textTransform: 'uppercase'
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

export type DesktopStylesNames = Selectors<typeof useStyles>;
