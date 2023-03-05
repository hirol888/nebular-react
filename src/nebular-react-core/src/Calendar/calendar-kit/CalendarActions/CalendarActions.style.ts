import { createStyles } from '@nebular-react/styles';

export default createStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between'
  },

  applyButton: {
    ...theme.fns.ltr({ marginLeft: 'auto' }),
    ...theme.fns.rtl({ marginRight: 'auto' })
  }
}));
