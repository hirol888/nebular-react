import React from 'react';

export interface DesktopWindowErrorBoundaryProps {
  resetKey: string;
  message: string;
  reloadLabel: string;
  className?: string;
  actionClassName?: string;
  children: React.ReactNode;
}

interface DesktopWindowErrorBoundaryState {
  error: boolean;
  resetKey: string;
}

export class DesktopWindowErrorBoundary extends React.Component<
  DesktopWindowErrorBoundaryProps,
  DesktopWindowErrorBoundaryState
> {
  state: DesktopWindowErrorBoundaryState = {
    error: false,
    resetKey: this.props.resetKey
  };

  static getDerivedStateFromError(): Partial<DesktopWindowErrorBoundaryState> {
    return { error: true };
  }

  static getDerivedStateFromProps(
    props: DesktopWindowErrorBoundaryProps,
    state: DesktopWindowErrorBoundaryState
  ): Partial<DesktopWindowErrorBoundaryState> | null {
    if (props.resetKey !== state.resetKey) {
      return { error: false, resetKey: props.resetKey };
    }

    return null;
  }

  componentDidCatch(_error: Error) {
    // The fallback keeps the desktop alive; consumers can still log via app boundaries.
  }

  render() {
    if (this.state.error) {
      return (
        <div className={this.props.className} role="alert">
          <p>{this.props.message}</p>
          <button
            type="button"
            className={this.props.actionClassName}
            onClick={() => this.setState({ error: false })}
          >
            {this.props.reloadLabel}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
