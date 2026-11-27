import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Indicator } from '@nebular-react/core';

describe('Indicator', () => {
  it('renders its children and the label', () => {
    render(
      <Indicator label={5}>
        <span>Inbox</span>
      </Indicator>
    );

    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not render a zero label by default', () => {
    render(
      <Indicator label={0}>
        <span>Inbox</span>
      </Indicator>
    );

    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders a zero label when showZero is set', () => {
    render(
      <Indicator label={0} showZero>
        <span>Inbox</span>
      </Indicator>
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders a dot without text when dot is set', () => {
    render(
      <Indicator dot label={9} size={12}>
        <span>Inbox</span>
      </Indicator>
    );

    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.queryByText('9')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: '9' })).toHaveStyle({
      width: '12px',
      height: '12px'
    });
  });

  it('marks a dot without a label as decorative', () => {
    const { container } = render(
      <Indicator dot size={10}>
        <span>Inbox</span>
      </Indicator>
    );

    const dot = container.querySelector('[aria-hidden="true"]') as HTMLElement;

    expect(dot).toBeInTheDocument();
    expect(dot).toHaveStyle({ width: '10px', height: '10px' });
  });

  it('exposes a textual label to assistive technology', () => {
    render(
      <Indicator label="New messages">
        <span>Inbox</span>
      </Indicator>
    );

    expect(screen.getByRole('status', { name: 'New messages' })).toBeInTheDocument();
  });

  it('anchors the badge at the requested corner with the given offset', () => {
    render(
      <Indicator label={3} position="bottom-end" offset={4}>
        <span>Inbox</span>
      </Indicator>
    );

    const badge = screen.getByText('3');
    const computed = getComputedStyle(badge);

    expect(computed.position).toBe('absolute');
    expect(computed.getPropertyValue('bottom')).toBe('4px');
    expect(computed.getPropertyValue('inset-inline-end')).toBe('4px');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Indicator label="New messages">
        <button type="button">Inbox</button>
      </Indicator>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
