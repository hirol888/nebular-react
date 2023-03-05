import { createStyles } from '@nebular-react/styles';

export default createStyles(() => ({
  root: {},

  sender: {
    fontSize: '0.875rem',
    color: 'var(--chat-message-sender-text-color)',
    marginBottom: '0.5rem'
  },

  quote: {
    fontStyle: 'italic',
    fontSize: '0.875rem',
    background: 'var(--chat-message-quote-background-color)',
    color: 'var(--chat-message-quote-text-color)',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginTop: 0,
    marginBottom: '0.5rem'
  }
}));
