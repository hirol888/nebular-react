import { createStyles } from '@nebular-react/styles';

export default createStyles(() => ({
  root: {},

  horizontal: {
    '.nebular-stepper-header': {
      '.nebular-stepper-stepHeader': {
        flexDirection: 'column',
        width: 'var(--stepper-step-index-width)',
        margin: '0 var(--stepper-step-index-width) * 0.5'
      },

      '.nebular-stepper-connector': {
        height: '2px',
        margin: 'var(--stepper-horizontal-connector-margin)'
      }
    },

    '.nebular-stepper-labelIndex': {
      marginBottom: '10px'
    }
  },

  vertical: {
    display: 'flex',
    height: '100%',

    '.nebular-stepper-header': {
      flexDirection: 'column',

      '.label': {
        margin: '0 10px'
      },

      '.nebular-stepper-connector': {
        width: '2px',
        margin: 'var(--stepper-vertical-connector-margin)'
      }
    }
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',

    '.label': {
      width: 'max-content'
    }
  },

  connector: {
    flex: 'auto',
    backgroundColor: 'var(--stepper-connector-background-color)'
  },

  connectorPast: {
    backgroundColor: 'var(--stepper-connector-completed-background-color)'
  },

  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',

    color: 'var(--stepper-step-text-color)',
    fontFamily: 'var(--stepper-step-text-font-family)',
    fontSize: 'var(--stepper-step-text-font-size)',
    fontWeight: 'var(--stepper-step-text-font-weight)' as any,
    lineHeight: 'var(--stepper-step-text-line-height)'
  },

  notInteractive: {
    cursor: 'default'
  },

  labelIndex: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    borderRadius: 'var(--stepper-step-index-border-radius)',
    borderColor: 'var(--stepper-step-index-border-color)',
    borderStyle: 'var(--stepper-step-index-border-style)',
    borderWidth: 'var(--stepper-step-index-border-width)',
    width: 'var(--stepper-step-index-width)',
    height: 'var(--stepper-step-index-width)'
  },

  active: {
    color: 'var(--stepper-step-active-text-color)',

    '.nebular-stepper-labelIndex': {
      borderColor: 'var(--stepper-step-index-active-border-color)'
    }
  },

  completed: {
    color: 'var(--stepper-step-completed-text-color)',

    '.nebular-stepper-labelIndex': {
      backgroundColor: 'var(--stepper-connector-completed-background-color)',
      borderColor: 'var(--stepper-step-index-completed-border-color)',
      color: 'var(--stepper-step-index-completed-text-color)'
    }
  },

  stepContent: {
    '&.active': {
      '.nebular-stepper-step': {
        display: 'block'
      }
    }
  },

  step: {
    display: 'none',
    padding: 'var(--stepper-step-content-padding)'
  }
}));
