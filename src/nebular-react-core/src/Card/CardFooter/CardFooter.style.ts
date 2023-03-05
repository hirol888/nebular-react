import { createStyles } from '@nebular-react/styles';

export default createStyles(() => ({
  root: {
    padding: 'var(--card-padding)',
    borderTop: 'var(--card-divider-width) var(--card-divider-style) var(--card-divider-color)',
    borderBottomLeftRadius: 'var(--card-border-radius)',
    borderBottomRightRadius: 'var(--card-border-radius)'
  }
}));
