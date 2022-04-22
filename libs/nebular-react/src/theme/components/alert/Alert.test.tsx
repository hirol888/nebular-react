/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NbComponentSize, NbComponentStatus } from '@nebular-react';
import { NbAlert } from '.';

describe('NbAlert', () => {
  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  it('should set status class', () => {
    const statuses: NbComponentStatus[] = ['primary', 'success', 'info', 'warning', 'danger'];

    for (const status of statuses) {
      ({ unmount } = render(<NbAlert data-testid="alert" status={status} />));
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass(`status-${status}`);

      unmount();
    }
  });

  it('should set outline class', () => {
    const outlines: NbComponentStatus[] = ['primary', 'success', 'info', 'warning', 'danger'];

    for (const outline of outlines) {
      ({ unmount } = render(<NbAlert data-testid="alert" outline={outline} />));
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass(`outline-${outline}`);

      unmount();
    }
  });

  it('should set accent class', () => {
    const accents: NbComponentStatus[] = ['primary', 'success', 'info', 'warning', 'danger'];

    for (const accent of accents) {
      const { unmount } = render(<NbAlert data-testid="alert" accent={accent} />);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass(`accent-${accent}`);

      unmount();
    }
  });

  it('should set size class', () => {
    const sizes: NbComponentSize[] = ['tiny', 'small', 'medium', 'large', 'giant'];

    for (const size of sizes) {
      const { unmount } = render(<NbAlert data-testid="alert" size={size} />);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass(`size-${size}`);

      unmount();
    }
  });
});
