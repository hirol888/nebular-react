/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NbComponentStatus } from '../component';
import { NbBadge, NbBadgePosition } from './Badge';

describe('NbBadge', () => {
  let unmount: () => void;

  it(`should contain text set to 'text' input`, () => {
    const text = 'random badge text';
    ({ unmount } = render(<NbBadge data-testid="badge" text={text} />));
    const badge = screen.getByTestId('badge');

    expect(badge).toHaveTextContent(text);
    unmount();
  });

  it('should has basic status by default', () => {
    ({ unmount } = render(<NbBadge data-testid="badge" />));
    const badge = screen.getByTestId('badge');

    expect(badge).toHaveClass('status-basic');
    unmount();
  });

  it('should set status class', () => {
    const statuses: NbComponentStatus[] = [
      'primary',
      'success',
      'info',
      'warning',
      'danger'
    ];

    for (const status of statuses) {
      ({ unmount } = render(<NbBadge data-testid="badge" status={status} />));
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass(`status-${status}`);

      unmount();
    }
  });

  it(`should has 'top' class if position contains 'top'`, () => {
    const topPositions: NbBadgePosition[] = [
      'top end',
      'top left',
      'top right',
      'top start'
    ];

    for (const position of topPositions) {
      ({ unmount } = render(
        <NbBadge data-testid="badge" position={position} />
      ));
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('position-top');

      unmount();
    }
  });

  it(`should has 'right' class if position contains 'right'`, () => {
    const rightPositions: NbBadgePosition[] = ['top right', 'bottom right'];

    for (const position of rightPositions) {
      ({ unmount } = render(
        <NbBadge data-testid="badge" position={position} />
      ));
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('position-right');

      unmount();
    }
  });

  it(`should has 'bottom' class if position contains 'bottom'`, () => {
    const bottomPositions: NbBadgePosition[] = [
      'bottom end',
      'bottom left',
      'bottom right',
      'bottom start'
    ];

    for (const position of bottomPositions) {
      ({ unmount } = render(
        <NbBadge data-testid="badge" position={position} />
      ));
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('position-bottom');

      unmount();
    }
  });

  it(`should has 'left' class if position contains 'left'`, () => {
    const leftPositions: NbBadgePosition[] = ['top left', 'bottom left'];

    for (const position of leftPositions) {
      ({ unmount } = render(
        <NbBadge data-testid="badge" position={position} />
      ));
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('position-left');

      unmount();
    }
  });

  it(`should has 'start' class if position contains 'start'`, () => {
    const startPositions: NbBadgePosition[] = ['top start', 'bottom start'];

    for (const position of startPositions) {
      ({ unmount } = render(
        <NbBadge data-testid="badge" position={position} />
      ));
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('position-start');

      unmount();
    }
  });

  it(`should has 'end' class if position contains 'end'`, () => {
    const endPositions: NbBadgePosition[] = ['top end', 'bottom end'];

    for (const position of endPositions) {
      ({ unmount } = render(
        <NbBadge data-testid="badge" position={position} />
      ));
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('position-end');

      unmount();
    }
  });
});
