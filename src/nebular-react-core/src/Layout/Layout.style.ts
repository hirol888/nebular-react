import { createStyles, CSSObject } from '@nebular-react/styles';
import { Property } from 'csstype';

export default createStyles((theme) => {
  const windowMode = (paddingTop: Property.PaddingTop): CSSObject => {
    const result: CSSObject = {
      paddingTop,

      '.nebular-layout-header-fixed': {
        top: paddingTop,

        '& ~ .nebular-layout-layoutContainer .nebular-sidebar-root .nebular-sidebar-containerFixed':
          {
            height: `calc(100vh - ${paddingTop} - var(--header-height))`,
            top: `calc(${paddingTop} + var(--header-height))`
          }
      },

      '.nebular-sidebar-fixed': {
        left: 'calc(100vw - var(--layout-window-mode-max-width))'
      },

      '.nebular-layout-layoutContainer': {
        '.nebular-sidebar-root.nebular-sidebar-fixed.nebular-sidebar-right': {
          right: 'calc((100vw - var(--layout-window-mode-max-width)) / 2)'
        },

        '.nebular-sidebar-root.nebular-sidebar-fixed': {
          top: 'calc((100vw - var(--layout-window-mode-max-width)) / 2)'
        }
      },

      '.nebular-layout-scrollableContainer': {
        height: `calc(100vh - ${paddingTop})`,
        boxShadow: 'var(--layout-window-shadow)'
      }
    };

    return result;
  };

  return {
    root: {
      ...theme.fns.ltr({ textAlign: 'left' }),
      ...theme.fns.rtl({ textAlign: 'right' }),

      WebkitFontSmoothing: 'antialiased',

      '&.column-curtain.with-search': {
        '.nebular-layout-layout': {
          pointerEvents: 'none'
        },

        '.nebular-layout-scrollableContainer': {
          position: 'relative',
          zIndex: 0
        }
      },

      '&.curtain .nebular-layout-scrollableContainer': {
        position: 'relative',
        zIndex: 0
      },

      '&.rotate-layout': {
        position: 'fixed',
        overflow: 'hidden',
        width: '100%',

        '.nebular-layout-scrollableContainer': {
          position: 'relative',
          zIndex: 10001,
          transition: 'transform 0.5s cubic-bezier(0.2, 1, 0.3, 1)'
        },

        '&.with-search .nebular-layout-scrollableContainer': {
          transition: 'transform 0.5s cubic-bezier(0.2, 1, 0.3, 1)',
          transformOrigin: '50vw 50vh',
          transform: 'perspective(1000px) translate3d(0, 50vh, 0) rotate3d(1, 0, 0, 30deg)',
          pointerEvents: 'none'
        }
      },

      '&.modal-drop': {
        '.nebular-layout-layout': {
          position: 'relative',
          transition: 'transform 0.4s, opacity 0.4s',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },

        '.nebular-layout-scrollableContainer': {
          position: 'relative',
          zIndex: 0
        },

        '&.with-search .nebular-layout-layout': {
          opacity: 0,
          transform: 'scale3d(0.9, 0.9, 1)',
          pointerEvents: 'none'
        }
      },

      '&.modal-half': {
        '.nebular-layout-layout': {
          transition: 'transform 0.6s, opacity 0.6s',
          transitionTimingFunction: 'cubic-bezier(0.2, 1, 0.3, 1)'
        },

        '&.with-search': {
          '.nebular-layout-layout': {
            transform: 'scale3d(0.8, 0.8, 1)',
            pointerEvents: 'none'
          },

          '.nebular-layout-scrollableContainer': {
            position: 'relative',
            zIndex: 0
          }
        }
      },

      '&.modal-move': {
        '.nebular-layout-layout': {
          transition: 'transform 0.5s'
        },

        '&.with-search': {
          '.nebular-layout-layout': {
            transform: 'scale3d(0.8, 0.8, 1)',
            pointerEvents: 'none'
          },

          '.nebular-layout-scrollableContainer': {
            position: 'relative',
            zIndex: 0
          }
        }
      },

      '&.modal-zoomin': {
        '&.with-search .nebular-layout-scrollableContainer': {
          position: 'relative',
          zIndex: 0
        }
      }
    },

    layout: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 'var(--layout-window-mode-min-width)',

      backgroundColor: 'var(--layout-background-color)',
      color: 'var(--layout-text-color)',
      fontFamily: 'var(--layout-text-font-family)',
      fontSize: 'var(--layout-text-font-size)',
      fontWeight: 'var(--layout-text-font-weight)' as any,
      lineHeight: 'var(--layout-text-line-height)',
      minHeight: 'var(--layout-min-height)'
    },

    layoutContainer: {
      display: 'flex',
      flex: 1,
      msFlex: '1 1 auto',
      flexDirection: 'row',
      '.nebular-sidebar-root.nebular-sidebar-fixed, .nebular-sidebar-containerFixed': {
        top: 'var(--header-height)'
      }
    },

    content: {
      display: 'flex',
      flex: 1,
      msFlex: '1 1 auto',
      flexDirection: 'column',
      minWidth: 0
    },

    contentCenter: {
      maxWidth: '100%',
      position: 'relative',
      marginLeft: 'auto',
      marginRight: 'auto',

      width: 'var(--layout-content-width)',
      flex: '0 100 var(--layout-content-width) !important'
    },

    columns: {
      display: 'flex',
      flex: 1,
      msFlex: '1 1 auto',
      flexDirection: 'row',
      width: '100%'
    },

    scrollableContainer: {
      ...theme.fns.scrollbars(
        'var(--layout-scrollbar-color)',
        'var(--layout-scrollbar-background-color)',
        'var(--layout-scrollbar-width)'
      )
    },

    withScroll: {
      overflow: 'auto',
      height: '100vh',
      display: 'block',

      ...theme.fns.mediaBreakpointDown('sm', {
        overflowY: 'scroll',
        WebkitOverflowScrolling: 'touch'
      })
    },

    windowMode: {
      background: 'var(--layout-window-mode-background-color)',
      display: 'block',

      '.nebular-layout-scrollableContainer': {
        maxWidth: 'var(--layout-window-mode-max-width)',
        margin: '0 auto'
      },

      '.nebular-layout-header-root': {
        maxWidth: 'var(--layout-window-mode-max-width)',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',

        '.nebular-layout-header-nav': {
          maxWidth: 'var(--layout-window-mode-max-width)',
          margin: '0 auto'
        }
      },

      '@media screen and (min-width: (var(--layout-window-mode-max-width) + 20px))': {
        paddingTop: 'calc(var(--layout-window-mode-padding-top) * 0.25)',

        ...windowMode('calc(var(--layout-window-mode-padding-top) * 0.25)'),

        '.nebular-layout-withScroll': {
          height: 'calc(100vh - (var(--layout-window-mode-padding-top) * 0.25))'
        }
      },

      '@media screen and (min-width: (var(--layout-window-mode-max-width) + 150px))': {
        paddingTop: 'calc(var(--layout-window-mode-padding-top) * 0.5)',

        ...windowMode('calc(var(--layout-window-mode-padding-top) * 0.5)'),

        '.nebular-layout-withScroll': {
          height: 'calc(100vh - (var(--layout-window-mode-padding-top) * 0.5))'
        }
      },

      '@media screen and (min-width: (var(--layout-window-mode-max-width) + 300px))': {
        paddingTop: 'var(--layout-window-mode-padding-top)',

        ...windowMode('var(--layout-window-mode-padding-top'),

        '.nebular-layout-withScroll': {
          height: 'calc(100vh - var(--layout-window-mode-padding-top))'
        }
      }
    },

    withSubheader: {
      '.nebular-sidebar-root .nebular-sidebar-container': {
        boxShadow: 'none'
      }
    }
  };
});
