/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { NbCard, NbCardBody, NbCardFooter, NbCardHeader } from '.';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NbComponentSize, NbComponentStatus } from '../component';

describe('NbCard', () => {
  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  it('should render header, body and footer properly', () => {
    ({ unmount } = render(
      <NbCard>
        <NbCardHeader data-testid="cardheader">Header</NbCardHeader>
        <NbCardBody data-testid="cardbody">Body</NbCardBody>
        <NbCardFooter data-testid="cardfooter">Footer</NbCardFooter>
      </NbCard>
    ));

    expect(screen.getByTestId('cardheader')).toHaveTextContent('Header');
    expect(screen.getByTestId('cardbody')).toHaveTextContent('Body');
    expect(screen.getByTestId('cardfooter')).toHaveTextContent('Footer');
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
      ({ unmount } = render(<NbCard data-testid="card" status={status} />));
      const card = screen.getByTestId('card');
      expect(card).toHaveClass(`status-${status}`);

      unmount();
    }
  });

  it('should set size class', () => {
    const sizes: NbComponentSize[] = [
      'tiny',
      'small',
      'medium',
      'large',
      'giant'
    ];

    for (const size of sizes) {
      ({ unmount } = render(<NbCard data-testid="card" size={size} />));
      const card = screen.getByTestId('card');
      expect(card).toHaveClass(`size-${size}`);

      unmount();
    }
  });

  it('should set accent status class', () => {
    const statuses: NbComponentStatus[] = [
      'primary',
      'success',
      'info',
      'warning',
      'danger'
    ];

    for (const status of statuses) {
      ({ unmount } = render(<NbCard data-testid="card" accent={status} />));
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('accent');
      expect(card).toHaveClass(`accent-${status}`);

      unmount();
    }
  });
});
