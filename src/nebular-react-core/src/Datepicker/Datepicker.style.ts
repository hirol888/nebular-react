import { createStyles } from '@nebular-react/styles';

export default createStyles(() => ({
  input: {},

  presets: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    padding: '0.5rem',
    borderBottom:
      '1px solid var(--datepicker-presets-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--datepicker-presets-background-color, var(--datepicker-background-color, #ffffff))'
  },

  presetButton: {
    padding: '0.25rem 0.5rem',
    border: '1px solid var(--datepicker-preset-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--datepicker-preset-border-radius, 0.25rem)',
    backgroundColor: 'var(--datepicker-preset-background-color, transparent)',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.75rem',
    lineHeight: 1.4,
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--datepicker-preset-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--datepicker-preset-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  calendarContainer: {
    '.nebular-card-root': {
      borderColor: 'var(--datepicker-border-color)',
      borderStyle: 'var(--datepicker-border-style)',
      borderWidth: 'var(--datepicker-border-width)',
      borderRadius: 'var(--datepicker-border-radius)',
      background: 'var(--datepicker-background-color)',
      boxShadow: 'var(--datepicker-shadow)'
    }
  }
}));
