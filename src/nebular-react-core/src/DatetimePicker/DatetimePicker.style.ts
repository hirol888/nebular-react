import { createStyles } from '@nebular-react/styles';

export default createStyles(() => ({
  input: {},

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
