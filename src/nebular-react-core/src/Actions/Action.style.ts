import { createStyles } from '@nebular-react/styles';

export interface ActionStylesParams {
  disabled: boolean;
  iconOnly: boolean;
}

export default createStyles((theme, { disabled, iconOnly }: ActionStylesParams) => {
  const divider =
    'var(--actions-divider-width) var(--actions-divider-style) var(--actions-divider-color)';

  return {
    root: {
      background: 'transparent',
      appearance: 'none',
      border: 'none',
      position: 'relative',
      padding: 0,

      '.nebular-icon-root': {
        color: disabled ? 'var(--actions-disabled-icon-color)' : 'var(--actions-icon-color)',
        cursor: disabled ? 'not-allowed' : null,
        marginRight: iconOnly ? null : '0.5rem'
      },

      color: disabled ? 'var(--actions-disabled-text-color)' : null,
      cursor: disabled ? 'not-allowed' : 'pointer',
      pointerEvents: disabled ? 'none' : null,

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    wrapper: {
      display: 'flex',
      alignItems: 'center',

      cursor: disabled ? 'not-allowed' : 'pointer',

      ...theme.fns.ltr({ borderLeft: divider }),
      ...theme.fns.rtl({ borderRight: divider }),

      '&:first-of-type': {
        ...theme.fns.ltr({ borderLeft: 'none' }),
        ...theme.fns.rtl({ borderRight: 'none' })
      }
    }
  };
});
