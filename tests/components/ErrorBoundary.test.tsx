import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ErrorBoundary } from '@nebular-react/core';

let shouldThrow = false;

function Bomb() {
  if (shouldThrow) {
    throw new Error('Boom');
  }

  return <p>Recovered content</p>;
}

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    shouldThrow = false;
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('ErrorBoundary_Render_ShouldRenderChildrenWhenThereIsNoError', () => {
    render(
      <ErrorBoundary>
        <p>Everything is fine</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('Everything is fine')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ErrorBoundary_ChildError_ShouldRenderDefaultFallback', () => {
    shouldThrow = true;

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    const alert = screen.getByRole('alert', { name: 'Error' });

    expect(alert).toHaveTextContent('Something went wrong');
    expect(alert).toHaveTextContent('Boom');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
  });

  it('ErrorBoundary_CustomFallback_ShouldRenderProvidedElement', () => {
    shouldThrow = true;

    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ErrorBoundary_CustomFallbackFunction_ShouldReceiveErrorAndReset', async () => {
    const user = userEvent.setup();
    shouldThrow = true;

    render(
      <ErrorBoundary
        fallback={(error, reset) => (
          <div>
            <p>{error.message}</p>
            <button type="button" onClick={reset}>
              Recover
            </button>
          </div>
        )}
      >
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('Boom')).toBeInTheDocument();

    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: 'Recover' }));

    expect(screen.getByText('Recovered content')).toBeInTheDocument();
    expect(screen.queryByText('Boom')).not.toBeInTheDocument();
  });

  it('ErrorBoundary_DefaultFallbackReset_ShouldRenderChildrenAgain', async () => {
    const user = userEvent.setup();
    shouldThrow = true;

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByText('Recovered content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('ErrorBoundary_ChildError_ShouldCallOnErrorWithReactInfo', () => {
    const onError = jest.fn();
    shouldThrow = true;

    render(
      <ErrorBoundary onError={onError}>
        <Bomb />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Boom' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('ErrorBoundary_CustomAriaLabel_ShouldLabelTheFallback', () => {
    shouldThrow = true;

    render(
      <ErrorBoundary ariaLabel="Application crashed">
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert', { name: 'Application crashed' })).toBeInTheDocument();
  });

  it('ErrorBoundary_Accessibility_ShouldHaveNoViolations', async () => {
    shouldThrow = true;

    const { container } = render(
      <ErrorBoundary ariaLabel="Application crashed">
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert', { name: 'Application crashed' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
