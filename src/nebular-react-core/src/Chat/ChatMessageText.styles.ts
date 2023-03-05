import { createStyles } from '@nebular-react/styles';

export default createStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column'
  },

  sender: {
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    maxWidth: '100%',
    fontSize: '0.875rem',
    color: 'var(--chat-message-sender-text-color)',
    marginTop: 0,
    marginBottom: '0.5rem'
  },

  text: {
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    maxWidth: '100%',
    marginTop: 0,
    marginBottom: 0,
    padding: '1rem',
    borderRadius: '0.5rem'
  }
}));
