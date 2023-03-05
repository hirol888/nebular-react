import { ComponentOrCustomStatus, createStyles } from '@nebular-react/styles';

export interface ToastComponentStylesParams {
  status: ComponentOrCustomStatus;
  hasIcon: boolean;
}

export default createStyles((theme, { status, hasIcon }: ToastComponentStylesParams) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    width: '25rem',
    margin: '0.5rem',

    '.nebular-icon-root': {
      fontSize: '2.5rem',
      svg: {
        width: '2.5rem',
        height: '2.5rem'
      }
    },

    borderStyle: 'var(--toastr-border-style)',
    borderWidth: 'var(--toastr-border-width)',
    borderRadius: 'var(--toastr-border-radius)',
    padding: 'var(--toastr-padding)',
    boxShadow: 'var(--toastr-shadow)',

    backgroundColor: `var(--toastr-${status}-background-color)`,
    borderColor: `var(--toastr-${status}-border-color)`,
    color: `var(--toastr-${status}-text-color)`
  },

  title: {
    marginRight: '0.25rem',
    fontFamily: 'var(--toastr-title-text-font-family)',
    fontSize: 'var(--toastr-title-text-font-size)',
    fontWeight: 'var(--toastr-title-text-font-weight)' as any,
    lineHeight: 'var(--toastr-title-text-line-height)',

    color: `var(--toastr-${status}-text-color)`
  },

  destroyByClick: {
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: `var(--toastr-destroyable-${status}-hover-background-color)`,
      borderColor: `var(--toastr-destroyable-${status}-hover-border-color)`
    }
  },

  message: {
    fontFamily: 'var(--toastr-text-font-family)',
    fontSize: 'var(--toastr-text-font-size)',
    fontWeight: 'var(--toastr-text-font-weight)' as any,
    lineHeight: 'var(--toastr-text-line-height)'
  },

  iconContainer: {
    ...theme.fns.ltr({ marginRight: '1.25rem' }),
    ...theme.fns.rtl({ marginLeft: '1.25rem' }),
    borderRadius: 'var(--toastr-border-radius)',
    minWidth: '2.5rem',
    minHeight: '2.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: `var(--toastr-icon-${status}-background-color)`,
    color: `var(--toastr-icon-${status}-color)`
  },

  contentContainer: {
    display: hasIcon ? null : 'flex',
    flexDirection: hasIcon ? null : 'column'
  }
}));
