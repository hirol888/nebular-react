import React from 'react';
import { Selectors, createStyles } from '@nebular-react/styles';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
  onError?(error: Error, info: React.ErrorInfo): void;
  ariaLabel?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: 'var(--error-boundary-padding, 2rem)',
    border: '1px solid var(--error-boundary-border-color, #ffc9c9)',
    borderRadius: 'var(--error-boundary-border-radius, 0.5rem)',
    backgroundColor: 'var(--error-boundary-background-color, #fff5f5)',
    color: 'var(--error-boundary-text-color, var(--text-basic-color, #222b45))',
    fontFamily: 'inherit',
    textAlign: 'center'
  },

  title: {
    margin: 0,
    color: 'var(--error-boundary-title-color, #c92a2a)',
    fontSize: 'var(--error-boundary-title-font-size, 1.125rem)',
    fontWeight: 700,
    lineHeight: 1.3
  },

  message: {
    margin: 0,
    color: 'var(--error-boundary-message-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--error-boundary-message-font-size, 0.875rem)',
    lineHeight: 1.5
  },

  action: {
    marginTop: '0.5rem',
    padding: '0.5rem 1rem',
    border: 0,
    borderRadius: 'var(--error-boundary-action-border-radius, 0.375rem)',
    backgroundColor:
      'var(--error-boundary-action-background-color, var(--color-primary-500, #3366ff))',
    color: 'var(--error-boundary-action-color, #ffffff)',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--error-boundary-focus-color, var(--color-primary-700, #274bdb))',
      outlineOffset: '2px'
    }
  }
}));

export type ErrorBoundaryStylesNames = Selectors<typeof useStyles>;

interface DefaultErrorFallbackProps {
  error: Error;
  ariaLabel?: string;
  onReset(): void;
}

function DefaultErrorFallback({ error, ariaLabel, onReset }: DefaultErrorFallbackProps) {
  const { classes, cx } = useStyles(null, { name: 'error-boundary' });

  return (
    <div className={cx(classes.root)} role="alert" aria-label={ariaLabel ?? 'Error'}>
      <h2 className={cx(classes.title)}>Something went wrong</h2>
      <p className={cx(classes.message)}>{error.message}</p>
      <button type="button" className={cx(classes.action)} onClick={onReset}>
        Try again
      </button>
    </div>
  );
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = 'ErrorBoundary';

  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const { onError } = this.props;

    if (typeof onError === 'function') {
      onError(error, info);
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { children, fallback, ariaLabel } = this.props;

    if (error) {
      if (typeof fallback === 'function') {
        return fallback(error, this.reset);
      }

      if (fallback !== undefined && fallback !== null) {
        return fallback;
      }

      return <DefaultErrorFallback error={error} ariaLabel={ariaLabel} onReset={this.reset} />;
    }

    return children;
  }
}

export { ErrorBoundary };
