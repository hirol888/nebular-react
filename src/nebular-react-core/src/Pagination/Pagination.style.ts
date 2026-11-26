import { createStyles } from '@nebular-react/styles';

export default createStyles((_theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.25rem'
  },

  item: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '2.25rem',
    height: '2.25rem',
    padding: '0 0.5rem',
    border: '1px solid var(--pagination-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--pagination-border-radius, 0.25rem)',
    backgroundColor: 'var(--pagination-background-color, transparent)',
    color: 'var(--pagination-text-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    cursor: 'pointer',
    transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease',

    '&:hover:not(:disabled)': {
      backgroundColor:
        'var(--pagination-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--pagination-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    },

    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5
    }
  },

  active: {
    backgroundColor: 'var(--pagination-active-background-color, var(--color-primary-500, #3366ff))',
    borderColor: 'var(--pagination-active-background-color, var(--color-primary-500, #3366ff))',
    color: 'var(--pagination-active-text-color, #ffffff)',

    '&:hover:not(:disabled)': {
      backgroundColor:
        'var(--pagination-active-background-color, var(--color-primary-500, #3366ff))'
    }
  },

  dots: {
    minWidth: '2.25rem',
    textAlign: 'center',
    color: 'var(--pagination-text-color, var(--text-hint-color, #8f9bb3))',
    userSelect: 'none'
  },

  control: {
    fontSize: '1rem'
  }
}));
