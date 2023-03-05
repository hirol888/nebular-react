import { createStyles } from '@nebular-react/styles';

export default createStyles((theme) => ({
  root: {
    padding: 'var(--layout-padding)',

    ...theme.fns.mediaBreakpointDown('md', { padding: 'var(--layout-medium-padding)' }),
    ...theme.fns.mediaBreakpointDown('sm', { padding: 'var(--layout-small-padding)' }),

    order: 1,
    flex: '1 0',
    minWidth: 0
  },

  left: {
    ...theme.fns.ltr({ order: 0 }),
    ...theme.fns.rtl({ order: 2 })
  },

  start: {
    order: 0
  }
}));
