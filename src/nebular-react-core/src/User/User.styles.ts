import { ComponentShape, ComponentSize, createStyles } from '@nebular-react/styles';

export interface UserStylesParams {
  shape: ComponentShape;
  size: ComponentSize;
}

export default createStyles((theme, { shape, size }: UserStylesParams) => ({
  root: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center'
  },

  userPicture: {
    backgroundColor: 'var(--user-picture-box-background-color)',
    border: 'var(--user-picture-box-border-width) solid var(--user-picture-box-border-color)',

    height: `var(--user-${size}-height)`,
    width: `var(--user-${size}-width)`,

    borderRadius: `var(--user-${shape}-border-radius)`,

    position: 'relative',
    flexShrink: 0,

    '&.nebular-user-initials': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },

  image: {
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat'
  },

  initials: {
    color: 'var(--user-initials-text-color)',
    fontFamily: 'var(--user-initials-text-font-family)',
    fontWeight: 'var(--user-initials-text-font-weight)' as any,

    fontSize: `var(--user-${size}-initials-text-font-size)`,
    lineHeight: `var(--user-${size}-initials-text-line-height)`
  },

  userName: {
    color: 'var(--user-name-text-color)',
    fontFamily: 'var(--user-name-text-font-family)',
    fontWeight: 'var(--user-name-text-font-weight)' as any,

    fontSize: `var(--user-${size}-name-text-font-size)`,
    lineHeight: `var(--user-${size}-name-text-line-height)`,

    ...theme.fns.rtl({ textAlign: 'right' })
  },

  userTitle: {
    color: 'var(--user-title-text-color)',
    fontFamily: 'var(--user-title-text-font-family)',
    fontWeight: 'var(--user-title-text-font-weight)' as any,

    fontSize: `var(--user-${size}-title-text-font-size)`,
    lineHeight: `var(--user-${size}-title-text-line-height)`,

    ...theme.fns.rtl({ textAlign: 'right' })
  },

  infoContainer: {
    ...theme.fns.ltr({ marginLeft: '0.5rem' }),
    ...theme.fns.rtl({ marginRight: '0.5rem' })
  }
}));
