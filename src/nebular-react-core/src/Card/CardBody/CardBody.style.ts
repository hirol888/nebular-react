import { createStyles } from '@nebular-react/styles';

export default createStyles((theme) => ({
  root: {
    flex: 1,
    msFlex: '1 1 auto',
    overflow: 'auto',
    padding: 'var(--card-padding)',
    position: 'relative',
    ...theme.fns.scrollbars(
      'var(--card-scrollbar-color)',
      'var(--card-scrollbar-background-color)',
      'var(--card-scrollbar-width)'
    )
  }
}));
