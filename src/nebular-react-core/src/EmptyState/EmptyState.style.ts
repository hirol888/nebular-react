import { createStyles } from '@nebular-react/styles';

export interface EmptyStateStylesParams {
  compact: boolean;
}

export default createStyles((_theme, { compact }: EmptyStateStylesParams) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: compact ? '0.35rem' : '0.5rem',
    padding: compact ? '1rem' : '2rem'
  },

  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: compact ? '1.75rem' : '2.5rem',
    lineHeight: 1,
    color: 'var(--empty-state-icon-color, var(--text-hint-color, #8f9bb3))'
  },

  title: {
    margin: 0,
    fontFamily: 'var(--text-heading-5-font-family, inherit)',
    fontSize: compact ? '1rem' : 'var(--text-heading-5-font-size, 1.125rem)',
    fontWeight: 'var(--text-heading-5-font-weight, 600)' as any,
    lineHeight: 'var(--text-heading-5-line-height, 1.5)',
    color: 'var(--empty-state-title-color, var(--text-basic-color, #222b45))'
  },

  description: {
    margin: 0,
    maxWidth: '34rem',
    fontSize: compact ? '0.8125rem' : 'var(--text-paragraph-font-size, 0.875rem)',
    lineHeight: 'var(--text-paragraph-line-height, 1.5)',
    color: 'var(--empty-state-description-color, var(--text-hint-color, #8f9bb3))'
  },

  action: {
    marginTop: compact ? '0.25rem' : '0.75rem'
  }
}));
