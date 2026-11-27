import { ComponentOrCustomStatus, createStyles } from '@nebular-react/styles';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

export interface RadioStylesParams {
  status: ComponentOrCustomStatus;
  orientation?: RadioGroupOrientation;
}

export default createStyles((theme, { status, orientation = 'vertical' }: RadioStylesParams) => ({
  root: {
    display: 'block',
    position: 'relative',

    label: {
      display: 'inline-flex',
      margin: 0,
      minHeight: 'inherit',
      padding: '0.375rem 0',
      ...theme.fns.ltr({ paddingRight: '1.5rem' }),
      ...theme.fns.rtl({ paddingLeft: '1.5rem' }),
      alignItems: 'center',

      '&:hover .nebular-radio-nativeInput:enabled + .nebular-radio-outerCircle': {
        backgroundColor: `var(--radio-${status}-hover-background-color)`,
        borderColor: `var(--radio-${status}-hover-border-color)`
      },

      '&:hover .nebular-radio-nativeInput:checked:enabled': {
        '& + .nebular-radio-outerCircle': {
          backgroundColor: `var(--radio-${status}-hover-checked-background-color)`,
          borderColor: `var(--radio-${status}-hover-checked-border-color)`
        },

        '& ~ .nebular-radio-innerCircle': {
          backgroundColor: `var(--radio-${status}-hover-inner-circle-color)`
        }
      },

      '& .nebular-radio-nativeInput:enabled:active + .nebular-radio-outerCircle': {
        backgroundColor: `var(--radio-${status}-active-background-color)`,
        borderColor: `var(--radio-${status}-active-border-color)`
      },

      '& .nebular-radio-nativeInput:enabled:checked:active': {
        '& + .nebular-radio-outerCircle': {
          backgroundColor: `var(--radio-${status}-active-checked-background-color)`,
          borderColor: `var(--radio-${status}-active-checked-border-color)`
        },

        '& ~ .nebular-radio-innerCircle': {
          backgroundColor: `var(--radio-${status}-active-inner-circle-color)`
        }
      }
    }
  },

  circle: {
    borderRadius: '50%',
    position: 'absolute',
    top: '50%',
    ...theme.fns.ltr({ left: 0 }),
    ...theme.fns.rtl({ right: 0 }),
    transform: 'translateY(-50%)',

    height: 'var(--radio-height)',
    width: 'var(--radio-width)'
  },

  innerCircle: {
    transform: 'translateY(-50%) scale(0.6)'
  },

  outerCircle: {
    borderStyle: 'var(--radio-border-style)',
    borderWidth: 'var(--radio-border-width)'
  },

  text: {
    color: `var(--radio-${status}-text-color)`,
    fontFamily: 'var(--radio-text-font-family)',
    fontSize: 'var(--radio-text-font-size)',
    fontWeight: 'var(--radio-text-font-weight)' as any,
    ...theme.fns.ltr({ marginLeft: 'var(--radio-width)', paddingLeft: '0.5rem' }),
    ...theme.fns.rtl({ marginRight: 'var(--radio-width)', paddingRight: '0.5rem' })
  },

  nativeInput: {
    '&:enabled:focus + .nebular-radio-outerCircle': {
      ...theme.fns.outline('var(--radio-outline-width)', 'var(--radio-outline-color)'),
      backgroundColor: `var(--radio-${status}-focus-background-color)`,
      borderColor: `var(--radio-${status}-focus-border-color)`
    },

    '&:enabled + .nebular-radio-outerCircle': {
      backgroundColor: `var(--radio-${status}-background-color)`,
      borderColor: `var(--radio-${status}-border-color)`
    },

    '&:enabled:checked': {
      '& + .nebular-radio-outerCircle': {
        backgroundColor: `var(--radio-${status}-checked-background-color)`,
        borderColor: `var(--radio-${status}-checked-border-color)`
      },

      '& ~ .nebular-radio-innerCircle': {
        backgroundColor: `var(--radio-${status}-inner-circle-color)`
      }
    },

    '&:enabled:checked:focus': {
      '& + .nebular-radio-outerCircle': {
        backgroundColor: `var(--radio-${status}-focus-checked-background-color)`,
        borderColor: `var(--radio-${status}-focus-checked-border-color)`
      },

      '& ~ .nebular-radio-innerCircle': {
        backgroundColor: `var(--radio-${status}-focus-inner-circle-color)`
      }
    },

    '&:disabled': {
      '& + .nebular-radio-outerCircle': {
        backgroundColor: `var(--radio-${status}-disabled-background-color)`,
        borderColor: `var(--radio-${status}-disabled-border-color)`
      },

      '& ~ .nebular-radio-text': {
        color: `var(--radio-${status}-disabled-text-color)`
      },

      '&:checked': {
        '& + .nebular-radio-outerCircle': {
          backgroundColor: `var(--radio-${status}-disabled-checked-background-color)`,
          borderColor: `var(--radio-${status}-disabled-checked-border-color)`
        },

        '& ~ .nebular-radio-innerCircle': {
          backgroundColor: `var(--radio-${status}-disabled-checked-inner-circle-color)`
        }
      }
    }
  },

  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--radio-group-gap, 0.375rem)',
    width: '100%',
    fontFamily: 'var(--radio-group-font-family, inherit)'
  },

  groupLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.15rem',
    color: 'var(--radio-group-label-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--radio-group-label-font-size, 0.8125rem)',
    fontWeight: 600,
    lineHeight: 1.4
  },

  required: {
    color: 'var(--radio-group-required-color, var(--color-danger-500, #ff3d71))'
  },

  description: {
    color: 'var(--radio-group-description-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--radio-group-description-font-size, 0.75rem)',
    lineHeight: 1.4
  },

  items: {
    display: 'flex',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
    alignItems: orientation === 'horizontal' ? 'center' : 'flex-start',
    gap: 'var(--radio-group-items-gap, 0.5rem)'
  },

  error: {
    color:
      'var(--radio-group-error-color, color-mix(in srgb, var(--color-danger-500, #ff3d71) 55%, var(--text-basic-color, #222b45)))',
    fontSize: 'var(--radio-group-error-font-size, 0.75rem)',
    lineHeight: 1.4
  }
}));
