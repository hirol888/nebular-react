import { createStyles, keyframes } from '@nebular-react/styles';

export default createStyles((theme) => {
  const scaleUpDown = keyframes({
    '0%': {
      opacity: 1,
      transform: 'scale3d(1, 0, 1)'
    },
    '50%': {
      transform: 'scale3d(1, 1, 1)',
      transformOrigin: '50% 0',
      transitionTimingFunction: 'ease-out'
    },
    '50.1%': {
      transformOrigin: '50% 100%',
      transitionTimingFunction: 'ease-out'
    },
    '100%': {
      opacity: 1,
      transform: 'scale3d(1, 0, 1)',
      transformOrigin: '50% 100%',
      transitionTimingFunction: 'ease-out'
    }
  });

  return {
    root: {
      button: {
        fontSize: '2rem',
        margin: '0 auto',
        cursor: 'pointer',
        border: 'none',
        background: 'none',

        '&:focus': {
          boxShadow: 'none',
          outline: 'none'
        }
      }
    },

    searchField: {
      '&.rotate-layout': {
        opacity: 0,
        backgroundColor: 'var(--search-background-color)',

        position: 'absolute',
        display: 'block',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        transitionProperty: 'opacity',
        transitionDelay: '0.4s',

        '.nebular-search-search': {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 1050,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '50vh',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.5s',
          transitionTimingFunction: 'cubic-bezier(0.2, 1, 0.3, 1)',

          '.nebular-button-wrapper': {
            position: 'absolute',
            top: '3rem',
            ...theme.fns.ltr({ right: '3rem' }),
            ...theme.fns.rtl({ left: '3rem' }),
            fontSize: '2.5rem',
            opacity: 0,
            transform: 'scale3d(0.8, 0.8, 1)',
            transition: 'opacity 0.5s, transform 0.5s',
            transitionTimingFunction: 'cubic-bezier(0.2, 1, 0.3, 1)'
          },

          '.inner-wrapper': {
            margin: '5rem 0',
            opacity: 0,
            transform: 'scale3d(0.7, 0.7, 1)',
            transition: 'opacity 0.5s, transform 0.5s',
            transitionTimingFunction: 'cubic-bezier(0.2, 1, 0.3, 1)'
          },

          input: {
            fontSize: '7vw',
            width: '75%'
          }
        },

        '&.show': {
          opacity: 1,
          transitionDelay: '0s',

          '.nebular-search-search': {
            pointerEvents: 'auto',
            opacity: 1,

            '.nebular-button-wrapper': {
              opacity: 1,
              transform: 'scale3d(1, 1, 1)'
            },

            '.inner-wrapper': {
              opacity: 1,
              transform: 'scale3d(1, 1, 1)'
            }
          }
        }
      },

      '&.modal-zoomin': {
        display: 'block',

        '.nebular-search-search': {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'fixed',
          zIndex: 1050,
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.5s',

          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: 'calc(100% + 15px)',
            height: 'calc(100% + 15px)',
            pointerEvents: 'none',
            border: '1.5rem solid var(--search-extra-background-color)'
          },

          '&::before': {
            top: 0,
            left: 0,
            borderRightWidth: 0,
            borderBottomWidth: 0,
            transform: 'translate3d(-15px, -15px, 0)'
          },

          '&::after': {
            right: 0,
            bottom: 0,
            borderTopWidth: 0,
            borderLeftWidth: 0,
            transform: 'translate3d(15px, 15px, 0)'
          },

          '.nebular-button-wrapper': {
            position: 'absolute',
            top: '3rem',
            ...theme.fns.ltr({ right: '3rem' }),
            ...theme.fns.rtl({ left: '3rem' }),
            fontSize: '2.5rem',
            opacity: 0,
            transform: 'scale3d(0.8, 0.8, 1)',
            transition: 'opacity 0.5s, transform 0.5s'
          },

          input: {
            fontSize: '10vw',
            width: '75%'
          },

          '.inner-wrapper': {
            opacity: 0,
            transform: 'scale3d(0.8, 0.8, 1)',
            transition: 'opacity 0.5s, transform 0.5s'
          }
        },

        '&.show': {
          '.nebular-search-search': {
            pointerEvents: 'auto',
            opacity: 1,

            '&::before, &::after': {
              transform: 'translate3d(0, 0, 0)',
              transition: 'transform 0.5s'
            },

            '.nebular-button-wrapper': {
              opacity: 1,
              transform: 'scale3d(1, 1, 1)'
            },

            '.inner-wrapper': {
              opacity: 1,
              transform: 'scale3d(1, 1, 1)'
            }
          }
        },

        '@media screen and (max-width: 40rem)': {
          '.inner-wrapper': {
            margin: '5rem 0 1rem'
          },

          span: {
            textAlign: 'left'
          }
        }
      },

      '&.modal-half': {
        '.outer-wrapper': {
          backgroundColor: 'var(--search-background-color)'
        },

        '.nebular-search-search': {
          textAlign: 'center',
          position: 'fixed',
          zIndex: 1050,
          top: 0,
          left: 0,
          overflow: 'hidden',
          width: '100%',
          height: '100vh',
          background: 'none',
          pointerEvents: 'none',

          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.6s',
            transitionTimingFunction: 'cubic-bezier(0.2, 1, 0.3, 1)',
            backgroundColor: 'var(--search-extra-background-color)'
          },

          '.nebular-button-wrapper': {
            fontSize: '2.5rem',
            position: 'absolute',
            top: '3rem',
            ...theme.fns.ltr({ right: '3rem' }),
            ...theme.fns.rtl({ left: '3rem' }),
            display: 'block',
            zIndex: 100,
            opacity: 0,
            transform: 'scale3d(0.8, 0.8, 1)',
            transition: 'opacity 0.6s, transform 0.6s',
            transitionTimingFunction: 'cubic-bezier(0.2, 1, 0.3, 1)'
          },

          '.outer-wrapper': {
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '50%',
            transition: 'transform 0.6s',
            transitionTimingFunction: 'cubic-bezier(0.2, 1, 0.3, 1)',
            transform: 'translate3d(0, -100%, 0)',
            top: 0
          },

          '.inner-wrapper': {
            width: '75%',
            margin: '0 auto'
          },

          input: {
            fontSize: '7vw',
            width: '100%'
          }
        },

        '&.show': {
          '.nebular-search-search': {
            pointerEvents: 'auto',

            '&::before': {
              opacity: 1
            },

            '.nebular-button-wrapper': {
              opacity: 1,
              transform: 'scale3d(1, 1, 1)'
            },

            '.outer-wrapper': {
              transform: 'translate3d(0, 0, 0)'
            }
          }
        }
      },

      '&.modal-drop': {
        '.input-wrapper::after': {
          backgroundColor: 'var(--search-divider-color)'
        },

        '.nebular-search-search::before': {
          backgroundColor: 'var(--search-background-color)'
        },

        '.nebular-search-search': {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 1050,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: 'none',
          pointerEvents: 'none',

          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            transition: 'opacity 0.4s'
          },

          '.nebular-button-wrapper': {
            fontSize: '2.5rem',
            position: 'absolute',
            top: '3rem',
            ...theme.fns.ltr({ right: '3rem' }),
            ...theme.fns.rtl({ left: '3rem' }),
            display: 'block',
            opacity: 0,
            transition: 'opacity 0.4s'
          },

          '.inner-wrapper': {
            position: 'relative',
            margin: '5rem 0 2rem'
          },

          input: {
            fontSize: '6vw',
            width: '60%',
            padding: '0.25rem',
            textAlign: 'center',
            opacity: 0,
            transition: 'opacity 0.4s'
          },

          span: {
            position: 'relative',
            zIndex: 9,
            display: 'block',
            width: '60%',
            padding: '0.85rem 0',
            opacity: 0,
            transform: 'translate3d(0, -50px, 0)',
            transition: 'opacity 0.4s, transform 0.4s'
          },

          '.input-wrapper': {
            position: 'relative',
            zIndex: 10,
            overflow: 'hidden',
            transform: 'translate3d(0, -50px, 0)',
            transition: 'transform 0.4s',

            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '20%',
              width: '60%',
              height: '105%',
              opacity: 0,
              transformOrigin: '50% 0'
            }
          }
        },

        '&.show': {
          '.nebular-search-search': {
            pointerEvents: 'auto',

            '&::before': {
              opacity: 1
            },

            '.nebular-button-wrapper': {
              opacity: 1
            },

            '.input-wrapper': {
              transform: 'translate3d(0, 0, 0)',
              transition: 'none',

              '&::after': {
                animation: `${scaleUpDown} 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards`
              }
            },

            input: {
              opacity: 1,
              transition: 'opacity 0s 0.4s'
            },

            span: {
              opacity: 1,
              transform: 'translate3d(0, 0, 0)',
              transitionDelay: '0.4s',
              transitionTimingFunction: 'ease-out'
            }
          }
        },

        '@media screen and (max-width: 40rem)': {
          '.inner-wrapper': {
            margin: '2rem 0'
          },

          input: {
            width: '100%',
            left: 0
          }
        }
      },

      '&.curtain': {
        '.nebular-search-search::after': {
          backgroundColor: 'var(--search-background-color)'
        },

        '.nebular-search-search': {
          backgroundColor: 'var(--search-background-color)',
          position: 'fixed',
          zIndex: 1050,
          top: 0,
          left: '100%',
          overflow: 'hidden',
          height: '100vh',
          width: '100%',
          padding: '3rem',
          pointerEvents: 'none',
          transition: 'transform 0.3s',
          transitionDelay: '0.4s',
          transitionTimingFunction: 'ease-out',

          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transition: 'transform 0.3s',
            transitionTimingFunction: 'ease-out'
          },

          '.nebular-button-wrapper': {
            fontSize: '2.5rem',
            position: 'absolute',
            top: '3rem',
            ...theme.fns.ltr({ right: '3rem' }),
            ...theme.fns.rtl({ left: '3rem' }),
            transition: 'opacity 0.1s',
            transitionDelay: '0.3s'
          },

          '.inner-wrapper': {
            width: '50%',
            opacity: 0,
            transform: 'scale3d(0.8, 0.8, 1)',
            transition: 'opacity 0.5s, transform 0.5s'
          },

          input: {
            width: '100%',
            fontSize: '6vw'
          }
        },

        '&.show': {
          '.nebular-search-search': {
            width: '100%',
            pointerEvents: 'auto',
            transform: 'translate3d(-100%, 0, 0)',
            transitionDelay: '0s',

            '&::after': {
              transform: 'translate3d(100%, 0, 0)',
              transitionDelay: '0.4s'
            },

            '.nebular-button-wrapper': {
              opacity: 1,
              transform: 'scale3d(1, 1, 1)'
            },

            '.inner-wrapper': {
              opacity: 1,
              transform: 'scale3d(1, 1, 1)'
            }
          }
        },

        '@media screen and (max-width: 40rem)': {
          span: {
            width: '90%'
          },

          input: {
            fontSize: '2em',
            width: '90%'
          }
        }
      },

      '&.column-curtain': {
        '&::before': {
          backgroundColor: 'var(--search-background-color)',
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: 'scale3d(0, 1, 1)',
          transformOrigin: '0 50%',
          transition: 'transform 0.3s',
          transitionTimingFunction: 'cubic-bezier(0.86, 0, 0.07, 1)'
        },

        '&::after': {
          background: 'transparent'
        },

        display: 'block',
        position: 'fixed',
        zIndex: 1050,
        top: 0,
        left: '50%',
        overflow: 'hidden',
        width: '50%',
        height: '100vh',
        pointerEvents: 'none',

        '.nebular-search-search': {
          position: 'relative',
          padding: '2.5rem 1.5rem 0',
          background: 'transparent',

          '.nebular-button-wrapper': {
            position: 'absolute',
            top: '2rem',
            ...theme.fns.ltr({ right: '2rem' }),
            ...theme.fns.rtl({ left: '2rem' }),
            fontSize: '2.5rem',
            opacity: 0,
            transition: 'opacity 0.5s'
          },

          '.inner-wrapper': {
            width: '85%',
            transform: 'translate3d(-150%, 0, 0)',
            transition: 'transform 0.3s'
          },

          input: {
            fontSize: '2.5rem',
            width: '100%'
          },

          span: {
            fontSize: '85%'
          }
        },

        '&.show': {
          pointerEvents: 'auto',

          '&::before': {
            transform: 'scale3d(1, 1, 1)'
          },

          '.nebular-search-search': {
            '.inner-wrapper': {
              transform: 'translate3d(0, 0, 0)',
              transitionDelay: '0.15s',
              transitionTimingFunction: 'cubic-bezier(0.86, 0, 0.07, 1)'
            },

            '.nebular-button-wrapper': {
              opacity: 1,
              zIndex: 100
            }
          }
        },

        '@media screen and (max-width: 40rem)': {
          span: {
            width: '90%'
          },

          input: {
            fontSize: '2rem',
            width: '90%'
          }
        }
      },

      '&.modal-move': {
        '.nebular-search-search': {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'fixed',
          zIndex: 1050,
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.5s',

          '.nebular-button-wrapper': {
            position: 'absolute',
            top: '3rem',
            ...theme.fns.ltr({ right: '3rem' }),
            ...theme.fns.rtl({ left: '3rem' }),
            fontSize: '2.5rem',
            opacity: 0,
            transition: 'opacity 0.5s'
          },

          '.inner-wrapper': {
            margin: '5rem 0',
            opacity: 0,
            transform: 'scale3d(0.8, 0.8, 1)',
            transition: 'opacity 0.5s, transform 0.5s'
          },

          input: {
            fontSize: '10vw',
            width: '75%',
            transform: 'scale3d(0, 1, 1)',
            transformOrigin: '0 50%',
            transition: 'transform 0.3s'
          }
        },

        '&.show': {
          '.nebular-search-search': {
            pointerEvents: 'auto',
            opacity: 1,

            '.nebular-button-wrapper': {
              opacity: 1
            },

            '.inner-wrapper': {
              opacity: 1,
              transform: 'scale3d(1, 1, 1)'
            },

            input: {
              transform: 'scale3d(1, 1, 1)',
              transitionDuration: '0.5s'
            }
          }
        },

        '@media screen and (max-width: 40rem)': {
          span: {
            textAlign: 'left'
          }
        }
      }
    },

    closeButton: {
      zIndex: 1
    },

    search: {
      backgroundColor: 'var(--search-background-color)',

      '.nebular-button-wrapper': {
        margin: 0,
        padding: 0,
        cursor: 'pointer',
        border: 'none',
        background: 'none',

        '&:focus': {
          boxShadow: 'none',
          outline: 'none'
        }
      },

      input: {
        borderBottom:
          'var(--search-divider-width) var(--search-divider-style) var(--search-divider-color)',
        color: 'var(--search-text-color)',
        fontFamily: 'var(--search-text-font-family)',
        fontSize: 'var(--search-text-font-size)',
        fontWeight: 'var(--search-text-font-weight)' as any,
        lineHeight: 'var(--search-text-line-height)',

        '&::placeholder': {
          color: 'var(--search-placeholder-text-color)',
          opacity: 0.3
        },

        '&::-ms-clear': {
          display: 'none'
        },

        borderTop: 0,
        borderRight: 0,
        borderLeft: 0,
        background: 'transparent',
        borderRadius: 0,
        display: 'inline-block',
        boxSizing: 'border-box',
        padding: '0.05rem 0',
        WebkitAppearance: 'none',

        '&:focus': {
          outline: 'none'
        }
      }
    },

    info: {
      color: 'var(--search-info-text-color)',
      fontFamily: 'var(--search-info-text-font-family)',
      fontSize: 'var(--search-info-text-font-size)',
      fontWeight: 'var(--search-info-text-font-weight)' as any,
      lineHeight: 'var(--search-info-text-line-height)',

      display: 'block',
      width: '75%',
      margin: '0 auto',
      padding: '0.85rem 0',
      textAlign: 'right'
    }
  };
});
