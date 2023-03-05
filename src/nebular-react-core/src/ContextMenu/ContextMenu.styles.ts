import { createStyles } from '@nebular-react/styles';

export default createStyles(() => ({
  root: {
    backgroundColor: 'var(--context-menu-background-color)',
    borderColor: 'var(--context-menu-border-color)',
    borderStyle: 'var(--context-menu-border-style)',
    borderWidth: 'var(--context-menu-border-width)',
    borderRadius: 'var(--context-menu-border-radius)',
    boxShadow: 'var(--context-menu-shadow)',
    minWidth: 'var(--context-menu-min-width)',
    maxWidth: 'var(--context-menu-max-width)',

    '.nebular-menu-root': {
      borderRadius: 'var(--context-menu-border-radius)',
      overflow: 'hidden',
      textAlign: 'var(--context-menu-text-align)' as any,

      '.nebular-menu-expansionIndicator svg': {
        pointerEvents: 'none'
      }
    }
  }
}));
