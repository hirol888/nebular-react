import {
  ButtonToggleAppearance,
  ComponentOrCustomStatus,
  createStyles,
  CSSObject,
  NebularTheme
} from '@nebular-react/styles';

export interface ButtonToggleStylesParams {
  appearance: ButtonToggleAppearance;
  pressedStatus: ComponentOrCustomStatus;
  notPressedStatus: ComponentOrCustomStatus;
}

const getDividerStyles = (
  theme: NebularTheme,
  appearance: ButtonToggleAppearance,
  notPressedStatus: ComponentOrCustomStatus,
  pressedStatus: ComponentOrCustomStatus
): CSSObject => {
  let styles: CSSObject = {};
  if (appearance === 'filled') {
    styles = {
      ...theme.fns.ltr({
        borderLeftColor: `var(--button-group-filled-${notPressedStatus}-divider-color)`
      }),
      ...theme.fns.rtl({
        borderRightColor: `var(--button-group-filled-${notPressedStatus}-divider-color)`
      }),

      '&.pressed': {
        ...theme.fns.ltr({
          borderLeftColor: `var(--button-group-filled-${pressedStatus}-divider-color)`
        }),
        ...theme.fns.rtl({
          borderRightColor: `var(--button-group-filled-${pressedStatus}-divider-color)`
        })
      }
    };
  }

  if (appearance === 'ghost') {
    styles = {
      ...theme.fns.ltr({ borderLeftColor: 'var(--button-group-ghost-divider-color)' }),
      ...theme.fns.rtl({ borderRightColor: 'var(--button-group-ghost-divider-color)' })
    };
  }

  return styles;
};

export default createStyles(
  (theme, { appearance, pressedStatus, notPressedStatus }: ButtonToggleStylesParams) => ({
    root: {
      display: 'inline-flex',

      '.nebular-button-wrapper': {
        '&:first-of-type:not(:last-of-type)': {
          '.nebular-button-root': {
            ...theme.fns.ltr({ borderTopRightRadius: 0, borderBottomRightRadius: 0 }),
            ...theme.fns.rtl({ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 })
          }
        },

        '&:last-of-type:not(:first-of-type)': {
          '.nebular-button-root': {
            ...theme.fns.ltr({ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }),
            ...theme.fns.rtl({ borderTopRightRadius: 0, borderBottomRightRadius: 0 })
          }
        },

        '.nebular-button-root': {
          borderColor: appearance === 'filled' || appearance === 'ghost' ? 'transparent' : null,
          color:
            appearance === 'filled'
              ? `var(--button-group-filled-button-${notPressedStatus}-text-color)`
              : null,

          '&.pressed': {
            color:
              appearance === 'filled'
                ? `var(--button-group-filled-button-${pressedStatus}-text-color)`
                : null
          }
        },

        '&:not(:first-of-type)': {
          '.nebular-button-root': {
            ...getDividerStyles(theme, appearance, notPressedStatus, pressedStatus)
          }
        },

        '&:not(:first-of-type):not(:last-of-type)': {
          '.nebular-button-root': {
            borderRadius: 0
          }
        }
      }
    }
  })
);
